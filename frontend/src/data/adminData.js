/* ── Mock admin data — replace with real API calls when backend is ready ── */

export const DASHBOARD_STATS = {
  today:  { revenue: 2840,  orders: 34  },
  week:   { revenue: 18540, orders: 198 },
  month:  { revenue: 74200, orders: 812 },
  total:  { revenue: 386000, customers: 512 },
  avgRating: 4.8,
  pendingOrders:   7,
  completedOrders: 487,
  cancelledOrders: 18,
};

export const WEEKLY_REVENUE = [
  { day: "Mon", revenue: 2200, orders: 26 },
  { day: "Tue", revenue: 1980, orders: 22 },
  { day: "Wed", revenue: 3100, orders: 38 },
  { day: "Thu", revenue: 2650, orders: 31 },
  { day: "Fri", revenue: 4200, orders: 49 },
  { day: "Sat", revenue: 5800, orders: 67 },
  { day: "Sun", revenue: 4610, orders: 54 },
];

export const TOP_ITEMS = [
  { emoji: "🥟", name: "Steam Veg Momos",  sold: 1248, revenue: 74880 },
  { emoji: "🌶️", name: "Chilli Potato",    sold:  892, revenue: 71360 },
  { emoji: "🥟", name: "Steam Chicken Momos",sold: 743, revenue: 59440 },
  { emoji: "🌯", name: "Paneer Roll",       sold:  618, revenue: 49440 },
  { emoji: "☕", name: "Cutting Chai",      sold: 1534, revenue: 30680 },
];

const now = new Date();
const daysAgo = (n) => new Date(now - n * 864e5).toISOString();

