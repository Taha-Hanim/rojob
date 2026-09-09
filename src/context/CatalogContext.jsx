import { createContext, useContext, useEffect, useState } from "react";
import { subscribeProducts, subscribePortfolio } from "../lib/store";

const CatalogContext = createContext({ products: [], portfolio: [], loading: true });

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const a = subscribeProducts((rows) => {
      setProducts(rows);
      setLoading(false);
    });
    const b = subscribePortfolio(setPortfolio);
    return () => {
      a();
      b();
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ products, portfolio, loading }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
