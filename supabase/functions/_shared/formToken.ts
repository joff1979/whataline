// Replay-protected submission token. A minimal HMAC-signed structure — no
// JWT library needed, crypto.subtle is a standard Deno API.
//
// Payload is signed but not encrypted (nothing sensitive in it). Verification
// distinguishes "expired" from "invalid" so the caller can treat a slow
// legitimate visitor differently from a forged/tampered token — see
// contact-submit/index.ts.

const TTL_SECONDS = 30 * 60;
const CLOCK_SKEW_TOLERANCE_SECONDS = 60;

export interface TokenPayload {
  nonce: string;
  iat: number;
}

export type TokenVerdict =
  | { kind: 'valid'; payload: TokenPayload }
  | { kind: 'expired'; payload: TokenPayload }
  | { kind: 'invalid' };

export async function signToken(secret: string): Promise<{ token: string; nonce: string }> {
  const payload: TokenPayload = { nonce: crypto.randomUUID(), iat: Math.floor(Date.now() / 1000) };
  const json = JSON.stringify(payload);
  const sig = await hmac(json, secret);
  return { token: `${toB64Url(strToBytes(json))}.${toB64Url(sig)}`, nonce: payload.nonce };
}

export async function verifyToken(token: string | undefined | null, secret: string): Promise<TokenVerdict> {
  if (!token || typeof token !== 'string') return { kind: 'invalid' };
  const parts = token.split('.');
  if (parts.length !== 2) return { kind: 'invalid' };
  const [encJson, encSig] = parts;

  let json: string;
  let payload: TokenPayload;
  try {
    json = bytesToStr(fromB64Url(encJson));
    payload = JSON.parse(json) as TokenPayload;
    if (typeof payload.nonce !== 'string' || typeof payload.iat !== 'number') {
      return { kind: 'invalid' };
    }
  } catch {
    return { kind: 'invalid' };
  }

  let expectedSig: Uint8Array;
  let providedSig: Uint8Array;
  try {
    expectedSig = await hmac(json, secret);
    providedSig = fromB64Url(encSig);
  } catch {
    return { kind: 'invalid' };
  }

  if (!timingSafeEqual(providedSig, expectedSig)) return { kind: 'invalid' };

  const ageSeconds = Math.floor(Date.now() / 1000) - payload.iat;
  if (ageSeconds > TTL_SECONDS || ageSeconds < -CLOCK_SKEW_TOLERANCE_SECONDS) {
    return { kind: 'expired', payload };
  }
  return { kind: 'valid', payload };
}

async function hmac(message: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    strToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, strToBytes(message));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function strToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function bytesToStr(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}

function toB64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(b64url: string): Uint8Array {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
