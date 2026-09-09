# Launch ROJOB on Vercel + GoDaddy domain (rojob.eu)

Yes — this is a good setup.

```
rojob.eu  →  Vercel (website + Stripe API)
email     →  Microsoft 365 (keep MX at GoDaddy / Microsoft)
```

---

## Part A — Deploy on Vercel (click by click)

1. Open **https://vercel.com** → Sign up / Log in  
   (use **Continue with GitHub** — your `Taha-Hanim` account)
2. Click **Add New…** → **Project**
3. Import **`Taha-Hanim/rojob`** (or the company repo if that’s the one you want live)
4. Framework Preset: **Vite**
5. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Click **Environment Variables** and add all from `.env.local`:

| Name | Example |
|---|---|
| `VITE_FIREBASE_API_KEY` | (your key) |
| `VITE_FIREBASE_AUTH_DOMAIN` | `rojob-ae6ff.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `rojob-ae6ff` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `rojob-ae6ff.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (your id) |
| `VITE_FIREBASE_APP_ID` | (your id) |
| `VITE_CLOUDINARY_CLOUD_NAME` | `disuqgzwt` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `rojobx` |
| `VITE_SITE_MODE` | `prelaunch` |
| `VITE_CURRENCY` | `PLN` |
| `SITE_URL` | `https://rojob.eu` (or your `*.vercel.app` URL first) |
| `STRIPE_SECRET_KEY` | `sk_test_...` (optional until payments) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (optional) |

7. Click **Deploy**
8. Wait → open the `https://something.vercel.app` link  
   Site should work there first.

---

## Part B — Connect rojob.eu from GoDaddy

### On Vercel
1. Project → **Settings** → **Domains**
2. Add `rojob.eu`
3. Add `www.rojob.eu`
4. Vercel shows DNS records — **keep that page open**

### On GoDaddy (keep email working)
1. GoDaddy → **My Products** → **Domains** → **rojob.eu** → **DNS** / **Manage DNS**
2. **Do not delete** MX / TXT records for Microsoft 365 email
3. Add what Vercel asks for (usually):

**For root domain `rojob.eu`:**
- Type: **A**
- Name: `@`
- Value: Vercel IP(s) shown in the dashboard (often `76.76.21.21`)

**For `www`:**
- Type: **CNAME**
- Name: `www`
- Value: `cname.vercel-dns.com` (or exact value Vercel shows)

4. Save  
5. Wait 15 minutes–a few hours  
6. In Vercel Domains, status becomes **Valid**
7. Open **https://rojob.eu**

### Email check after DNS change
- Outlook → send/receive with `care@rojob.eu`  
- If mail breaks, restore MX/TXT from Microsoft 365 (don’t touch those records when editing A/CNAME for Vercel)

---

## Part C — Firebase

Firebase → Authentication → Authorized domains → add:

- `your-project.vercel.app`
- `rojob.eu`
- `www.rojob.eu`

---

## After first Vercel deploy works

Push the latest code (with `vercel.json` + `/api` Stripe routes) from this machine to GitHub, then Vercel auto-redeploys.
