import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { MAX_BAGS_PER_LINE, WHOLESALE_MIN_BAGS } from '../shared/rules';

/**
 * Catalog (products + editable site content from the server) and the cart.
 * Cart prices shown here are previews; the server re-prices every order.
 */
export const ShopContext = createContext(null);
const CART_KEY = 'zinia-cart-v1';

function readCart() {
  try {
    const c = JSON.parse(localStorage.getItem(CART_KEY));
    if (c && typeof c === 'object' && c.items) return { type: c.type === 'wholesale' ? 'wholesale' : 'retail', items: c.items };
  } catch {
    /* ignore */
  }
  return { type: 'retail', items: {} };
}

export function ShopProvider({ children }) {
  const [catalog, setCatalog] = useState({ status: 'loading', products: [], content: {} });
  const [cart, setCart] = useState(readCart);
  const [cartOpen, setCartOpen] = useState(false);

  const reload = useCallback(() => {
    api('/catalog')
      .then((d) => setCatalog({ status: 'ready', products: d.products, content: d.content || {} }))
      .catch(() => setCatalog((c) => ({ ...c, status: 'error' })));
  }, []);
  useEffect(reload, [reload]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* storage unavailable */
    }
  }, [cart]);

  // Drop cart lines for products that are no longer sellable.
  useEffect(() => {
    if (catalog.status !== 'ready') return;
    const ids = new Set(catalog.products.filter((p) => p.available).map((p) => String(p.id)));
    setCart((c) => {
      const items = Object.fromEntries(Object.entries(c.items).filter(([id]) => ids.has(id)));
      return Object.keys(items).length === Object.keys(c.items).length ? c : { ...c, items };
    });
  }, [catalog]);

  const value = useMemo(() => {
    const byId = new Map(catalog.products.map((p) => [String(p.id), p]));
    const lines = Object.entries(cart.items)
      .map(([id, qty]) => {
        const p = byId.get(id);
        if (!p) return null;
        const price = cart.type === 'wholesale' ? p.wholesale_price : p.retail_price;
        return { product: p, quantity: qty, unit_price: price, line_total: price * qty };
      })
      .filter(Boolean);
    const totalBags = lines.reduce((a, l) => a + l.quantity, 0);
    const subtotal = lines.reduce((a, l) => a + l.line_total, 0);
    const meetsMinimum = cart.type === 'retail' ? totalBags >= 1 : totalBags >= WHOLESALE_MIN_BAGS;

    const setQty = (id, qty) =>
      setCart((c) => {
        const items = { ...c.items };
        const n = Math.max(0, Math.min(MAX_BAGS_PER_LINE, Math.floor(Number(qty) || 0)));
        if (n === 0) delete items[String(id)];
        else items[String(id)] = n;
        return { ...c, items };
      });

    return {
      catalog,
      reloadCatalog: reload,
      content: catalog.content,
      orderType: cart.type,
      setOrderType: (type) => setCart((c) => ({ ...c, type })),
      quantities: cart.items,
      setQty,
      addQty: (id, n) => setQty(id, (cart.items[String(id)] || 0) + n),
      clearCart: () => setCart((c) => ({ ...c, items: {} })),
      lines,
      totalBags,
      subtotal,
      meetsMinimum,
      cartOpen,
      setCartOpen,
    };
  }, [catalog, cart, cartOpen, reload]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
