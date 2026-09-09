import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCatalog } from "../context/CatalogContext";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import ProductCard from "../components/ProductCard";

export default function Account() {
  const { t } = useLang();
  const { user, configured, login, logout, ready } = useAuth();
  const { ids } = useWishlist();
  const { products } = useCatalog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!configured || !login) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await login(email.trim(), password);
    } catch {
      setAuthError(t("account.authError"));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <Seo title={`${t("account.title")} — ROJOB`} description={t("account.prelaunchNote")} />

      <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">{t("account.title")}</p>
          <h1 className="font-serif text-6xl md:text-7xl mt-3">{t("account.title")}</h1>
          <p className="mt-5 text-midnight/70 max-w-lg">{t("account.prelaunchNote")}</p>
        </Reveal>

        <div className="mt-16 grid lg:grid-cols-3 gap-12 lg:gap-16">
          <Reveal className="lg:col-span-1 space-y-10">
            <div>
              <h2 className="font-serif text-3xl">{t("account.profile")}</h2>
              {configured && ready && user ? (
                <div className="mt-4 text-sm text-midnight/70 space-y-3">
                  <p>{user.email}</p>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-[10px] tracking-[0.28em] uppercase link-underline"
                  >
                    {t("account.signOut")}
                  </button>
                </div>
              ) : configured && ready ? (
                <form onSubmit={handleLogin} className="mt-4 space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("contact.form.email")}
                    required
                    className="w-full bg-transparent border-b border-midnight/25 py-2 text-sm focus:outline-none"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent border-b border-midnight/25 py-2 text-sm focus:outline-none"
                  />
                  {authError && <p className="text-sm text-crimson">{authError}</p>}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="text-[10px] tracking-[0.28em] uppercase link-underline disabled:opacity-50"
                  >
                    {t("account.signIn")}
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-midnight/60">{t("account.profileNote")}</p>
              )}
            </div>

            <div>
              <h2 className="font-serif text-3xl">{t("account.orders")}</h2>
              <p className="mt-4 text-sm text-midnight/60 italic">{t("account.ordersPlaceholder")}</p>
            </div>

            <div>
              <h2 className="font-serif text-3xl">{t("account.addresses")}</h2>
              <p className="mt-4 text-sm text-midnight/60 italic">{t("account.addressesPlaceholder")}</p>
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
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
