import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useSiteMode } from "../context/SiteModeContext";
import { formatPrice, CURRENCY } from "../data/seed";
import { createOrder } from "../lib/store";
import { isFirebaseConfigured } from "../lib/firebase";
import { createCheckoutSession, isStripeConfigured } from "../lib/stripe";
import Newsletter from "../components/Newsletter";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { commerceEnabled, currency } = useSiteMode();
  const { t } = useLang();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    country: "Poland",
    notes: "",
  });

  const stripeReady = isStripeConfigured();
  const canPay =
    commerceEnabled &&
    stripeReady &&
    items.every((i) => i.price != null && Number(i.price) > 0);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!items.length || !commerceEnabled) return;
    setBusy(true);
    setError("");
    try {
      if (canPay) {
        const session = await createCheckoutSession({
          items,
          customer: form,
          currency: currency || CURRENCY || "PLN",
        });
        if (session.url) {
          window.location.href = session.url;
          return;
        }
        throw new Error("Stripe did not return a checkout URL.");
      }

      // Fallback without Stripe: atelier order record only
      await createOrder({
        customer: form,
        items,
        total,
        currency: currency || CURRENCY,
        source: isFirebaseConfigured ? "firebase" : "local",
        payment: "manual",
      });
      clear();
      nav("/order-confirmed");
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!items.length) nav("/cart");
  }, [items.length, nav]);

  if (!items.length) return null;

  if (!commerceEnabled) {
    return (
      <>
        <Seo title={`Checkout — ROJOB`} />
        <div className="max-w-2xl mx-auto px-5 py-20 md:py-28">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase text-crimson">Checkout</p>
            <h1 className="font-serif text-5xl md:text-6xl mt-4 leading-[1.05]">
              {t("home.hero.ctaPrivate")}
            </h1>
            <p className="mt-8 text-midnight/65 leading-relaxed max-w-lg">
              Commerce is not yet open. Join private access to be first when ordering begins — or
              contact the atelier directly.
            </p>
            <div className="mt-12 p-6 md:p-8 bg-white/40 border border-midnight/8">
              <Newsletter />
            </div>
            <Link
              to="/contact"
              className="inline-block mt-8 text-[11px] tracking-[0.25em] uppercase border-b border-midnight/30 pb-0.5 hover:border-midnight transition-colors"
            >
              {t("nav.contact")}
            </Link>
            <Link
              to="/cart"
              className="block mt-6 text-[11px] tracking-[0.2em] uppercase text-midnight/45 hover:text-midnight"
            >
              ← {t("cart.title")}
            </Link>
          </Reveal>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={`Checkout — ROJOB`} />

      <div className="max-w-6xl mx-auto px-5 pt-28 md:pt-32 pb-14 md:pb-20 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <Reveal>
          <form onSubmit={submit} className="space-y-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-crimson">{t("cart.checkout")}</p>
            <h1 className="font-serif text-5xl mb-8">Checkout</h1>

            {!isFirebaseConfigured && (
              <p className="text-sm bg-white/50 border border-midnight/10 p-4 leading-relaxed text-midnight/65">
                Firebase is not connected. Orders are stored locally for testing until the atelier
                database is linked.
              </p>
            )}

            {["name", "email", "phone", "address", "city", "postcode", "country"].map((k) => (
              <label key={k} className="block">
                <span className="text-[11px] tracking-[0.2em] uppercase text-midnight/50">{k}</span>
                <input
                  required={k !== "phone"}
                  name={k}
                  type={k === "email" ? "email" : "text"}
                  value={form[k]}
                  onChange={onChange}
                  className="mt-1.5 w-full bg-transparent border-b border-midnight/20 py-2.5 outline-none focus:border-midnight/50 transition-colors"
                />
              </label>
            ))}

            <label className="block">
              <span className="text-[11px] tracking-[0.2em] uppercase text-midnight/50">Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={3}
                className="mt-1.5 w-full bg-transparent border-b border-midnight/20 py-2.5 outline-none focus:border-midnight/50 transition-colors resize-none"
              />
            </label>

            <div className="pt-4 space-y-3">
              <p className="text-[10px] tracking-[0.22em] uppercase text-midnight/40">Payment</p>
              <div
                className={`flex items-center justify-between py-3 px-4 border ${
                  canPay ? "border-midnight/25 text-midnight" : "border-midnight/10 text-midnight/35"
                }`}
              >
                <span className="text-[11px] tracking-[0.15em] uppercase">Stripe · Card</span>
                <span className="text-[10px] tracking-[0.18em] uppercase">
                  {canPay ? "Ready" : stripeReady ? "Set product prices" : "Add Stripe keys"}
                </span>
              </div>
              <p className="text-xs text-midnight/50 leading-relaxed">
                Apple Pay / Google Pay appear automatically in Stripe Checkout when available on the
                customer’s device. BLIK can be enabled later in the Stripe Dashboard (Poland).
              </p>
            </div>

            {error && <p className="text-crimson text-sm">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full bg-crimson text-porcelain py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-midnight transition-colors duration-500 disabled:opacity-50"
            >
              {busy
                ? "Redirecting…"
                : canPay
                  ? `Pay with Stripe · ${formatPrice(total || null)}`
                  : `Place order · ${formatPrice(total || null)}`}
            </button>
          </form>
        </Reveal>

        <Reveal>
          <aside className="lg:pt-12">
            <h2 className="font-serif text-3xl">Summary</h2>
            <ul className="mt-8 space-y-4 text-sm">
              {items.map((l) => (
                <li key={l.lineId} className="flex justify-between gap-4 border-b border-midnight/5 pb-4">
                  <span className="text-midnight/70">
                    {l.name}
                    <span className="block text-[10px] tracking-[0.12em] uppercase text-midnight/40 mt-1">
                      {l.color || l.colorName} · {l.size} × {l.qty}
                    </span>
                  </span>
                  <span className="tabular-nums shrink-0">
                    {formatPrice(l.price != null ? l.price * l.qty : null)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-midnight/10">
              <p className="text-[10px] tracking-[0.2em] uppercase text-midnight/45">{t("cart.subtotal")}</p>
              <p className="font-serif text-3xl mt-2 tabular-nums">{formatPrice(total || null)}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </>
  );
}
