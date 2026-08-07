# whataline.com — setup

Stack: **Vite + React + Tailwind + Framer Motion** on **Vercel**, talking to **Supabase** (Postgres + Auth + Storage + Edge Functions). Email via **Zoho SMTP**. Custom domain whataline.com via Cloudflare/registrar DNS pointed at Vercel.

You'll do this once. After that the GitHub branch you push to deploys automatically.

---

## 1. Create the Supabase project

1. Sign in at https://supabase.com → **New project**
2. Name it `whataline`, region **West EU (London)** — closest to UK visitors
3. Set a strong DB password (save it in 1Password — you won't need it day-to-day)
4. Pricing tier: **Free**
5. Wait ~2 minutes for provisioning

### 1a. Run the schema

1. Project → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — should complete in <1s with no errors
4. Verify: **Table Editor** should now show 7 tables (writing_projects, film_projects, awards, services, service_samples, testimonials, contact_submissions)

### 1b. Invite Kat as an admin user

1. Project → **Authentication** → **Users** → **Add user** → **Send invitation**
2. Email: Kat's address (e.g. `kat_writes@whataline.com`)
3. Auto-confirm: **on** (skip the email confirmation step)
4. Give her a temporary password — she'll change it via `/admin/settings` after first login

### 1c. Note the credentials

Project → **Settings** → **API**, copy:

- **Project URL** → `https://abcdefgh.supabase.co`
- **anon / public key** (starts `eyJ…`)

Both go into Vercel env vars in step 3 below.

---

## 2. Set up the Edge Functions for the contact form

The contact form posts to `contact-submit`, a Supabase Edge Function that validates the
submission, scores it for spam, persists it (service role, bypasses RLS), and — for
anything not classified as spam — sends the notification email via Zoho SMTP.
`contact-token` mints the short-lived replay-protection token the form fetches on load.

### 2a. Install the Supabase CLI (one-off)

```powershell
npm install -g supabase
```

### 2b. Link this repo to your Supabase project

From the repo root:

```powershell
supabase login
supabase link --project-ref <your-project-ref>
```

Project ref = the `abcdefgh` part of your project URL.

### 2c. Deploy the functions

```powershell
supabase functions deploy contact-submit --no-verify-jwt
supabase functions deploy contact-token --no-verify-jwt
```

`--no-verify-jwt` because we want the public contact form to invoke them without an auth
header — the security boundary is the validation/scoring logic inside, not Supabase's JWT
check. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically; don't set
them yourself.

### 2d. Set the secrets

In the Supabase dashboard → **Edge Functions** → `contact-submit` → **Secrets** (shared
across both functions):

| Key | Value |
|---|---|
| `SMTP_HOST` | `smtp.zoho.eu` (or `smtp.zoho.com` if US) |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | `kat_writes@whataline.com` |
| `SMTP_PASSWORD` | Zoho **app-specific password** (Zoho Mail → Settings → Security → App passwords) |
| `EMAIL_FROM` | `kat_writes@whataline.com` |
| `EMAIL_TO` | `kat_writes@whataline.com` |
| `IP_HASH_SALT` | Random 32-byte hex string — salts the IP hash used for rate limiting. Never store raw IPs. |
| `FORM_TOKEN_SECRET` | Random 32-byte hex string — HMAC secret for the replay-protection token, shared between `contact-submit` and `contact-token` |
| `ALLOWED_REFERER_HOSTS` | `whataline.com,www.whataline.com` (add any Vercel preview host you test against) |

Don't put the actual Zoho login password — generate an app password. Generate the two
random secrets with e.g. `openssl rand -hex 32`.

---

## 3. Deploy to Vercel

1. Sign in at https://vercel.com (use GitHub login)
2. **Add New** → **Project** → import `joff1979/whataline`
3. Framework preset: **Vite** (auto-detected)
4. Root directory: leave as repo root (the `vercel.json` handles `cd frontend`)
5. Branch: **claude/vercel-migration** (the migration branch — we'll merge to `main` after testing)
6. **Environment Variables** → add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **Deploy**

First build takes ~2 minutes. You'll get a `whataline-xxx.vercel.app` URL.

---

## 4. Test on the Vercel preview URL

Visit the Vercel URL and check:

- [ ] Home page loads (video hero, palette, fonts)
- [ ] About, Writing, Films, Services, Contact all render
- [ ] `/admin/login` accepts Kat's email + temp password
- [ ] Admin → Writing → Add New: create a test project, save, see it on `/portfolio/writing`
- [ ] Admin → Films → Add New: same flow
- [ ] Upload a poster — should appear on the public page
- [ ] Contact form submission lands in Admin → Inbox AND Kat receives the notification email
- [ ] Admin → Settings: change password works

If anything breaks, the browser console + the Supabase **Logs** tab will tell you why.

---

## 5. Flip DNS to Vercel (when ready)

This is the cutover. Do it during a quiet hour.

### 5a. Lower your DNS TTL the day before

Wherever your `whataline.com` DNS is hosted (Cloudflare, GoDaddy, etc.):

- Drop the A/CNAME record TTL to **300 seconds** (5 min)
- Wait 24 hours so any caches honour the new TTL

### 5b. Add the domain in Vercel

Vercel project → **Settings** → **Domains** → **Add** → `whataline.com` and `www.whataline.com`. Vercel will show the DNS records you need.

### 5c. Update DNS

- `whataline.com` → A record → `76.76.21.21` (Vercel's anycast IP)
- `www.whataline.com` → CNAME → `cname.vercel-dns.com`

Vercel auto-issues a Let's Encrypt certificate within 1–2 minutes.

### 5d. Verify

- [ ] `https://whataline.com` loads the new site
- [ ] `https://www.whataline.com` redirects to apex (or vice versa, depending on your preference)
- [ ] Cert is valid (green padlock)

---

## 6. Decommission Azure

Only after step 5 is verified working for at least a day:

- Azure Portal → resource group → **Delete resource group**
  - This removes Static Web Apps, App Service, SQL Server, Storage Account, all in one go
- GitHub → repo settings → **Secrets** → remove the old Azure secrets:
  - `AZURE_STATIC_WEB_APPS_API_TOKEN_*`
  - `AZURE_API_PUBLISH_PROFILE`
  - any others starting `AZURE_`

Done. From this point on you're on free Vercel + free Supabase, $0/month.

---

## Day-to-day workflow

- **Push to `main`** → Vercel auto-deploys to whataline.com
- **Push to any other branch** → Vercel gives you a unique preview URL (great for feedback rounds)
- **Edit the schema** → run new SQL in Supabase SQL Editor (files in `supabase/migrations/` are applied manually, in order, on top of `supabase/schema.sql`; there's no automatic migration tracking yet)
- **Update an Edge Function** → `supabase functions deploy contact-submit` (or `contact-token`)

## When you outgrow Free tier

You won't, but if usage explodes:

- Supabase Pro: $25/mo (8 GB DB, 100 GB storage, 250 GB bandwidth)
- Vercel Pro: $20/mo per member (mostly for teams; Hobby covers a single-owner site forever)

For a portfolio site, free is plausible indefinitely.
