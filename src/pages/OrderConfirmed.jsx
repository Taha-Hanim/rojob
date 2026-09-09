import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { createOrder } from "../lib/store";
import { verifyCheckoutSession } from "../lib/stripe";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";

export default function OrderConfirmed() {
  const { t } = useLang();
  const { clear } = useCart();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState(sessionId ? "verifying" : "ok");
  const [detail, setDetail] = useState(null);
  const saved = useRef(false);

  useEffect(() => {
    if (!sessionId || saved.current) return;
    let cancelled = false;

    (async () => {
      try {
        const session = await verifyCheckoutSession(sessionId);
        if (cancelled) return;
        setDetail(session);

        if (!saved.current) {
          saved.current = true;
          await createOrder({
            customer: {
              name: session.customer_name || "",
              email: session.customer_email || "",
              phone: session.customer_phone || "",
              address: session.shipping?.address?.line1 || "",
              city: session.shipping?.address?.city || "",
              postcode: session.shipping?.address?.postal_code || "",
              country: session.shipping?.address?.country || "",
              notes: session.notes || "",
            },
            items: session.cart?.length
              ? session.cart
              : (session.line_items || []).map((li) => ({
                  name: li.name,
                  qty: li.qty,
                  price: li.amount != null ? li.amount / 100 : null,
                })),
            total: session.amount_total != null ? session.amount_total / 100 : null,
            currency: (session.currency || "pln").toUpperCase(),
            source: "stripe",
            payment: "paid",
            stripeSessionId: session.id,
            status: "confirmed",
          });
          clear();
        }
        setStatus("ok");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setDetail({ error: err.message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, clear]);

  return (
    <>
      <Seo title="Order confirmed — ROJOB" description="Thank you for your order." />

      <div className="max-w-xl mx-auto px-5 py-28 md:py-36 text-center">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">Thank you</p>
          <h1 className="font-serif text-5xl md:text-6xl mt-5 leading-[1.05]">
            {status === "verifying"
              ? "Confirming payment…"
              : status === "error"
                ? "Payment check"
                : "Order received"}
          </h1>
          <p className="mt-8 text-midnight/65 leading-relaxed max-w-sm mx-auto">
            {status === "verifying"
              ? "Verifying your Stripe payment with the atelier."
              : status === "error"
                ? detail?.error ||
                  "We could not verify the session automatically. If you were charged, contact the atelier with your email."
                : sessionId
                  ? "Payment confirmed. The atelier has your order and will follow up by email."
                  : "The atelier has your order. Confirmation will follow by email once it has been reviewed."}
          </p>
          {detail?.customer_email && status === "ok" && (
            <p className="mt-4 text-sm text-midnight/45">{detail.customer_email}</p>
          )}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/collections/cable-cotton"
              className="text-[11px] tracking-[0.25em] uppercase border-b border-midnight/30 pb-0.5 hover:border-midnight transition-colors"
            >
              {t("home.collection.cta")}
            </Link>
            <Link
              to="/"
              className="text-[11px] tracking-[0.2em] uppercase text-midnight/45 hover:text-midnight transition-colors"
            >
              ROJOB
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
