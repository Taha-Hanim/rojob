import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CatalogProvider } from "./context/CatalogContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LangProvider } from "./context/LangContext";
import { SiteModeProvider } from "./context/SiteModeContext";
import { UIProvider } from "./context/UIContext";
import { WishlistProvider } from "./context/WishlistContext";
import CookieBanner from "./components/CookieBanner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Collections from "./pages/Collections";
import Collection from "./pages/Collection";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import About from "./pages/About";
import World from "./pages/World";
import FiftyTwoN from "./pages/FiftyTwoN";
import Journal from "./pages/Journal";
import JournalArticle from "./pages/JournalArticle";
import Contact from "./pages/Contact";
import SizeGuide from "./pages/SizeGuide";
import Account from "./pages/Account";
import Legal from "./pages/Legal";
import Admin from "./admin/Admin";

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <main className={!isAdmin ? "pt-0" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<Product />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:slug" element={<Collection />} />
          <Route path="/products/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/world" element={<World />} />
          <Route path="/52n" element={<FiftyTwoN />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<JournalArticle />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/account" element={<Account />} />
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route path="/privacy" element={<Legal type="privacy" />} />
          <Route path="/cookies" element={<Legal type="cookies" />} />
          <Route path="/delivery-returns" element={<Legal type="delivery-returns" />} />
          <Route path="/payments" element={<Legal type="payments" />} />
          <Route path="/complaints" element={<Legal type="complaints" />} />
          <Route path="/company" element={<Legal type="company" />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <CookieBanner />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <CurrencyProvider>
          <SiteModeProvider>
            <UIProvider>
              <CartProvider>
                <WishlistProvider>
                  <CatalogProvider>
                    <BrowserRouter>
                      <Shell />
                    </BrowserRouter>
                  </CatalogProvider>
                </WishlistProvider>
              </CartProvider>
            </UIProvider>
          </SiteModeProvider>
        </CurrencyProvider>
      </LangProvider>
    </AuthProvider>
  );
}
