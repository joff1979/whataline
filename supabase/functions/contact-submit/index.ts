// Single trusted entry point for the public contact form. Replaces the old
// browser -> direct RLS insert -> contact-notify flow: this function runs
// with the service_role key (bypasses RLS) and is the only thing allowed to
// write to contact_submissions.
//
// Rejection paths that indicate botting (honeypot, rate limit, bad/replayed
// token, high content score) return the SAME 200 { ok: true } success shape
// as a genuine submission — bots get no signal to tune against. Only real
// field-validation failures return 400.
//
// Env vars (Supabase dashboard → Edge Functions → contact-submit → Secrets):
//   IP_HASH_SALT           salt for hashing the submitter IP (never store raw IPs)
//   FORM_TOKEN_SECRET       HMAC secret, shared with contact-token
//   ALLOWED_REFERER_HOSTS   comma-separated hostnames treated as "on-domain"
//   SMTP_HOST / SMTP_PORT / SMTP_USERNAME / SMTP_PASSWORD  (existing, reused)
//   EMAIL_FROM / EMAIL_TO                                   (existing, reused)
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically by Supabase.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';
import { scoreContent, emailDotCount } from '../_shared/spamScoring.ts';
import { verifyToken } from '../_shared/formToken.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_BODY_BYTES = 32 * 1024;
const SPAM_THRESHOLD = 60;
const QUARANTINE_THRESHOLD = 30;
const DUPLICATE_WINDOW_DAYS = 7;

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string | null;
  message?: string;
  companyWebsite?: string;
  dwellMs?: number;
  token?: string;
}

// Excludes <>,"' (address-list/quoting structure) and ?&= (URI query
// structure — a submitted email is later rendered in unencoded mailto:
// links in the admin panel, so these can't be allowed through here either).
const EMAIL_RE = /^[^\s<>,"'?&=]+@[^\s<>,"'?&=]+\.[^\s<>,"'?&=]+$/;

// Minimal shape of the pieces of supabase-js this handler touches — lets
// tests inject a lightweight fake instead of a live Supabase connection.
// deno-lint-ignore no-explicit-any
export type AdminClient = any;

export interface ContactSubmitDeps {
  admin: AdminClient;
  sendEmail: typeof sendNotification;
  now: () => number;
}

function defaultDeps(): ContactSubmitDeps {
  return {
    admin: createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!),
    sendEmail: sendNotification,
    now: () => Date.now(),
  };
}

