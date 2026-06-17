import { Clock, CheckCircle, ChefHat, Truck, Package, XCircle } from "lucide-react";

/**
 * STATUS config — single source of truth used across all order components.
 * Each key matches a backend order status string exactly.
 */
export const STATUS_CONFIG = {
  "Pending":          { icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200", dot: "bg-yellow-500",  label: "Pending"          },
  "Confirmed":        { icon: CheckCircle,  color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500",    label: "Confirmed"        },
  "Preparing":        { icon: ChefHat,      color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200", dot: "bg-purple-500",  label: "Preparing"        },
  "Out for Delivery": { icon: Truck,        color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-200", dot: "bg-indigo-500",  label: "Out for Delivery" },
  "Delivered":        { icon: Package,      color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500",   label: "Delivered"        },
  "Cancelled":        { icon: XCircle,      color: "text-red-600",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-500",     label: "Cancelled"        },
};

/** Active statuses — orders that are still in-flight and should be polled. */
export const ACTIVE_STATUSES = new Set(["Pending", "Confirmed", "Preparing", "Out for Delivery"]);

/**
 * OrderStatusBadge
 * A small pill/chip showing the current order status with a coloured dot.
 *
 * @param {string} status  - One of the STATUS_CONFIG keys
 * @param {"sm"|"md"} size - Controls text and padding size (default "sm")
 */
export default function OrderStatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["Pending"];
  const Icon = cfg.icon;

  const sizeClasses = size === "md"
    ? "px-3 py-1.5 text-xs gap-2"
    : "px-2.5 py-1 text-[11px] gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-body font-700 rounded-full border
                  ${sizeClasses} ${cfg.bg} ${cfg.border} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <Icon size={11} className="shrink-0" />
      {status}
    </span>
  );
}
