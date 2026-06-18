import { MapPin, CreditCard } from "lucide-react";

/**
 * OrderItemsBreakdown
 *
 * Renders the items list, subtotal, delivery, and total for an order.
 * Also renders the delivery address and payment method if provided.
 *
 * Props:
 *   items           {Array}  – order.items array
 *   subtotal        {number}
 *   deliveryCharge  {number}
 *   total           {number}
 *   address         {object} – { street, city, pincode } (optional)
 *   paymentMethod   {string} – e.g. "COD" (optional)
 */
export default function OrderItemsBreakdown({
  items = [],
  subtotal,
  deliveryCharge,
  total,
  address,
  paymentMethod,
}) {
  return (
    <div className="space-y-4">
      {/* items list */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item._id ?? item.itemId ?? i}
            className="flex items-center justify-between py-1.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
              ) : item.emoji ? (
                <span className="text-xl shrink-0">{item.emoji}</span>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-mm-red/10 flex items-center justify-center text-xs text-mm-red font-bold shrink-0">
                  {item.name ? item.name.substring(0, 2).toUpperCase() : "MM"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-body text-sm text-mm-cream font-700 truncate">{item.name}</p>
                <p className="font-body text-xs text-mm-muted">
                  {item.qty ?? item.quantity} × ₹{item.price}
                </p>
              </div>
            </div>
            <p className="font-display text-sm text-mm-cream shrink-0 ml-3">
              ₹{item.price * (item.qty ?? item.quantity ?? 1)}
            </p>
          </div>
        ))}
      </div>

      {/* bill summary */}
      <div className="border-t border-mm-border pt-3 space-y-1.5">
        <div className="flex justify-between font-body text-xs text-mm-muted">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between font-body text-xs text-mm-muted">
          <span>Delivery</span>
          <span className={deliveryCharge === 0 ? "text-green-600 font-700" : ""}>
            {deliveryCharge === 0 ? "FREE 🎉" : `₹${deliveryCharge}`}
          </span>
        </div>
        <div className="flex justify-between font-body text-sm font-800 text-mm-cream pt-1.5 border-t border-mm-border">
          <span>Total</span>
          <span className="text-mm-red font-display text-base">₹{total}</span>
        </div>
      </div>

      {/* meta row — address + payment */}
      {(address || paymentMethod) && (
        <div className="space-y-1.5 pt-1">
          {address && (
            <div className="flex items-start gap-2">
              <MapPin size={12} className="text-mm-muted mt-0.5 shrink-0" />
              <p className="font-body text-xs text-mm-muted leading-relaxed">
                {[address.street, address.city, address.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
          {paymentMethod && (
            <div className="flex items-center gap-2">
              <CreditCard size={12} className="text-mm-muted shrink-0" />
              <p className="font-body text-xs text-mm-muted">{paymentMethod}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