export async function handleContactSubmit(req: Request, deps: ContactSubmitDeps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 400);

  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Please check the highlighted fields.' }, 400);
  }

  let payload: ContactPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: 'Please check the highlighted fields.' }, 400);
  }

  // ── Field validation — the only path that returns a real error ───────────
  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();
  const subjectRaw = (payload.subject ?? '').trim();
  const message = (payload.message ?? '').trim();

  if (name.length < 1 || name.length > 100) {
    return json({ ok: false, error: 'Please check the highlighted fields.' }, 400);
  }
  if (email.length < 1 || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Please check the highlighted fields.' }, 400);
  }
  if (subjectRaw.length > 150) {
    return json({ ok: false, error: 'Please check the highlighted fields.' }, 400);
  }
  if (message.length < 10 || message.length > 5000) {
    return json({ ok: false, error: 'Please check the highlighted fields.' }, 400);
  }

  // ── Header-injection guard (non-negotiable) ───────────────────────────────
  const cleanName = stripHeaderChars(name);
  const cleanEmail = stripHeaderChars(email);
  const subject = subjectRaw ? stripHeaderChars(subjectRaw) : null;
  const cleanMessage = message.replace(/\0/g, '');

  const { admin, sendEmail, now: nowFn } = deps;

  const ip = clientIp(req);
  const ipHash = await sha256Hex(ip + Deno.env.get('IP_HASH_SALT')!);
  const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 512);
  const referer = req.headers.get('referer');
  const allowedRefererHosts = (Deno.env.get('ALLOWED_REFERER_HOSTS') ?? '')
    .split(',').map((h) => h.trim()).filter(Boolean);

  const reasons: string[] = [];
  let forcedSpam = false;

  // ── Rate limiting (by hashed IP) ──────────────────────────────────────────
  const now = nowFn();
  const since60 = new Date(now - 60 * 60 * 1000).toISOString();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: c60 }, { count: c24h }] = await Promise.all([
    admin.from('contact_submissions').select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash).gte('created_at', since60),
    admin.from('contact_submissions').select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash).gte('created_at', since24h),
  ]);

  if ((c60 ?? 0) >= 3) { forcedSpam = true; reasons.push('rate_limited_hourly'); }
  if ((c24h ?? 0) >= 8) { forcedSpam = true; reasons.push('rate_limited_daily'); }

  // ── Submission token (replay protection) ──────────────────────────────────
  const dwellMs: number | null =
    typeof payload.dwellMs === 'number' && Number.isFinite(payload.dwellMs) ? payload.dwellMs : null;

  const verdict = await verifyToken(payload.token, Deno.env.get('FORM_TOKEN_SECRET')!);
  if (verdict.kind === 'invalid') {
    forcedSpam = true;
    reasons.push('bad_token');
  } else {
    const { error: nonceError } = await admin.from('used_form_nonces').insert({ nonce: verdict.payload.nonce });
    if (nonceError) {
      if (nonceError.code === '23505') {
        // Nonce already redeemed — replay.
        forcedSpam = true;
        reasons.push('replayed_token');
      } else {
        console.error('contact-submit nonce insert failed:', nonceError);
      }
    } else if (verdict.kind === 'expired') {
      // Deliberately NOT force-rejected: a hard reject here would silently
      // and permanently drop a real visitor who left the tab open past the
      // 30-minute TTL. Scored instead so it stacks with other signals.
      reasons.push('token_expired');
    }
  }

  // ── Honeypot ───────────────────────────────────────────────────────────────
  if ((payload.companyWebsite ?? '').trim().length > 0) {
    forcedSpam = true;
    reasons.push('honeypot');
  }

  // ── Content scoring (always runs so spam_reasons stays complete) ─────────
  const { score: contentScore, reasons: contentReasons } = scoreContent({
    name: cleanName,
    subject,
    message: cleanMessage,
    referer,
    allowedRefererHosts,
    dwellMs,
  });
  reasons.push(...contentReasons);

  let score = contentScore;
  if (emailDotCount(cleanEmail) >= 4) { score += 15; reasons.push('gmail_dot_variant'); }

  const messageHash = await sha256Hex(cleanMessage.toLowerCase());
  const since7d = new Date(now - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { count: dupCount } = await admin.from('contact_submissions').select('id', { count: 'exact', head: true })
    .eq('message_hash', messageHash).gte('created_at', since7d);
  if ((dupCount ?? 0) > 0) { score += 50; reasons.push('duplicate_message'); }

  const status: 'clean' | 'spam' | 'quarantine' =
    forcedSpam || score >= SPAM_THRESHOLD ? 'spam' :
    score >= QUARANTINE_THRESHOLD ? 'quarantine' : 'clean';

  // ── Persist first — every outcome gets a row, nothing is silently dropped ─
  const { data: inserted, error: insertError } = await admin.from('contact_submissions').insert({
    name: cleanName,
    email: cleanEmail,
    subject,
    message: cleanMessage,
    status,
    spam_score: score,
    spam_reasons: reasons,
    ip_hash: ipHash,
    user_agent: userAgent,
    referer,
    dwell_ms: dwellMs,
    message_hash: messageHash,
  }).select('id').single();

  if (insertError || !inserted) {
    console.error('contact-submit insert failed:', insertError);
    return json({ ok: false, error: 'Something went wrong. Please email us directly.' }, 500);
  }

  // ── Email second — failure never fails the request ────────────────────────
  if (status !== 'spam') {
    try {
      await sendEmail({ name: cleanName, email: cleanEmail, subject, message: cleanMessage, quarantine: status === 'quarantine' });
      await admin.from('contact_submissions').update({ emailed_at: new Date(now).toISOString() }).eq('id', inserted.id);
    } catch (err) {
      console.error('contact-submit email failed:', err);
      await admin.from('contact_submissions').update({ email_error: String(err) }).eq('id', inserted.id);
    }
  }

  return json({ ok: true, message: 'Thank you — your message has been received.' }, 200);
}

