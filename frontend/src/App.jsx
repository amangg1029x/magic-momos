import { useEffect, useRef } from "react";
import { NavigationProvider, useNav } from "./context/NavigationContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useCart } from "./hooks/useCart";
import { getAdminToken, getDeliveryToken } from "./services/api";
import ToastContainer from "./components/ToastContainer";

// Pages
import HomePage         from "./pages/HomePage";
import MenuPage         from "./pages/MenuPage";
//import AboutPage        from "./pages/AboutPage";
import ContactPage      from "./pages/ContactPage";
import CheckoutPage     from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import TrackOrderPage   from "./pages/TrackOrderPage";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import AccountPage      from "./pages/AccountPage";
import AdminPage        from "./pages/AdminPage";
import DeliveryPage     from "./pages/DeliveryPage";
import OutOfRangePage    from "./pages/OutOfRangePage";
import TermsPage         from "./pages/TermsPage";
import PrivacyPage       from "./pages/PrivacyPage";
import RefundPage        from "./pages/RefundPage";
import CancellationPage  from "./pages/CancellationPage";
import BottomNavigation  from "./components/BottomNavigation";

function AppInner() {
  const { page, navigate, isNative } = useNav();

  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; });

  // ── Deep-link via URL hash ────────────────────────────────────────────────
  // Delivery partners can bookmark  https://yourapp.com/#delivery
  // Admins automatically land on    https://yourapp.com/#admin  (or via stored token)
  // Razorpay policy pages:          https://yourapp.com/#terms  etc.
  // Runs once on mount only — the popstate listener in NavigationContext
  // handles subsequent back/forward navigation.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase().trim();
    if (hash === "delivery" || getDeliveryToken()) {
      navigateRef.current("delivery", null, { noScroll: true });
      return;
    }
    if (hash === "admin" || getAdminToken()) {
      navigateRef.current("admin", null, { noScroll: true });
      return;
    }
    const DIRECT_PAGES = ["terms", "privacy", "refund", "cancellation", "menu", "contact", "login", "register"];
    if (DIRECT_PAGES.includes(hash)) {
      navigateRef.current(hash, null, { noScroll: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * The cart lives here, one level above every page, so that adding an
   * item on MenuPage and then navigating to CheckoutPage sees the exact
   * same in-memory state (no remount, no re-read from localStorage mid-flow).
   * useCart() still persists to localStorage under the hood, so a hard
   * refresh on any page won't lose the cart either.
   */
  const cart = useCart();

  const renderPage = () => {
    switch (page) {
      case "menu":        return <MenuPage cart={cart} />;
//    case "about":       return <AboutPage />;
      case "contact":     return <ContactPage />;
      case "checkout":    return (
        <ProtectedRoute>
          <CheckoutPage cart={cart} />
        </ProtectedRoute>
      );
      case "success":     return <OrderSuccessPage />;
      case "track":       return <TrackOrderPage />;
      case "login":       return <LoginPage />;
      case "register":    return <RegisterPage />;
      case "out-of-range":  return <OutOfRangePage />;
      case "terms":         return <TermsPage />;
      case "privacy":       return <PrivacyPage />;
      case "refund":        return <RefundPage />;
      case "cancellation":  return <CancellationPage />;
      case "delivery":    return <DeliveryPage />;
      case "account":
        return (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        );
      case "admin":
        return <AdminPage />;
      default:            return <HomePage />;
    }
  };

  return (
    <div className={isNative ? "pb-24" : ""}>
      {renderPage()}
      <BottomNavigation />
    </div>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      {/*
        AuthProvider must sit inside NavigationProvider so AuthContext
        can call navigate() on token expiry in the future.
        NotificationProvider wraps both so all pages can consume notifications.
      */}
      <AuthProvider>
        <NotificationProvider>
          <AppInner />
          <ToastContainer />
        </NotificationProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}