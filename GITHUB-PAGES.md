# Host on GitHub Pages (no Cloudflare)

Your site will be at:

**https://taha-hanim.github.io/rojob/**

## 1. Enable GitHub Pages

1. Open **https://github.com/Taha-Hanim/rojob**
2. Click **Settings**
3. Left menu → **Pages**
4. Under **Build and deployment** → **Source** → choose **GitHub Actions**
5. Save

## 2. Add secrets (so Firebase / Cloudinary work online)

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

| Secret name | Value (from your `.env.local`) |
|---|---|
| `VITE_FIREBASE_API_KEY` | your key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `rojob-ae6ff.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `rojob-ae6ff` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `rojob-ae6ff.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | your id |
| `VITE_FIREBASE_APP_ID` | your app id |
| `VITE_FIREBASE_MEASUREMENT_ID` | optional |
| `VITE_CLOUDINARY_CLOUD_NAME` | `disuqgzwt` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `rojobx` |
| `VITE_SITE_MODE` | `prelaunch` |
| `VITE_CURRENCY` | `PLN` |

## 3. Push code (triggers deploy)

```bash
cd /Users/tahahanim/Desktop/ROJOB
git add .
git commit -m "Host ROJOB on GitHub Pages"
git push origin master
```

4. Repo → **Actions** tab → wait for **Deploy to GitHub Pages** to finish green  
5. Open **https://taha-hanim.github.io/rojob/**

## 4. Firebase authorized domains

Firebase Console → Authentication → Settings → Authorized domains → add:

- `taha-hanim.github.io`
- later `rojob.eu` when you connect the domain

## Note about Stripe / payments

GitHub Pages only hosts the **static website**.  
Stripe server functions (`/api/...`) need a separate backend later (or Cloudflare Functions).  
The shop UI, portfolio, Firebase, and Cloudinary still work.

## Optional: connect rojob.eu later

1. GitHub → Settings → Pages → Custom domain → `rojob.eu`
2. At GoDaddy DNS add what GitHub shows (usually A records or CNAME)
3. Rebuild with `VITE_BASE=/` so asset paths are correct
