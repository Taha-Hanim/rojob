import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../lib/store";
import { DEMO_CARD, demoCardApproved } from "../lib/stripe";
import { inventoryErrorForCart } from "../lib/inventory";
import { useCatalog } from "../context/CatalogContext";
import Seo from "../components/Seo";

export const PENDING_ORDER_KEY = "rojob_pending_order";

const FIELD =
  "w-full rounded-md border border-[#e6e6e6] bg-white px-3.5 py-3 text-[15px] text-[#30313d] outline-none transition-shadow focus:border-[#0570de] focus:shadow-[0_0_0_3px_rgba(5,112,222,0.25)]";

const LABEL = "block text-[13px] font-medium text-[#30313d] mb-1.5";

function readPendingOrder(state) {
  if (state?.items?.length) return state;
  try {
    const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DemoPayment() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { clear } = useCart();
  const { products } = useCatalog();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const pending = useMemo(() => readPendingOrder(state), [state]);

  const [card, setCard] = useState(DEMO_CARD.number);
  const [expiry, setExpiry] = useState(DEMO_CARD.expiry);
  const [cvc, setCvc] = useState(DEMO_CARD.cvc);
  const [name, setName] = useState(pending?.customer?.name || DEMO_CARD.name);
  const [postcode, setPostcode] = useState(
    pending?.customer?.postcode || DEMO_CARD.postcode
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pending?.items?.length) nav("/cart", { replace: true });
  }, [pending, nav]);

  if (!pending?.items?.length) return null;

  const { items, customer, total, currency } = pending;

  const pay = async (e) => {
    e.preventDefault();
    const stockError = inventoryErrorForCart(products, items);
    if (stockError) {
      setError(stockError);
      return;
    }

    setBusy(true);
    setError("");

    // Simulated authorisation delay so the screen behaves like the real thing.
    await new Promise((r) => setTimeout(r, 1400));

    if (!demoCardApproved(card)) {
      setError("Your card was declined. The order was not placed and stock is unchanged.");
      setBusy(false);
      return;
    }

    try {
      await createOrder({
        customer,
        items,
        total,
        currency: currency || "PLN",
        currencyBase: "PLN",
        userId: user?.uid || null,
        source: "demo",
        payment: "demo",
        status: "received",
      });
      try {
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      } catch {
        /* ignore */
      }
      clear();
      nav("/order-confirmed", { state: { demo: true } });
    } catch (err) {
      setError(err.message || "Could not record the demo order.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#30313d]">
      <Seo title="Payment — ROJOB" description="Demo payment screen." />

      <div className="bg-[#ffc107] text-[#30313d] text-center text-[12px] font-semibold tracking-[0.14em] uppercase py-2 px-4">
        Test mode · no card is charged
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-36px)] max-w-5xl lg:grid-cols-2">
        {/* Summary */}
        <aside className="border-b lg:border-b-0 lg:border-r border-[#e6e6e6] bg-[#fafafa] px-6 sm:px-10 lg:px-12 py-10 lg:py-16">
          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 text-[13px] text-[#6d6e78] hover:text-[#30313d] transition-colors"
          >
            <span aria-hidden="true">←</span> ROJOB
          </Link>

          <p className="mt-10 text-[15px] text-[#6d6e78]">Pay ROJOB</p>
          <p className="mt-1 font-serif text-4xl tabular-nums text-[#1a1a1a]">
            {formatPrice(total)}
          </p>

          <ul className="mt-10 space-y-5">
            {items.map((line) => (
              <li key={line.lineId} className="flex gap-4">
                {line.image && (
                  <img
                    src={line.image}
                    alt=""
                    className="h-16 w-14 shrink-0 rounded object-cover border border-[#e6e6e6]"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium leading-tight">{line.name}</p>
                  <p className="mt-1 text-[13px] text-[#6d6e78]">
                    {[line.color, line.size].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[13px] text-[#6d6e78]">Qty {line.qty}</p>
                </div>
                <p className="shrink-0 text-[14px] tabular-nums">
                  {formatPrice(line.price != null ? line.price * line.qty : null)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-8 space-y-2 border-t border-[#e6e6e6] pt-6 text-[14px]">
            <div className="flex justify-between text-[#6d6e78]">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between text-[#6d6e78]">
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
            <div className="flex justify-between pt-2 font-medium text-[#1a1a1a]">
              <dt>Total due</dt>
              <dd className="tabular-nums">{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>

        {/* Payment form */}
        <section className="px-6 sm:px-10 lg:px-12 py-10 lg:py-16">
          <h1 className="text-[20px] font-semibold">Pay with card</h1>

          <form onSubmit={pay} className="mt-8 space-y-5">
            <div>
              <span className={LABEL}>Email</span>
              <input
                readOnly
                value={customer?.email || ""}
                className={`${FIELD} bg-[#f6f8fa] text-[#6d6e78]`}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="demo-card">
                Card information
              </label>
              <input
                id="demo-card"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                inputMode="numeric"
                className={`${FIELD} rounded-b-none`}
                placeholder="1234 1234 1234 1234"
              />
              <div className="grid grid-cols-2">
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className={`${FIELD} rounded-t-none rounded-r-none border-t-0`}
                  placeholder="MM / YY"
                  aria-label="Expiry date"
                />
                <input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className={`${FIELD} rounded-t-none rounded-l-none border-t-0 border-l-0`}
                  placeholder="CVC"
                  aria-label="Security code"
                />
              </div>
            </div>

            <div>
              <label className={LABEL} htmlFor="demo-name">
                Name on card
              </label>
              <input
                id="demo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={FIELD}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL} htmlFor="demo-country">
                  Country
                </label>
                <select id="demo-country" defaultValue="PL" className={FIELD}>
                  <option value="PL">Poland</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="demo-postcode">
                  Postal code
                </label>
                <input
                  id="demo-postcode"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>

            {error && <p className="text-[14px] text-[#df1b41]">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-[#0570de] py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#0469c9] disabled:opacity-60"
            >
              {busy ? "Processing…" : `Pay ${formatPrice(total)}`}
            </button>

            <p className="pt-2 text-center text-[12px] leading-relaxed text-[#6d6e78]">
              This is a demonstration screen. It mimics Stripe Checkout so the flow can be
              reviewed, but no payment is taken and no card details are sent anywhere. Use
              4242 4242 4242 4242 to complete a sale, or 4000 0000 0000 0002 to decline it.
            </p>

            <Link
              to="/checkout"
              className="block text-center text-[13px] text-[#6d6e78] hover:text-[#30313d] transition-colors"
            >
              Cancel and return
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
