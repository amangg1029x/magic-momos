import { useState, useCallback } from "react";

/**
 * useCart — manages the shopping cart state.
 *
 * Returns:
 *   items     — array of { id, name, emoji, price, qty }
 *   addItem   — (item) => void  – adds 1 of item or increments qty
 *   updateQty — (id, delta) => void  – +1 / -1; removes item when qty hits 0
 *   removeItem— (id) => void
 *   clearCart — () => void
 *   total     — number  (sum of price * qty)
 *   count     — number  (total number of individual items)
 */
export function useCart() {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, emoji: item.emoji, price: item.price, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, addItem, updateQty, removeItem, clearCart, total, count };
}