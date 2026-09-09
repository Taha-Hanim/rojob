import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isCloudinaryConfigured, uploadToCloudinary } from "../lib/cloudinary";
import {
  subscribeOrders,
  subscribeProducts,
  subscribePortfolio,
  saveProduct,
  removeProduct,
  savePortfolioItem,
  removePortfolioItem,
  updateOrderStatus,
  seedDatabase,
} from "../lib/store";

const emptyProduct = () => ({
  slug: "",
  name: "",
  namePl: "",
  collection: "Cable Cotton",
  collectionCode: "01 / 2026",
  color: "Porcelain",
  colorId: "porcelain",
  colorHex: "#F3EFE7",
  category: "Knitwear",
  price: null,
  currency: "PLN",
  fabric: "100% Cotton",
  description: "",
  descriptionPl: "",
  details: [],
  sizes: ["XS", "S", "M", "L", "XL"],
  images: { front: "", hover: "", gallery: [] },
  featured: false,
  stock: 0,
  status: "preview",
  sku: "",
  designedIn: "Warsaw",
  madeIn: "Bangladesh",
  release: "2026",
});

export default function Admin() {
  const { user, ready, configured, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("orders");
  const [products, setProducts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [portEdit, setPortEdit] = useState({
    title: "",
    subtitle: "",
    image: "",
    year: "2026",
    slug: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user || !configured) return undefined;
    const a = subscribeProducts(setProducts);
    const b = subscribePortfolio(setPortfolio);
    const c = subscribeOrders(setOrders);
    return () => {
      a();
      b();
      c();
    };
  }, [user, configured]);

  if (!ready) return <p className="p-10 font-serif text-2xl">…</p>;

  if (!configured) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20">
        <h1 className="font-serif text-4xl">Atelier</h1>
        <p className="mt-4 text-midnight/70 leading-relaxed">
          Add Firebase keys to <code className="bg-white/60 px-1">.env.local</code> to unlock
          the live admin. Until then the public site runs on seed data in pre-launch mode.
        </p>
        <Link to="/" className="inline-block mt-8 border-b border-midnight text-[11px] tracking-[0.2em] uppercase">
          Back to house
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <form
        className="max-w-sm mx-auto px-5 py-24 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          try {
            await login(email, password);
          } catch (ex) {
            setErr(ex.message);
          }
        }}
      >
        <h1 className="font-serif text-4xl">Atelier</h1>
        <input
          className="w-full border-b border-midnight/20 py-2 bg-transparent"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border-b border-midnight/20 py-2 bg-transparent"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <p className="text-crimson text-sm">{err}</p>}
        <button
          type="submit"
          className="w-full bg-midnight text-porcelain py-3 text-[11px] tracking-[0.25em] uppercase"
        >
          Enter
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 min-h-screen bg-porcelain">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-4xl">Atelier</h1>
        <button
          type="button"
          onClick={logout}
          className="text-[11px] tracking-[0.2em] uppercase"
        >
          Sign out
        </button>
      </div>
      <p className="text-sm text-midnight/50 mt-1">{user.email}</p>
      {msg && <p className="mt-3 text-sm text-midnight/70">{msg}</p>}

      <div className="flex gap-4 mt-8 text-[11px] tracking-[0.2em] uppercase flex-wrap">
        {["orders", "products", "portfolio", "setup"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={tab === t ? "text-crimson" : "text-midnight/50"}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "setup" && (
        <div className="mt-10 space-y-4 max-w-xl">
          <p className="text-midnight/70">
            Push Cable Cotton colourways, lookbook frames and journal seeds into Firestore.
          </p>
          <button
            type="button"
            className="bg-midnight text-porcelain px-6 py-3 text-[11px] tracking-[0.2em] uppercase"
            onClick={async () => {
              try {
                await seedDatabase();
                setMsg("Catalogue written to Firebase.");
              } catch (e) {
                setMsg(e.message);
              }
            }}
          >
            Seed database
          </button>
          <p className="text-sm text-midnight/60">
            Cloudinary:{" "}
            {isCloudinaryConfigured ? "connected" : "add cloud name + unsigned upload preset"}
          </p>
          <p className="text-sm text-midnight/50">
            Site mode: set <code>VITE_SITE_MODE=commerce</code> when ready to sell. Default is
            prelaunch.
          </p>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-midnight/15 text-[11px] tracking-[0.15em] uppercase text-midnight/50">
                <th className="py-2">Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-midnight/10 align-top">
                  <td className="py-3">
                    <div>{o.customer?.name}</div>
                    <div className="text-midnight/50">{o.customer?.email}</div>
                    <div className="text-midnight/50">
                      {o.customer?.address}, {o.customer?.city}
                    </div>
                  </td>
                  <td>{o.total != null ? o.total : "—"}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="bg-transparent"
                    >
                      {["received", "confirmed", "shipped", "cancelled"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {(o.items || []).map((i) => (
                      <div key={i.lineId || `${i.slug}-${i.size}`}>
                        {i.qty}× {i.name} ({i.color}, {i.size})
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <p className="mt-8 text-midnight/50">No orders yet.</p>}
        </div>
      )}

      {tab === "products" && (
        <div className="mt-8 grid lg:grid-cols-2 gap-10">
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-midnight/10 py-2 gap-4">
                <button
                  type="button"
                  className="text-left"
                  onClick={() =>
                    setEditing({
                      ...emptyProduct(),
                      ...p,
                      images: {
                        front: p.images?.front || "",
                        hover: p.images?.hover || "",
                        gallery: p.images?.gallery || [],
                      },
                    })
                  }
                >
                  {p.name} · {p.color}
                  <span className="text-midnight/40 text-xs ml-2">{p.status}</span>
                </button>
                <button
                  type="button"
                  className="text-crimson text-sm shrink-0"
                  onClick={() => removeProduct(p.id)}
                >
                  Delete
                </button>
              </li>
            ))}
            <button
              type="button"
              className="text-[11px] tracking-[0.2em] uppercase mt-4"
              onClick={() => setEditing(emptyProduct())}
            >
              + New colourway
            </button>
          </ul>
          {editing && (
            <ProductForm
              product={editing}
              setProduct={setEditing}
              onSave={async () => {
                const { id, ...rest } = editing;
                const details =
                  typeof rest.details === "string"
                    ? rest.details.split("\n").filter(Boolean)
                    : rest.details;
                const gallery =
                  typeof rest.images?.gallery === "string"
                    ? rest.images.gallery.split("\n").filter(Boolean)
                    : rest.images?.gallery || [];
                await saveProduct({
                  ...rest,
                  details,
                  images: { ...rest.images, gallery },
                  id,
                  price: rest.price === "" || rest.price == null ? null : Number(rest.price),
                  stock: Number(rest.stock || 0),
                });
                setMsg("Product saved.");
                setEditing(null);
              }}
            />
          )}
        </div>
      )}

      {tab === "portfolio" && (
        <div className="mt-8 grid lg:grid-cols-2 gap-10">
          <ul className="space-y-3">
            {portfolio.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-midnight/10 py-2">
                <span>{p.title}</span>
                <button
                  type="button"
                  className="text-crimson text-sm"
                  onClick={() => removePortfolioItem(p.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await savePortfolioItem(portEdit);
              setPortEdit({ title: "", subtitle: "", image: "", year: "2026", slug: "" });
              setMsg("Lookbook frame saved.");
            }}
          >
            <input
              className="w-full border-b py-2 bg-transparent"
              placeholder="Title"
              value={portEdit.title}
              onChange={(e) => setPortEdit({ ...portEdit, title: e.target.value })}
            />
            <input
              className="w-full border-b py-2 bg-transparent"
              placeholder="Subtitle"
              value={portEdit.subtitle}
              onChange={(e) => setPortEdit({ ...portEdit, subtitle: e.target.value })}
            />
            <input
              className="w-full border-b py-2 bg-transparent"
              placeholder="Image URL"
              value={portEdit.image}
              onChange={(e) => setPortEdit({ ...portEdit, image: e.target.value })}
            />
            <label className="block text-sm">
              Upload to Cloudinary
              <input
                type="file"
                accept="image/*"
                className="mt-1 block"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadToCloudinary(f);
                  setPortEdit((p) => ({ ...p, image: url }));
                }}
              />
            </label>
            <button
              type="submit"
              className="bg-midnight text-porcelain px-6 py-2 text-[11px] tracking-[0.2em] uppercase"
            >
              Save frame
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, setProduct, onSave }) {
  const set = (k, v) => setProduct({ ...product, [k]: v });
  const setImage = (k, v) =>
    setProduct({ ...product, images: { ...product.images, [k]: v } });
  const detailsText = Array.isArray(product.details)
    ? product.details.join("\n")
    : product.details || "";
  const galleryText = Array.isArray(product.images?.gallery)
    ? product.images.gallery.join("\n")
    : product.images?.gallery || "";

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <input className="w-full border-b py-2 bg-transparent" placeholder="Name" value={product.name} onChange={(e) => set("name", e.target.value)} />
      <input className="w-full border-b py-2 bg-transparent" placeholder="Slug" value={product.slug} onChange={(e) => set("slug", e.target.value)} />
      <input className="w-full border-b py-2 bg-transparent" placeholder="SKU" value={product.sku || ""} onChange={(e) => set("sku", e.target.value)} />
      <input className="w-full border-b py-2 bg-transparent" placeholder="Colour name" value={product.color} onChange={(e) => set("color", e.target.value)} />
      <input className="w-full border-b py-2 bg-transparent" placeholder="Colour id" value={product.colorId} onChange={(e) => set("colorId", e.target.value)} />
      <input className="w-full border-b py-2 bg-transparent" placeholder="Colour hex" value={product.colorHex} onChange={(e) => set("colorHex", e.target.value)} />
      <input className="w-full border-b py-2 bg-transparent" placeholder="Price (empty = —)" value={product.price ?? ""} onChange={(e) => set("price", e.target.value === "" ? null : e.target.value)} />
      <input className="w-full border-b py-2 bg-transparent" placeholder="Stock" type="number" value={product.stock} onChange={(e) => set("stock", e.target.value)} />
      <select className="w-full border-b py-2 bg-transparent" value={product.status} onChange={(e) => set("status", e.target.value)}>
        <option value="preview">preview</option>
        <option value="available">available</option>
      </select>
      <textarea className="w-full border-b py-2 bg-transparent" rows={3} placeholder="Description" value={product.description} onChange={(e) => set("description", e.target.value)} />
      <textarea className="w-full border-b py-2 bg-transparent" rows={3} placeholder="Details, one per line" value={detailsText} onChange={(e) => set("details", e.target.value)} />

      {["front", "hover"].map((key) => (
        <div key={key} className="border border-midnight/10 p-3 space-y-2">
          <p className="text-[11px] uppercase tracking-widest">{key}</p>
          <input
            className="w-full border-b py-1 bg-transparent text-sm"
            value={product.images?.[key] || ""}
            placeholder="Image URL"
            onChange={(e) => setImage(key, e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await uploadToCloudinary(f);
              setImage(key, url);
            }}
          />
        </div>
      ))}
      <textarea
        className="w-full border-b py-2 bg-transparent"
        rows={3}
        placeholder="Gallery URLs, one per line"
        value={galleryText}
        onChange={(e) => setImage("gallery", e.target.value)}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!product.featured}
          onChange={(e) => set("featured", e.target.checked)}
        />
        Featured
      </label>
      <button
        type="submit"
        className="bg-crimson text-porcelain px-6 py-2 text-[11px] tracking-[0.2em] uppercase"
      >
        Save product
      </button>
    </form>
  );
}
