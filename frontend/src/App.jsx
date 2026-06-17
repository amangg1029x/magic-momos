import { useEffect } from "react";
import { NavigationProvider, useNav } from "./context/NavigationContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useCart } from "./hooks/useCart";
import { getAdminToken } from "./services/api";

// Pages
import HomePage         from "./pages/HomePage";
import MenuPage         from "./pages/MenuPage";
import AboutPage        from "./pages/AboutPage";
import ContactPage      from "./pages/ContactPage";
import CheckoutPage     from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import AccountPage      from "./pages/AccountPage";
import AdminPage        from "./pages/AdminPage";
import OutOfRangePage from "./pages/OutOfRangePage";

function AppInner() {
  const { page, navigate } = useNav();

  useEffect(() => {
    if (getAdminToken()) {
      navigate("admin");
    }
  }, [navigate]);

  /**
   * The cart lives here, one level above every page, so that adding an
   * item on MenuPage and then navigating to CheckoutPage sees the exact
   * same in-memory state (no remount, no re-read from localStorage mid-flow).
   * useCart() still persists to localStorage under the hood, so a hard
   * refresh on any page won't lose the cart either.
   */
  const cart = useCart();

  switch (page) {
    case "menu":     return <MenuPage cart={cart} />;
    case "about":    return <AboutPage />;
    case "contact":  return <ContactPage />;
    case "checkout": return <CheckoutPage cart={cart} />;
    case "success":  return <OrderSuccessPage />;
    case "login":    return <LoginPage />;
    case "register": return <RegisterPage />;
    case "out-of-range": return <OutOfRangePage />
    case "account":
      return (
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      );
    case "admin":
      return <AdminPage />;
    default:         return <HomePage />;
  }
}

export default function App() {
  return (
    <NavigationProvider>
      {/*
        AuthProvider must sit inside NavigationProvider so AuthContext
        can call navigate() on token expiry in the future.
      */}
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </NavigationProvider>
  );
}