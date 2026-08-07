import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { handleContactSubmit, quoteDisplayName, type ContactSubmitDeps } from './index.ts';
import { signToken } from '../_shared/formToken.ts';

const SECRET = 'test-form-token-secret';
Deno.env.set('FORM_TOKEN_SECRET', SECRET);
Deno.env.set('IP_HASH_SALT', 'test-salt');
Deno.env.set('ALLOWED_REFERER_HOSTS', 'whataline.com');

interface EmailCall { name: string; email: string; subject: string | null; message: string; quarantine: boolean }

// A minimal fake of the subset of supabase-js used by contact-submit. Real
// integration testing against Supabase isn't available in this environment
// (no credentials) — this fake lets the request-handling logic (honeypot,
// header stripping, token replay, classification) be verified without one.
function makeFakeAdmin(opts: {
  hourlyCount?: number;
  dailyCount?: number;
  duplicateCount?: number;
  usedNonces?: Set<string>;
} = {}) {
  const usedNonces = opts.usedNonces ?? new Set<string>();
  const insertedRows: Record<string, unknown>[] = [];

  const admin = {
    from(table: string) {
      return {
        select(_cols: string, _selOpts?: unknown) {
          let field = '';
          const builder = {
            eq(f: string, _v: string) { field = f; return builder; },
            gte(_f: string, v: string) {
              let count = 0;
              if (field === 'message_hash') count = opts.duplicateCount ?? 0;
              else if (field === 'ip_hash') {
                const isHourWindow = Date.now() - Date.parse(v) <= 65 * 60 * 1000;
                count = isHourWindow ? (opts.hourlyCount ?? 0) : (opts.dailyCount ?? 0);
              }
              return Promise.resolve({ count, error: null });
            },
          };
          return builder;
        },
        insert(row: Record<string, unknown>) {
          if (table === 'used_form_nonces') {
            const nonce = row.nonce as string;
            if (usedNonces.has(nonce)) return Promise.resolve({ error: { code: '23505' } });
            usedNonces.add(nonce);
            return Promise.resolve({ error: null });
          }
          insertedRows.push(row);
          const builder = {
            select() { return builder; },
            single() { return Promise.resolve({ data: { id: insertedRows.length }, error: null }); },
          };
          return builder;
        },
        update(_patch: Record<string, unknown>) {
          return { eq: (_f: string, _v: unknown) => Promise.resolve({ error: null }) };
        },
      };
    },
  };

  return { admin, insertedRows, usedNonces };
}

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('https://example.supabase.co/functions/v1/contact-submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', referer: 'https://whataline.com/contact' },
    body: JSON.stringify(body),
  });
}

async function deps(fakeAdmin: ReturnType<typeof makeFakeAdmin>['admin']): Promise<{ deps: ContactSubmitDeps; emails: EmailCall[] }> {
  const emails: EmailCall[] = [];
  return {
    deps: {
      admin: fakeAdmin,
      sendEmail: async (p) => { emails.push(p); },
      now: () => Date.now(),
    },
    emails,
  };
}

async function validPayload(overrides: Record<string, unknown> = {}) {
  const { token } = await signToken(SECRET);
  return {
    name: 'Jamie Rollinson',
    email: 'jamie@example.com',
    subject: 'Script supervision enquiry',
    message: 'Hi Kat, I loved your latest short and would love to talk about an upcoming shoot.',
    companyWebsite: '',
    dwellMs: 8000,
    token,
    ...overrides,
  };
}

// Spec acceptance case 2: honeypot filled → spam, no email, 200 { ok: true }.
Deno.test('honeypot filled classifies as spam, sends no email, still returns 200 ok', async () => {
  const { admin, insertedRows } = makeFakeAdmin();
  const { deps: d, emails } = await deps(admin);

  const payload = await validPayload({ companyWebsite: 'https://spammer.example' });
  const res = await handleContactSubmit(makeRequest(payload), d);

  assertEquals(res.status, 200);
  assertEquals(await res.json(), { ok: true, message: 'Thank you — your message has been received.' });
  assertEquals(insertedRows.length, 1);
  assertEquals(insertedRows[0].status, 'spam');
  assert((insertedRows[0].spam_reasons as string[]).includes('honeypot'));
  assertEquals(emails.length, 0);
});

