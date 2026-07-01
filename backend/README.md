# Magic Momos — Backend Setup & Frontend Integration Guide

## Project Structure

```
magic-momos/
├── frontend/          ← your existing Vite + React project
└── backend/           ← NEW: Node.js + Express + MongoDB API
    ├── config/
    │   └── db.js               MongoDB connection
    ├── controllers/
    │   ├── authController.js   Customer register/login
    │   ├── adminAuthController.js
    │   ├── menuController.js   Menu CRUD
    │   ├── orderController.js  Place/track + admin mgmt
    │   └── contactController.js
    ├── middleware/
    │   ├── auth.js             JWT middleware
    │   ├── errorHandler.js     Central error handling
    │   └── validators.js       Input validation rules
    ├── models/
    │   ├── User.js
    │   ├── Admin.js
    │   ├── MenuItem.js
    │   ├── Order.js
    │   └── Contact.js
    ├── routes/
    │   ├── auth.js
    │   ├── admin.js
    │   ├── menu.js
    │   ├── orders.js
    │   └── contact.js
    ├── scripts/
    │   └── seed.js             Populates DB + creates admin
    ├── frontend-service/
    │   └── api.js              ← COPY this into your frontend
    ├── server.js
    ├── vercel.json
    ├── .env.example
    └── package.json
```

---

## ─── STEP 1: MongoDB Atlas Setup ────────────────────────────────────────────

1. Go to https://mongodb.com/atlas and create a **free** account
2. Create a **free M0 cluster** (choose any region)
3. Under **Security → Database Access**: create a DB user with **read/write** access
4. Under **Security → Network Access**: click **"Add IP Address" → "Allow Access from Anywhere"** (`0.0.0.0/0`)  
   *(Vercel uses dynamic IPs, so this is required)*
5. Click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## ─── STEP 2: Backend Local Setup ────────────────────────────────────────────

```bash
# 1. Enter backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your .env file from the template
cp .env.example .env
```

Now edit `backend/.env`:

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/magic-momos?retryWrites=true&w=majority
JWT_SECRET=pick_any_long_random_string_32_chars
JWT_ADMIN_SECRET=pick_a_different_long_random_string
CLIENT_URL=http://localhost:5173

# Optional — for contact form emails (Gmail App Password)
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=xxxx_xxxx_xxxx_xxxx
CONTACT_RECEIVER=support@magicmomos.app
```

**Generate secure JWT secrets** (run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run it twice — use one for `JWT_SECRET`, one for `JWT_ADMIN_SECRET`.

```bash
# 4. Seed the database (creates all 22 menu items + admin account)
npm run seed

# 5. Start the dev server
npm run dev
```

Confirm it's working:
```bash
curl http://localhost:5000/api/health
# → {"success":true,"message":"Magic Momos API is running 🥟",...}
```

**Default admin credentials** (change after first login!):
- Email: `admin@magicmomos.in`
- Password: `Admin@1234`

---

## ─── STEP 3: Connect Frontend to Backend ────────────────────────────────────

### 3a. Add the API service to your frontend

Copy `backend/frontend-service/api.js` into your frontend:

```bash
cp backend/frontend-service/api.js frontend/src/services/api.js
```

### 3b. Add environment variable to your frontend

Create `frontend/.env` (and `frontend/.env.production`):

```env
# frontend/.env  (local development)
VITE_API_URL=http://localhost:5000/api

# frontend/.env.production  (after deploying backend to Vercel)
VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
```

### 3c. Wire up the Contact Form

In `frontend/src/components/ContactForm.jsx`, replace the fake `setTimeout` with:

```jsx
import api from "../services/api";

// Inside handleSubmit, replace the setTimeout block with:
const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length) { setErrors(errs); return; }

  setLoading(true);
  try {
    await api.contact.submit(form);
    setSubmitted(true);
  } catch (err) {
    setErrors({ message: err.message || "Something went wrong. Please try again." });
  } finally {
    setLoading(false);
  }
};
```

### 3d. Wire up the Menu Page (live data instead of static)

In `frontend/src/pages/MenuPage.jsx`, add this useEffect to load menu from the API:

```jsx
import { useState, useEffect, useMemo } from "react";
import api from "../services/api";

// Inside MenuPage component, add:
const [menuItems, setMenuItems] = useState([]);
const [menuLoading, setMenuLoading] = useState(true);

useEffect(() => {
  api.menu.getAll()
    .then(({ items }) => setMenuItems(items))
    .catch(console.error)
    .finally(() => setMenuLoading(false));
}, []);

