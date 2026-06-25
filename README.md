# Magic Momos 🥟 — Full-Stack Ordering & Delivery Platform

**Magic Momos** is a premium, end-to-end online momo ordering, tracking, and delivery management platform. It features an immersive customer web application (with Capacitor integration for mobile packaging), a fully loaded administrative panel for kitchen and store operations, and a dedicated interface for delivery partners.

---

## 🏗️ Project Structure & Architecture

The workspace is structured into two main components:
*   **[`frontend`](file:///c:/Users/amang/Downloads/magic-momos/frontend)**: React + Vite application powered by Tailwind CSS, Capacitor, and React-Leaflet maps.
*   **[`backend`](file:///c:/Users/amang/Downloads/magic-momos/backend)**: Node.js + Express API server communicating with MongoDB Atlas.

---

## 🌟 Key Features

### 1. 🛒 Customer Experience
*   **Live Interactive Menu**: Seamless filtering by categories (Steamed, Fried, Tandoori, Baked, Desserts) with custom sizing (Regular/Large), dipping selections, spice customizations, and special preparation notes.
*   **Dynamic Delivery Zone Gate**: Employs interactive Leaflet maps with custom marker dragging to check if the user's address falls within the restaurant's delivery radius. Limits checkout if coordinates are out-of-range.
*   **Advanced Cart & Checkout**: Interactive side cart drawer, address selector modal, and itemized billing breakdown.
*   **Razorpay Integration**: Setup for seamless digital payment processing.
*   **Real-time Order Tracking**: Customer order tracking board mapping live order states (`Ordered` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`) along with custom map pins.
*   **Notification System**: Push-style in-app notification logs and interactive toast messages to keep users updated on state changes.
*   **Authentication & Profile**: Complete register/login flows (JWT-secured) and profile details management.

### 2. 👑 Admin Dashboard
*   **Business Insights**: Live analytics summary containing total revenue metrics, order tallies, registered users count, and top-selling items.
*   **Menu Management CRUD**: Create, read, update, and delete menu items, pricing tiers, descriptions, category groupings, and active availability.
*   **Order Fulfillment Center**: Live order pipeline where staff can review active tickets, update delivery states, and assign delivery riders.
*   **Promotional Campaign Manager**: Add, edit, and toggle discount codes with specific discount percentage/flat rates and minimum order amount criteria.
*   **Store Settings Console**: Central configuration panel for store open/closed states, base delivery charges, tax configurations, free delivery thresholds, and global alert banner text.
*   **User Management**: Quick overview of customer registries and role settings.

### 3. 🚴 Delivery Partner App
*   **Rider Login Portal**: Distinct login system tailored for delivery agents.
*   **Interactive Task List**: Shows assigned delivery tasks, containing order summaries, direct customer contact details, mapped address coordinates, and visual navigation routes.
*   **Earning Logs**: Panel tracking total completed deliveries and aggregated courier earnings.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Core** | React (Vite), JavaScript |
| **Styling** | Tailwind CSS, CSS Variables |
| **Maps & Location** | Leaflet, React-Leaflet |
| **Mobile Integration** | Capacitor CLI |
| **Payments** | Razorpay SDK |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt |
| **Utilities & Email** | Nodemailer (Contact Query emails) |
| **Hosting Config** | Vercel (`vercel.json` templates) |

---

## 🚀 Quick Start Guide

### 1. Database Configuration
1. Set up a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Security → Network Access**, add `0.0.0.0/0` (required for Vercel/dynamic server environments).
3. Copy your Connection URI.

### 2. Backend Setup
1. Open the [backend](file:///c:/Users/amang/Downloads/magic-momos/backend) directory:
   ```bash
   cd backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Fill in your [backend/.env](file:///c:/Users/amang/Downloads/magic-momos/backend/.env) file:
   ```env
   MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/magic-momos?retryWrites=true&w=majority
   JWT_SECRET=use_a_secure_random_hash
   JWT_ADMIN_SECRET=use_a_different_secure_random_hash
   CLIENT_URL=http://localhost:5173
   SMTP_USER=your_gmail@gmail.com
   SMTP_PASS=app_specific_gmail_password
   CONTACT_RECEIVER=magicmomos12@gmail.com
   ```
5. Seed the database (creates the default admin credentials and initial menu list):
   ```bash
   npm run seed
   ```
   *Default Admin credentials:*
   *   **Email**: `admin@magicmomos.in`
   *   **Password**: `Admin@1234`
6. Run the server in development mode:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open the [frontend](file:///c:/Users/amang/Downloads/magic-momos/frontend) directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Create the environment file [frontend/.env](file:///c:/Users/amang/Downloads/magic-momos/frontend/.env):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run the frontend server locally:
   ```bash
   npm run dev
   ```
5. Build the production build (dist):
   ```bash
   npm run build
   ```
