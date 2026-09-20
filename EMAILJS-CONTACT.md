# Contact form → EmailJS

The contact form sends every enquiry to **`info@rojob.eu`** (via `VITE_CONTACT_EMAIL`).

## EmailJS template (recommended)

Create a template (or reuse your existing one) with:

| Field | Value |
|---|---|
| **To Email** | `{{to_email}}` |
| **Reply To** | `{{reply_to}}` |
| **Subject** | `{{subject}}` |

Body (example):

```
New message from {{from_name}} <{{customer_email}}>
Department: {{department}}

{{message}}
```

Optional: set `VITE_EMAILJS_CONTACT_TEMPLATE_ID` if contact should use a different template than orders.

## Microsoft 365 mailboxes

| Address | Role |
|---|---|
| `info@rojob.eu` | Main inbox (form destination) |
| `marketing@rojob.eu` | Forward to `info@rojob.eu` |
| `ceo@rojob.eu` | CEO / admin |

Forwarding is configured in Microsoft 365 admin, not in this app.

## Vercel env

Add the same `VITE_EMAILJS_*` and `VITE_CONTACT_EMAIL` keys used in `.env.local`.
