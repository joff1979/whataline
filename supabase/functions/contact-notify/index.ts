// Supabase Edge Function — sends a notification email to Kat when someone
// submits the contact form. Invoked from the frontend after the row is saved.
//
// Env vars (set in Supabase dashboard → Edge Functions → contact-notify):
//   SMTP_HOST       smtp.zoho.eu  (EU accounts) or smtp.zoho.com
//   SMTP_PORT       465  ← recommended (implicit TLS); 587 = STARTTLS also works
//   SMTP_USERNAME   e.g. kat_writes@whataline.com
//   SMTP_PASSWORD   Zoho app-specific password (Settings → Security → App Passwords)
//   EMAIL_FROM      e.g. kat_writes@whataline.com
//   EMAIL_TO        e.g. kat_writes@whataline.com (where notifications land)

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const payload = (await req.json()) as ContactPayload;

    const subject = payload.subject?.trim()
      ? `New message from ${payload.name}: ${payload.subject}`
      : `New message from ${payload.name}`;

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
      from:    Deno.env.get('EMAIL_FROM')!,
      to:      Deno.env.get('EMAIL_TO')!,
      replyTo: `${payload.name} <${payload.email}>`,
      subject,
      content: 'auto',
      html:    buildHtml(payload),
    });

    await client.close();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('contact-notify failed:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status:  500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});

function buildHtml(p: ContactPayload): string {
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
