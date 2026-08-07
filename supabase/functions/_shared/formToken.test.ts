import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { signToken, verifyToken } from './formToken.ts';

const SECRET = 'test-form-token-secret';

Deno.test('a freshly minted token verifies as valid', async () => {
  const { token } = await signToken(SECRET);
  const verdict = await verifyToken(token, SECRET);
  assertEquals(verdict.kind, 'valid');
});

Deno.test('a token older than the 30-minute TTL verifies as expired, not invalid', async () => {
  const payload = { nonce: 'test-nonce', iat: Math.floor(Date.now() / 1000) - 31 * 60 };
  const token = await signWithPayload(payload, SECRET);
  const verdict = await verifyToken(token, SECRET);
  assertEquals(verdict.kind, 'expired');
});

Deno.test('a token signed with the wrong secret is invalid', async () => {
  const { token } = await signToken('a-different-secret');
  const verdict = await verifyToken(token, SECRET);
  assertEquals(verdict.kind, 'invalid');
});

Deno.test('a tampered payload is invalid', async () => {
  const { token } = await signToken(SECRET);
  const [, encSig] = token.split('.');
  const tamperedJson = btoa(JSON.stringify({ nonce: 'someone-elses-nonce', iat: Math.floor(Date.now() / 1000) }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const verdict = await verifyToken(`${tamperedJson}.${encSig}`, SECRET);
  assertEquals(verdict.kind, 'invalid');
});

Deno.test('malformed tokens are invalid, not exceptions', async () => {
  assertEquals((await verifyToken('not-a-token', SECRET)).kind, 'invalid');
  assertEquals((await verifyToken('', SECRET)).kind, 'invalid');
  assertEquals((await verifyToken(undefined, SECRET)).kind, 'invalid');
  assertEquals((await verifyToken('a.b.c', SECRET)).kind, 'invalid');
});

// Signs an arbitrary payload (bypassing signToken's own nonce/iat generation)
// so expiry can be tested deterministically.
async function signWithPayload(payload: { nonce: string; iat: number }, secret: string): Promise<string> {
  const json = JSON.stringify(payload);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(json)));
  const b64url = (bytes: Uint8Array) => {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  return `${b64url(new TextEncoder().encode(json))}.${b64url(sig)}`;
}