export const MOCK_ORDERS = [
  {
    _id: "o001", orderNumber: "MM-8821",
    customer: { name: "Priya Sharma",   phone: "+91 98765 43210", email: "priya@email.com" },
    items: [
      { emoji:"🥟", name:"Steam Veg Momos", qty:2, price:60 },
      { emoji:"☕", name:"Cutting Chai",    qty:2, price:20 },
    ],
    subtotal: 160, deliveryCharge: 0, total: 160,
    status: "Delivered", paymentMethod: "cod", paymentStatus: "Paid",
    address: "42 Lajpat Nagar, Near Metro Gate 3, New Delhi", pincode: "110024",
    createdAt: daysAgo(0.3),
  },
  {
    _id: "o002", orderNumber: "MM-8820",
    customer: { name: "Rahul Verma",    phone: "+91 87654 32109", email: "rahul@email.com" },
    items: [
      { emoji:"🌶️", name:"Chilli Potato",  qty:1, price:80 },
      { emoji:"🍟",  name:"French Fries",   qty:1, price:70 },
      { emoji:"☕",  name:"Cutting Chai",   qty:1, price:20 },
    ],
    subtotal: 170, deliveryCharge: 30, total: 200,
    status: "Out for Delivery", paymentMethod: "online", paymentStatus: "Paid",
    address: "17 Hauz Khas Village, New Delhi", pincode: "110016",
    createdAt: daysAgo(0.1),
  },
  {
    _id: "o003", orderNumber: "MM-8819",
    customer: { name: "Anjali Kapoor",  phone: "+91 76543 21098", email: "anjali@email.com" },
    items: [
      { emoji:"🥟", name:"Fried Veg Momos",   qty:1, price:70 },
      { emoji:"🌯", name:"Paneer Roll",         qty:2, price:80 },
    ],
    subtotal: 230, deliveryCharge: 0, total: 230,
    status: "Preparing", paymentMethod: "online", paymentStatus: "Paid",
    address: "8 Saket, South Delhi", pincode: "110017",
    createdAt: daysAgo(0.08),
  },
  {
    _id: "o004", orderNumber: "MM-8818",
    customer: { name: "Arjun Singh",    phone: "+91 65432 10987", email: "arjun@email.com" },
    items: [
      { emoji:"🥟", name:"Tandoori Momos", qty:2, price:90 },
      { emoji:"🥛", name:"Sweet Lassi",    qty:1, price:40 },
    ],
    subtotal: 220, deliveryCharge: 0, total: 220,
    status: "Confirmed", paymentMethod: "cod", paymentStatus: "Pending",
    address: "5 Malviya Nagar, New Delhi", pincode: "110017",
    createdAt: daysAgo(0.05),
  },
  {
    _id: "o005", orderNumber: "MM-8817",
    customer: { name: "Sneha Gupta",    phone: "+91 54321 09876", email: "sneha@email.com" },
    items: [
      { emoji:"🫕", name:"Aloo Samosa",    qty:4, price:30 },
      { emoji:"🍟", name:"French Fries",   qty:1, price:70 },
      { emoji:"☕", name:"Cutting Chai",   qty:2, price:20 },
    ],
    subtotal: 230, deliveryCharge: 0, total: 230,
    status: "Pending", paymentMethod: "online", paymentStatus: "Paid",
    address: "22 Green Park, New Delhi", pincode: "110016",
    createdAt: daysAgo(0.02),
  },
  {
    _id: "o006", orderNumber: "MM-8816",
    customer: { name: "Vikram Nair",    phone: "+91 43210 98765", email: "vikram@email.com" },
    items: [
      { emoji:"🥟", name:"Steam Chicken Momos", qty:2, price:80 },
      { emoji:"🌶️", name:"Chilli Potato",       qty:1, price:80 },
    ],
    subtotal: 240, deliveryCharge: 0, total: 240,
    status: "Cancelled", paymentMethod: "online", paymentStatus: "Refunded",
    address: "11 Dwarka Sector 10, New Delhi", pincode: "110075",
    createdAt: daysAgo(0.5),
  },
  {
    _id: "o007", orderNumber: "MM-8815",
    customer: { name: "Meera Joshi",    phone: "+91 32109 87654", email: "meera@email.com" },
    items: [
      { emoji:"🌯", name:"Chicken Roll",       qty:2, price:100 },
      { emoji:"🌽", name:"Masala Corn",         qty:1, price:50  },
      { emoji:"🍋", name:"Nimbu Paani",         qty:2, price:30  },
    ],
    subtotal: 310, deliveryCharge: 0, total: 310,
    status: "Delivered", paymentMethod: "cod", paymentStatus: "Paid",
    address: "33 Vasant Kunj, New Delhi", pincode: "110070",
    createdAt: daysAgo(1),
  },
  {
    _id: "o008", orderNumber: "MM-8814",
    customer: { name: "Dev Sharma",     phone: "+91 21098 76543", email: "dev@email.com" },
    items: [
      { emoji:"🥟", name:"Kurkure Momos", qty:2, price:80 },
      { emoji:"🥛", name:"Sweet Lassi",   qty:2, price:40 },
    ],
    subtotal: 240, deliveryCharge: 0, total: 240,
    status: "Delivered", paymentMethod: "online", paymentStatus: "Paid",
    address: "7 Rohini Sector 8, New Delhi", pincode: "110085",
    createdAt: daysAgo(1.5),
  },
];

export const STATUS_CONFIG = {
  "Pending":         { bg: "bg-yellow-100",  text: "text-yellow-800",  dot: "bg-yellow-500"  },
  "Confirmed":       { bg: "bg-blue-100",    text: "text-blue-800",    dot: "bg-blue-500"    },
  "Preparing":       { bg: "bg-purple-100",  text: "text-purple-800",  dot: "bg-purple-500"  },
  "Out for Delivery":{ bg: "bg-indigo-100",  text: "text-indigo-800",  dot: "bg-indigo-500"  },
  "Delivered":       { bg: "bg-green-100",   text: "text-green-800",   dot: "bg-green-500"   },
  "Cancelled":       { bg: "bg-red-100",     text: "text-red-800",     dot: "bg-red-500"     },
};