// Spec acceptance case 4: CR/LF injected into the name field must not reach
// the email headers — no extra recipients.
Deno.test('CR/LF injection in name is stripped before it reaches the email send', async () => {
  const { admin } = makeFakeAdmin();
  const { deps: d, emails } = await deps(admin);

  const payload = await validPayload({ name: 'Evil\r\nBcc: attacker@example.com' });
  const res = await handleContactSubmit(makeRequest(payload), d);

  assertEquals(res.status, 200);
  assertEquals(emails.length, 1);
  // The important invariant: no raw CR/LF survives into the header value —
  // an attacker cannot fold in an extra header line (e.g. "Bcc: ...").
  assertEquals(/[\r\n]/.test(emails[0].name), false);
  assertEquals(emails[0].name, 'EvilBcc: attacker@example.com');
});

// A name crafted to look like a second, well-formed mailbox
// ("Foo <a@evil.com>, Bar") must not let an attacker inject a second
// Reply-To recipient. Quoting the display name is what stops this — the
// receiving mail client sees a single quoted-string, not an address list.
Deno.test('quoteDisplayName neutralises Reply-To address-list injection', () => {
  const malicious = 'Legit Name <attacker@evil.com>, Real';
  const quoted = quoteDisplayName(malicious);

  // Must be a single RFC 5322 quoted-string wrapping the whole value.
  assertEquals(quoted, '"Legit Name <attacker@evil.com>, Real"');
  assertEquals(quoted.startsWith('"') && quoted.endsWith('"'), true);

  // Embedded quotes/backslashes must be escaped so they can't terminate the
  // quoted-string early and re-open address-list parsing.
  assertEquals(quoteDisplayName('Say "hi" \\ bye'), '"Say \\"hi\\" \\\\ bye"');
});

// Spec acceptance case 7: a replayed token is accepted once and silently
// dropped (classified spam, no email) on reuse.
Deno.test('a replayed submission token is accepted once, then rejected as spam', async () => {
  const { admin, insertedRows } = makeFakeAdmin();
  const { deps: d, emails } = await deps(admin);

  const payload = await validPayload();
  const first = await handleContactSubmit(makeRequest(payload), d);
  const second = await handleContactSubmit(makeRequest(payload), d);

  assertEquals(first.status, 200);
  assertEquals(second.status, 200);
  assertEquals(insertedRows.length, 2);
  assertEquals(insertedRows[0].status, 'clean');
  assertEquals(insertedRows[1].status, 'spam');
  assert((insertedRows[1].spam_reasons as string[]).includes('replayed_token'));
  assertEquals(emails.length, 1); // only the first submission was emailed
});

// Spec acceptance case 6: missing/malformed token → silently dropped (spam).
Deno.test('a missing token classifies as spam', async () => {
  const { admin, insertedRows } = makeFakeAdmin();
  const { deps: d } = await deps(admin);

  const payload = await validPayload({ token: '' });
  const res = await handleContactSubmit(makeRequest(payload), d);

  assertEquals(res.status, 200);
  assertEquals(insertedRows[0].status, 'spam');
  assert((insertedRows[0].spam_reasons as string[]).includes('bad_token'));
});

// Spec acceptance case 5: >3 submissions/60min from the same IP hash →
// silently dropped.
Deno.test('rate limiting forces spam classification once the hourly cap is hit', async () => {
  const { admin, insertedRows } = makeFakeAdmin({ hourlyCount: 3 });
  const { deps: d, emails } = await deps(admin);

  const payload = await validPayload();
  const res = await handleContactSubmit(makeRequest(payload), d);

  assertEquals(res.status, 200);
  assertEquals(insertedRows[0].status, 'spam');
  assert((insertedRows[0].spam_reasons as string[]).includes('rate_limited_hourly'));
  assertEquals(emails.length, 0);
});

// Genuine field-validation failures are the only path that returns a
// non-200, and it must not have persisted anything.
Deno.test('a message that is too short returns a real 400 validation error', async () => {
  const { admin, insertedRows } = makeFakeAdmin();
  const { deps: d } = await deps(admin);

  const payload = await validPayload({ message: 'too short' });
  const res = await handleContactSubmit(makeRequest(payload), d);

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.ok, false);
  assertEquals(insertedRows.length, 0);
});

Deno.test('a clean, legitimate submission is persisted as clean and emailed', async () => {
  const { admin, insertedRows } = makeFakeAdmin();
  const { deps: d, emails } = await deps(admin);

  const res = await handleContactSubmit(makeRequest(await validPayload()), d);

  assertEquals(res.status, 200);
  assertEquals(insertedRows[0].status, 'clean');
  assertEquals(emails.length, 1);
  assertEquals(emails[0].quarantine, false);
});
