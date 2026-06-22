import { useState, useCallback, useEffect } from "react";
import api from "../services/api";

const CART_KEY          = "mm_cart";

/**
 * useCart — manages cart state with localStorage persistence.
 *
 * Returns:
 *   items        — [{ id, name, emoji, price, qty }]
 *   addItem      — (item) => void
 *   updateQty    — (id, delta) => void   (+1 / -1; removes at 0)
 *   removeItem   — (id) => void
 *   clearCart    — () => void
 *   subtotal     — number  (sum of price × qty)
 *   discount     — number  (coupon discount amount)
 *   deliveryFee  — number  (0 if subtotal >= FREE_DELIVERY_MIN)
 *   total        — number  (subtotal - discount + deliveryFee)
 *   count        — number  (total individual items)
 *   coupon       — { code, label } | null
 *   couponError  — string
 *   applyCoupon  — (code) => void
 *   removeCoupon — () => void
 *   FREE_DELIVERY_MIN
 */
export function useCart() {
  // ── Initialise from localStorage ──────────────────────────────────────────
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [freeDeliveryMinSetting, setFreeDeliveryMinSetting] = useState(199);
  const [deliveryFeeSetting, setDeliveryFeeSetting] = useState(30);

  // Fetch settings dynamically on mount
  useEffect(() => {
    let active = true;
    api.settings.get()
      .then((res) => {
        if (res.success && res.settings && active) {
          setFreeDeliveryMinSetting(res.settings.freeDeliveryThreshold ?? 199);
          setDeliveryFeeSetting(res.settings.deliveryFee ?? 30);
        }
      })
      .catch((err) => console.error("Error fetching settings in useCart:", err));
    return () => { active = false; };
  }, []);

  const [coupon,      setCoupon]      = useState(null);   // { code, type, value, label }
  const [couponError, setCouponError] = useState("");

  // ── Persist to localStorage on every change ───────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // quota exceeded — silent fail
    }
  }, [items]);

  // ── Cart mutations ────────────────────────────────────────────────────────
  const addItem = useCallback((item) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id:       item.id,
          name:     item.name,
          emoji:    item.emoji,
          imageUrl: item.imageUrl,
          price:    item.price,
          qty:      1,
        },
      ];
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

  const subtotal   = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Auto-remove coupon if subtotal drops below minOrderValue
  useEffect(() => {
    if (coupon && coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      setCoupon(null);
      setCouponError(`Coupon removed: minimum order of ₹${coupon.minOrderValue} required.`);
    }
  }, [subtotal, coupon]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setCouponError("");
  }, []);

  // ── Coupon logic ──────────────────────────────────────────────────────────
  const applyCoupon = useCallback(async (code) => {
    setCouponError("");
    const key = code.trim().toUpperCase();
    try {
      const res = await api.coupons.validate(key, subtotal);
      if (res.success && res.coupon) {
        setCoupon({
          code: res.coupon.code,
          type: res.coupon.discountType === "percentage" ? "percent" : "flat",
          value: res.coupon.discountValue,
          label: res.coupon.discountType === "percentage" 
            ? `${res.coupon.discountValue}% off` 
            : `₹${res.coupon.discountValue} off`,
          minOrderValue: res.coupon.minOrderValue,
          maxDiscount: res.coupon.maxDiscount,
        });
        return true;
      } else {
        setCouponError(res.message || "Invalid coupon code.");
        return false;
      }
    } catch (err) {
      setCouponError(err.message || "Invalid coupon code.");
      return false;
    }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError("");
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const discount = coupon
    ? coupon.type === "percent"
      ? Math.min(
          Math.round((subtotal * coupon.value) / 100),
          coupon.maxDiscount > 0 ? coupon.maxDiscount : Infinity,
          subtotal
        )
      : Math.min(coupon.value, subtotal)
    : 0;

  const discountedSubtotal = subtotal - discount;
  const deliveryFeeVal = discountedSubtotal >= freeDeliveryMinSetting ? 0 : deliveryFeeSetting;
  const total       = discountedSubtotal + deliveryFeeVal;
  const count       = items.reduce((sum, i) => sum + i.qty, 0);

  return {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    discount,
    deliveryFee: deliveryFeeVal,
    total,
    count,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    FREE_DELIVERY_MIN: freeDeliveryMinSetting,
    DELIVERY_FEE: deliveryFeeSetting,
  };
}