// Only start the server when this module is the entry point (Supabase's
// runtime invokes it directly) — not when imported by index.test.ts, which
// would otherwise try to bind a real port during `deno test`.
if (import.meta.main) {
  Deno.serve((req) => handleContactSubmit(req, defaultDeps()));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

function stripHeaderChars(s: string): string {
  return s.replace(/[\r\n\0]/g, '');
}

// Wraps a display name as an RFC 5322 quoted-string, escaping the two
// characters quoted-strings use for escaping. Inside a quoted-string,
// <, >, and , are literal — they can't be parsed as address-list structure,
// which is what stops a name like `Foo <a@evil.com>, Bar` from injecting a
// second Reply-To recipient.
export function quoteDisplayName(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') ?? 'unknown';
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sendNotification(p: { name: string; email: string; subject: string | null; message: string; quarantine: boolean }): Promise<void> {
  const baseSubject = p.subject ? `New message from ${p.name}: ${p.subject}` : `New message from ${p.name}`;
  const subject = (p.quarantine ? `[Possible spam] ${baseSubject}` : baseSubject).slice(0, 150);

  const port = Number(Deno.env.get('SMTP_PORT') ?? 465);
  const client = new SMTPClient({
    connection: {
      hostname: Deno.env.get('SMTP_HOST')!,
      port,
      // port 465 = implicit TLS (SSL); port 587 = STARTTLS (no immediate TLS)
      tls: port !== 587,
      auth: {
        username: Deno.env.get('SMTP_USERNAME')!,
        password: Deno.env.get('SMTP_PASSWORD')!,
      },
    },
  });

  await client.send({
    from: Deno.env.get('EMAIL_FROM')!,
    to: Deno.env.get('EMAIL_TO')!,
    replyTo: `${quoteDisplayName(p.name)} <${p.email}>`,
    subject,
    content: 'auto',
    html: buildHtml(p),
  });

  await client.close();
}

function buildHtml(p: { name: string; email: string; subject: string | null; message: string }): string {
  const subjectRow = p.subject
    ? `<tr><td style="padding:4px 0;color:#A6C6C9;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Subject</td></tr>
       <tr><td style="padding:0 0 16px;font-size:15px;color:#004040;">${escape(p.subject)}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4EEEF;font-family:'Raleway',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EEEF;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FAF7F8;max-width:600px;width:100%;">
        <tr>
          <td style="background:#004040;padding:32px 40px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#D9C0BE;">What A Line</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:400;color:#FAF7F8;font-family:Amaranth,sans-serif;">New contact message</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="padding:4px 0;color:#A6C6C9;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">From</td></tr>
              <tr><td style="padding:0 0 4px;font-size:16px;color:#004040;font-weight:500;">${escape(p.name)}</td></tr>
              <tr><td style="padding:0 0 16px;font-size:14px;color:#008080;">${escape(p.email)}</td></tr>
              ${subjectRow}
              <tr><td style="padding:4px 0;color:#A6C6C9;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Message</td></tr>
              <tr><td style="padding:12px 16px;background:#F4EEEF;border-left:3px solid #C9A9A6;font-size:15px;color:#004040;line-height:1.65;white-space:pre-wrap;">${escape(p.message)}</td></tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#A6C6C9;">
              Hit <strong>Reply</strong> to respond directly to ${escape(p.name)} at ${escape(p.email)}.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #EEE5E4;">
            <p style="margin:0;font-size:11px;color:#D9C0BE;letter-spacing:0.08em;">
              whataline.com · admin inbox → /admin/contact
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
