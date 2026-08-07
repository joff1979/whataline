// Mints a short-lived, single-use submission token for the contact form.
// Called once when the Contact page mounts — by the time a human fills in
// the form and submits, the token has been sitting in state for a while, so
// this adds no perceptible latency to the actual submission.
//
// Env vars (Supabase dashboard → Edge Functions → contact-token → Secrets):
//   FORM_TOKEN_SECRET   HMAC secret, shared with contact-submit

import { signToken } from '../_shared/formToken.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const secret = Deno.env.get('FORM_TOKEN_SECRET')!;
    const { token } = await signToken(secret);
    return new Response(JSON.stringify({ token }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('contact-token failed:', err);
    return new Response(JSON.stringify({ error: 'Could not mint token' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
