/**
 * api.js — Magic Momos frontend API layer
 *
 * Usage:
 *   import api from "../services/api";
 *   const { items } = await api.menu.getAll();
 *   const { order } = await api.orders.place(payload);
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken      = ()        => localStorage.getItem("mm_token");
export const getAdminToken = ()        => localStorage.getItem("mm_admin_token");
export const setToken      = (t)       => localStorage.setItem("mm_token", t);
export const setAdminToken = (t)       => localStorage.setItem("mm_admin_token", t);
export const clearToken    = ()        => localStorage.removeItem("mm_token");
export const clearAdminToken = ()      => localStorage.removeItem("mm_admin_token");

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(path, options = {}, useAdminToken = false) {
  const token = useAdminToken ? getAdminToken() : getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({ success: false, message: "Invalid server response" }));

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status  = res.status;
    err.data    = data;
    throw err;
  }

  return data;
}

// ── Convenience methods ───────────────────────────────────────────────────────
const get    = (path, admin)        => request(path, { method: "GET" },    admin);
const post   = (path, body, admin)  => request(path, { method: "POST",   body: JSON.stringify(body) }, admin);
const put    = (path, body, admin)  => request(path, { method: "PUT",    body: JSON.stringify(body) }, admin);
const patch  = (path, body, admin)  => request(path, { method: "PATCH",  body: JSON.stringify(body) }, admin);
const del    = (path, admin)        => request(path, { method: "DELETE" }, admin);


// ═══════════════════════════════════════════════════════════════════════════════
// API namespaces
// ═══════════════════════════════════════════════════════════════════════════════

const api = {

  // ── Health ──────────────────────────────────────────────────────────────────
  health: () => get("/health"),

  // ── Customer auth ───────────────────────────────────────────────────────────
  auth: {
    register: (data) => post("/auth/register", data),
    login:    (data) => post("/auth/login",    data),
    me:       ()     => get("/auth/me"),
    update:   (data) => put("/auth/me",        data),
    changePassword: (data) => put("/auth/change-password", data),
  },

  // ── Public menu ─────────────────────────────────────────────────────────────
  menu: {
    /**
     * getAll(params)
     * params: { category, veg, search, includeUnavailable }
     */
    getAll: (params = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
      ).toString();
      return get(`/menu${qs ? `?${qs}` : ""}`);
    },
    getOne: (id) => get(`/menu/${id}`),
  },

  // ── Customer orders ──────────────────────────────────────────────────────────
  orders: {
    /**
     * place(payload)
     * payload: { customer, items, address, paymentMethod, specialInstructions }
     * Response includes `razorpay: { keyId, orderId, amount, currency }`
     * when paymentMethod === "online", null otherwise.
     */
    place:   (data)    => post("/orders",     data),
    track:   (id)      => get(`/orders/${id}`),
    myOrders:(params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return get(`/orders/my${qs ? `?${qs}` : ""}`);
    },
    cancel:  (id, reason) => post(`/orders/${id}/cancel`, { reason }),

    /**
     * verifyPayment(payload)
     * Call immediately after Razorpay Checkout's success handler fires.
     * payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
     */
    verifyPayment: (data) => post("/orders/verify-payment", data),

    /**
     * retryPayment(orderId)
     * For orders stuck at paymentStatus "Pending"/"Failed" after an
     * abandoned or failed online payment. Returns fresh Razorpay
     * Checkout params: { razorpay: { keyId, orderId, amount, currency } }
     */
    retryPayment: (orderId) => post(`/orders/${orderId}/retry-payment`, {}),
  },

  // ── Contact form ─────────────────────────────────────────────────────────────
  contact: {
    submit: (data) => post("/contact", data),
  },

  // ── Admin auth ───────────────────────────────────────────────────────────────
  admin: {
    login: async (data) => {
      const res = await post("/admin/login", data, true);
      if (res.token) setAdminToken(res.token);
      return res;
    },
    me:     ()     => get("/admin/me", true),
    logout: ()     => { clearAdminToken(); },

    // Dashboard
    dashboard: () => get("/admin/dashboard", true),

    // Orders
    orders: {
      getAll:       (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return get(`/admin/orders${qs ? `?${qs}` : ""}`, true);
      },
      getOne:       (id)          => get(`/admin/orders/${id}`, true),
      updateStatus: (id, status, note) => patch(`/admin/orders/${id}/status`, { status, note }, true),
    },

    // Menu management (admin)
    menu: {
      create:         (data) => post("/admin/menu",               data, true),
      update:         (id, data) => put(`/admin/menu/${id}`,      data, true),
      delete:         (id, hard = false) => del(`/admin/menu/${id}${hard ? "?hard=true" : ""}`, true),
      toggleAvailable:(id)   => patch(`/admin/menu/${id}/toggle`, {}, true),
    },

    // Contacts
    contacts: {
      getAll:  (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return get(`/admin/contacts${qs ? `?${qs}` : ""}`, true);
      },
      update:  (id, data) => patch(`/admin/contacts/${id}`, data, true),
    },
  },
};

export default api;
