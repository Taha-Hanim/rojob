# ROJOB — Launch, email, payments & hosting

## Status check (your keys)


| Service                             | Status                     | Action needed                                              |
| ----------------------------------- | -------------------------- | ---------------------------------------------------------- |
| Cloudinary (`disuqgzwt` / `rojobx`) | Working                    | None                                                       |
| Firebase Auth API                   | Working                    | Confirm Email/Password enabled; user `ceo@rojob.eu` exists |
| Firestore                           | **403 — not readable yet** | Create DB + paste rules (below)                            |
| Stripe                              | Code ready                 | Add keys (below)                                           |
| Email @rojob.eu                     | Domain/M365 purchased      | Keep MX on Microsoft; site DNS on Cloudflare               |


Your live values are in `.env.local` (gitignored).  
`.env.example` stays empty as a template — do not paste secrets there into git.

---



## 1. Fix Firestore (required now)

Firebase Console → **Build → Firestore Database**

1. If no database: **Create database** → start in **production mode** (or test, then lock down).
2. Location: pick closest EU (e.g. `europe-west`).
3. **Rules** tab → paste the contents of `firestore.rules` from this repo → **Publish**.
4. **Authentication → Settings → Authorized domains**
  Add: `localhost`, `rojob.eu`, `www.rojob.eu`, and your `*.pages.dev` hostname after Cloudflare deploy.

Then open the site → `/admin` → sign in as `ceo@rojob.eu` → **Setup → Seed database**.

Until Firestore works, the shop falls back to seed products in the browser.

---



## 2. Stripe setup

1. Create account at [stripe.com](https://stripe.com) (activate Poland / PLN).
2. Developers → **API keys**:
  - Put `pk_test_...` in `.env.local` as `VITE_STRIPE_PUBLISHABLE_KEY=`
  - Put `sk_test_...` in Cloudflare Pages env as `STRIPE_SECRET_KEY` (never in `VITE_`)
3. Also set in Cloudflare:
  - `SITE_URL=https://rojob.eu` (or your pages.dev URL while testing)
4. In `.env.local` set:
  ```
   VITE_SITE_MODE=commerce
  ```
5. In `/admin`, set real **prices** and `status: available` on products.

Checkout flow: bag → checkout form → Stripe hosted page (card / Apple Pay / Google Pay when available) → `/order-confirmed?session_id=...` → order written to Firestore.

BLIK: enable later in Stripe Dashboard → Payment methods (PL).

Local tip: Pages Functions only run on Cloudflare (or `npx wrangler pages dev dist`). Vite alone cannot serve `/api/*`.

---



## 3. Email (Microsoft 365 from GoDaddy)

You already bought **rojob.eu** + Microsoft 365 mail. Keep mail on Microsoft; put the **website** on Cloudflare.

### DNS split (correct setup)

1. Cloudflare → Add site `rojob.eu` → Free plan.
2. Cloudflare shows two nameservers → set them at GoDaddy → Domain → Nameservers.
3. In Cloudflare DNS, ensure **Microsoft 365 mail records** exist and are **DNS only** (grey cloud), not Proxied:
  - **MX** → Microsoft (often `*.mail.protection.outlook.com`)
  - **TXT** SPF (often `v=spf1 include:spf.protection.outlook.com ...`)
  - **CNAME** / **TXT** for DKIM (from Microsoft 365 admin)
  - Optional **TXT** DMARC (`v=DMARC1; p=none; ...`)
4. Website records (Proxied / orange cloud):
  - `@` and `www` → Cloudflare Pages custom domain (auto when you attach domain)

**Do not** delete MX when moving nameservers. Copy them from GoDaddy / Microsoft first if Cloudflare’s scan misses them.

### Mailboxes to create (Microsoft 365 admin)

Suggested:


| Address                             | Use                            |
| ----------------------------------- | ------------------------------ |
| `ceo@rojob.eu`                      | Already exists (admin login)   |
| `hello@rojob.eu` or `care@rojob.eu` | Customer care                  |
| `press@rojob.eu`                    | Press                          |
| `orders@rojob.eu`                   | Order notifications (optional) |


Update placeholders on `/contact` and legal pages with the real addresses.

### Sending from the website

- **Newsletter / contact forms** currently save to Firestore / localStorage.
- For real outbound mail later: Resend, SendGrid, or Microsoft Graph — not required for launch of the static+Firebase site.
- Stripe sends its own payment receipts; atelier can reply from `care@rojob.eu`.

---



## 4. Best hosting path for ROJOB

**Recommended: Cloudflare Pages (free) + Firebase + Cloudinary + Stripe**

```
rojob.eu  →  Cloudflare Pages (site + /api Stripe functions)
              Firebase (Auth, Firestore)
              Cloudinary (images)
              Microsoft 365 (email only)
```



### Deploy steps

1. Push this repo to GitHub.
2. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect repo.
3. Build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
4. Environment variables (Production + Preview):


| Name                           | Value                               |
| ------------------------------ | ----------------------------------- |
| All `VITE_*` from `.env.local` | same                                |
| `STRIPE_SECRET_KEY`            | `sk_test_...` / later `sk_live_...` |
| `SITE_URL`                     | `https://rojob.eu`                  |


1. Deploy → you get `something.pages.dev`.
2. Custom domains → add `rojob.eu` and `www.rojob.eu`.
3. Nameservers at GoDaddy → Cloudflare (email MX stay as above).

SPA routing is handled by `public/_redirects`.

### Why not Firebase Hosting / Vercel / GoDaddy hosting?

- Firebase Hosting works, but you already need Cloudflare for DNS/CDN and Pages Functions for Stripe without upgrading Firebase to Blaze.
- GoDaddy web hosting is slower and fights the M365 + modern JAMstack setup.
- Cloudflare Pages is free, fast in EU, and matches this architecture.

---



## 5. Go-live checklist

- [ ] Firestore created + `firestore.rules` published  
- [ ] `/admin` login with `ceo@rojob.eu` → Seed database  
- [ ] Cloudinary uploads work from admin  
- [ ] Stripe test keys + one test payment  
- [ ] `VITE_SITE_MODE=commerce` + product prices  
- [ ] Cloudflare Pages deploy + `rojob.eu`  
- [ ] MX/SPF/DKIM grey-cloud (email works)  
- [ ] Replace legal `[PLACEHOLDERS]` after company registration  
- [ ] Switch Stripe to live keys when ready  

---



## Quick commands

```bash
cp .env.example .env.local   # then fill values (already done on this machine)
npm run dev
npm run build
```

