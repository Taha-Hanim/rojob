import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCatalog } from "../context/CatalogContext";
import { useCurrency } from "../context/CurrencyContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import ProductCard from "../components/ProductCard";

const emptyAddress = { label: "Home", line1: "", city: "", postcode: "", country: "Poland" };

export default function Account() {
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const {
    user,
    profile,
    configured,
    ready,
    login,
    register,
    logout,
    saveProfile,
  } = useAuth();
  const { ids } = useWishlist();
  const { products } = useCatalog();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    address: { ...emptyAddress },
  });

  const wishlistProducts = products.filter(
    (p) => ids.includes(p.id) || ids.includes(p.slug)
  );

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName || user?.displayName || "",
      phone: profile.phone || "",
      address: {
        ...emptyAddress,
        ...(profile.addresses?.[0] || {}),
      },
    });
  }, [profile, user]);

  useEffect(() => {
    if (!user || !isFirebaseConfigured || !db) {
      setOrders([]);
      return undefined;
    }
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || Date.parse(a.createdAt) || 0;
          const tb = b.createdAt?.toMillis?.() || Date.parse(b.createdAt) || 0;
          return tb - ta;
        });
        setOrders(rows);
      },
      () => setOrders([])
    );
    return unsub;
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!configured) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          phone: phone.trim(),
        });
      }
    } catch (err) {
      setAuthError(err.message || t("account.authError"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await saveProfile({
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
        addresses: [{ ...form.address, label: form.address.label || "Home" }],
      });
      setMsg(t("account.saved"));
    } catch (err) {
      setMsg(err.message || t("common.error"));
    }
  };

  return (
    <>
      <Seo title={`${t("account.title")} — ROJOB`} description={t("account.prelaunchNote")} />

      <section className="max-w-7xl mx-auto px-5 pt-28 md:pt-32 pb-16 md:pb-24">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">{t("nav.account")}</p>
          <h1 className="font-serif text-6xl md:text-7xl mt-3">{t("account.title")}</h1>
          <p className="mt-5 text-midnight/70 max-w-lg">{t("account.intro")}</p>
        </Reveal>

        {!configured && (
          <p className="mt-10 text-sm text-midnight/60">{t("account.profileNote")}</p>
        )}

        {configured && ready && !user && (
          <Reveal className="mt-14 max-w-md">
            <div className="flex gap-6 text-[11px] tracking-[0.22em] uppercase mb-8">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={mode === "login" ? "text-crimson" : "text-midnight/45"}
              >
                {t("account.signIn")}
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={mode === "register" ? "text-crimson" : "text-midnight/45"}
              >
                {t("account.create")}
              </button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "register" && (
                <>
                  <input
                    className="w-full bg-transparent border-b border-midnight/25 py-2 text-sm"
                    placeholder={t("account.name")}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <input
                    className="w-full bg-transparent border-b border-midnight/25 py-2 text-sm"
                    placeholder={t("account.phone")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </>
              )}
              <input
                type="email"
                required
                className="w-full bg-transparent border-b border-midnight/25 py-2 text-sm"
                placeholder={t("contact.form.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-transparent border-b border-midnight/25 py-2 text-sm"
                placeholder={t("account.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {authError && <p className="text-sm text-crimson">{authError}</p>}
              <button
                type="submit"
                disabled={authLoading}
                className="mt-4 bg-midnight text-porcelain px-8 py-3 text-[11px] tracking-[0.25em] uppercase disabled:opacity-50"
              >
                {authLoading
                  ? "…"
                  : mode === "login"
                    ? t("account.signIn")
                    : t("account.create")}
              </button>
            </form>
          </Reveal>
        )}

        {configured && ready && user && (
          <div className="mt-16 grid lg:grid-cols-3 gap-12 lg:gap-16">
            <Reveal className="lg:col-span-1 space-y-12">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-serif text-3xl">{t("account.profile")}</h2>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-[10px] tracking-[0.22em] uppercase text-midnight/45 hover:text-crimson"
                  >
                    {t("account.signOut")}
                  </button>
                </div>
                <p className="mt-2 text-sm text-midnight/50">{user.email}</p>
                <form onSubmit={handleSave} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-midnight/45">
                      {t("account.name")}
                    </span>
                    <input
                      className="mt-1 w-full bg-transparent border-b border-midnight/20 py-2 text-sm"
                      value={form.displayName}
                      onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-midnight/45">
                      {t("account.phone")}
                    </span>
                    <input
                      className="mt-1 w-full bg-transparent border-b border-midnight/20 py-2 text-sm"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-midnight/45">
                      {t("account.address")}
                    </span>
                    <input
                      className="mt-1 w-full bg-transparent border-b border-midnight/20 py-2 text-sm"
                      placeholder="Street"
                      value={form.address.line1}
                      onChange={(e) =>
                        setForm({ ...form, address: { ...form.address, line1: e.target.value } })
                      }
                    />
                    <input
                      className="mt-3 w-full bg-transparent border-b border-midnight/20 py-2 text-sm"
                      placeholder="City"
                      value={form.address.city}
                      onChange={(e) =>
                        setForm({ ...form, address: { ...form.address, city: e.target.value } })
                      }
                    />
                    <input
                      className="mt-3 w-full bg-transparent border-b border-midnight/20 py-2 text-sm"
                      placeholder="Postcode"
                      value={form.address.postcode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: { ...form.address, postcode: e.target.value },
                        })
                      }
                    />
                    <input
                      className="mt-3 w-full bg-transparent border-b border-midnight/20 py-2 text-sm"
                      placeholder="Country"
                      value={form.address.country}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: { ...form.address, country: e.target.value },
                        })
                      }
                    />
                  </label>
                  {msg && <p className="text-sm text-midnight/60">{msg}</p>}
                  <button
                    type="submit"
                    className="text-[11px] tracking-[0.22em] uppercase border-b border-midnight pb-1"
                  >
                    {t("account.save")}
                  </button>
                </form>
              </div>

              <div>
                <h2 className="font-serif text-3xl">{t("account.orders")}</h2>
                {orders.length === 0 ? (
                  <p className="mt-4 text-sm text-midnight/55">{t("account.ordersEmpty")}</p>
                ) : (
                  <ul className="mt-4 space-y-4 text-sm">
                    {orders.map((o) => (
                      <li key={o.id} className="border-b border-midnight/10 pb-3">
                        <div className="flex justify-between gap-4">
                          <span className="uppercase tracking-[0.15em] text-[10px] text-midnight/45">
                            {o.status || "received"}
                          </span>
                          <span>{formatPrice(o.total)}</span>
                        </div>
                        <p className="mt-1 text-midnight/60">
                          {(o.items || []).map((i) => i.name).join(", ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>

            <Reveal className="lg:col-span-2">
              <div className="flex items-baseline justify-between gap-4 mb-8">
                <h2 className="font-serif text-4xl">{t("account.wishlist")}</h2>
                {ids.length > 0 && (
                  <span className="text-[10px] tracking-[0.28em] uppercase text-midnight/45">
                    {ids.length}
                  </span>
                )}
              </div>
              {wishlistProducts.length === 0 ? (
                <div className="py-16 text-center border border-midnight/10">
                  <p className="text-midnight/55">{t("account.wishlistEmpty")}</p>
                  <Link
                    to="/shop"
                    className="link-underline mt-6 inline-block text-[10px] tracking-[0.28em] uppercase"
                  >
                    {t("cart.continue")}
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-8">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id || p.slug} product={p} />
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        )}
      </section>
    </>
  );
}