// Then pass menuItems to MenuGrid and MenuCategoryFilter instead of
// the static MENU_ITEMS import. Also update the counts useMemo:
const counts = useMemo(() => {
  return menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});
}, [menuItems]);
```

### 3e. Wire up Place Order in CartSidebar

In `frontend/src/components/CartSidebar.jsx`, update the "Place Order" button:

```jsx
import api from "../services/api";
import { useNav } from "../context/NavigationContext";

// Inside the component, add:
const { navigate } = useNav();
const [ordering, setOrdering] = useState(false);

const handlePlaceOrder = async () => {
  setOrdering(true);
  try {
    const payload = {
      customer: {
        name:  "Guest",          // replace with form data / logged-in user
        phone: "9999999999",     // collect this in a checkout form
        email: "",
      },
      items: items.map((i) => ({ itemId: i.id, qty: i.qty })),
      address: {
        street:  "To be collected",  // add a checkout address step
        pincode: "110024",
      },
      paymentMethod: "cod",
    };

    const { order } = await api.orders.place(payload);
    onClear();
    onClose();
    navigate("success", { orderData: order });
  } catch (err) {
    alert(err.message || "Order failed. Please try again.");
  } finally {
    setOrdering(false);
  }
};
```

> 💡 For a full checkout flow, create a `CheckoutPage.jsx` that collects the delivery address, name, and phone before calling `api.orders.place()`.

---

## ─── STEP 4: Deploy to Vercel ───────────────────────────────────────────────

### 4a. Deploy the backend

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy from the backend directory
cd backend
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: your account
# - Link to existing project: No
# - Project name: magic-momos-api
# - Directory: ./  (current)
```

After first deploy, add your environment variables in the **Vercel Dashboard**:

1. Go to your project → **Settings → Environment Variables**
2. Add all variables from your `.env` file:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_ADMIN_SECRET`
   - `JWT_EXPIRES_IN` = `7d`
   - `JWT_ADMIN_EXPIRES_IN` = `1d`
   - `CLIENT_URL` = `https://YOUR-FRONTEND.vercel.app`
   - `NODE_ENV` = `production`
   - `SMTP_USER`, `SMTP_PASS`, `CONTACT_RECEIVER` (if using email)

3. **Redeploy** after adding vars: `vercel --prod`

Your API will be live at: `https://magic-momos-api.vercel.app/api`

### 4b. Deploy the frontend

```bash
cd frontend

# Create production env file
echo "VITE_API_URL=https://magic-momos-api.vercel.app/api" > .env.production

vercel
# or if already set up:
vercel --prod
```

### 4c. Update CORS

After deploying the frontend, copy its URL (e.g. `https://magic-momos.vercel.app`) and:
1. Go to your **backend** Vercel project → Settings → Environment Variables
2. Update `CLIENT_URL` = `https://magic-momos.vercel.app`
3. Redeploy backend: `vercel --prod` from `backend/`

---

## ─── API Reference ───────────────────────────────────────────────────────────

### Public Endpoints (no auth needed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/menu` | All menu items (supports `?category=momos&veg=true&search=chicken`) |
| GET | `/api/menu/:id` | Single menu item by itemId or _id |
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/login` | Customer login |
| POST | `/api/orders` | Place an order (guest or logged in) |
| GET | `/api/orders/:id` | Track order by _id or order number (e.g. MM-8821) |
| POST | `/api/contact` | Submit contact form |

### Customer Endpoints (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get my profile |
| PUT | `/api/auth/me` | Update name / phone / address |
| PUT | `/api/auth/change-password` | Change password |
| GET | `/api/orders/my` | My order history |
| POST | `/api/orders/:id/cancel` | Cancel an order |

### Admin Endpoints (require `Authorization: Bearer <admin_token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Revenue + order stats |
| GET | `/api/admin/orders` | All orders (with filters + pagination) |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| POST | `/api/admin/menu` | Create menu item |
| PUT | `/api/admin/menu/:id` | Update menu item |
| DELETE | `/api/admin/menu/:id` | Hide (or `?hard=true` to delete) |
| PATCH | `/api/admin/menu/:id/toggle` | Toggle item availability |
| GET | `/api/admin/contacts` | View contact form submissions |
| PATCH | `/api/admin/contacts/:id` | Mark as read/replied |

---

## ─── Gmail App Password (for contact form emails) ───────────────────────────

1. Enable 2-Step Verification on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select **"Mail"** and your device, click **Generate**
4. Copy the 16-character password and paste it into `SMTP_PASS` in your `.env`

---

## ─── Quick Test with curl ───────────────────────────────────────────────────

```bash
# Health check
curl http://localhost:5000/api/health

# Admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@magicmomos.in","password":"Admin@1234"}'

# Get menu
curl http://localhost:5000/api/menu

# Submit contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Aman","email":"test@test.com","message":"Hello Magic Momos!"}'
```
