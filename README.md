# ROJOB — Warsaw · 52°N

Ultra-luxury fashion house website for **rojob.eu**.

See **[LAUNCH.md](./LAUNCH.md)** for Firebase Firestore fix, Stripe, Microsoft 365 email, and Cloudflare DNS/hosting.

## Stack

| Layer | Tool |
|---|---|
| Site | Vite + React → Cloudflare Pages |
| Auth / DB | Firebase (Spark) |
| Images | Cloudinary |
| Payments | Stripe Checkout (Pages Functions) |
| Email | Microsoft 365 (GoDaddy) |
| Domain | rojob.eu |

## Run

```bash
npm install
cp .env.example .env.local   # fill keys
npm run dev
```

Admin: `/admin` (Firebase Auth user, e.g. `ceo@rojob.eu`).

## Modes

- `VITE_SITE_MODE=prelaunch` — editorial + private access (default)
- `VITE_SITE_MODE=commerce` — bag + Stripe when keys + prices are set
