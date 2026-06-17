import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavigationContext";

/**
 * ProtectedRoute
 *
 * Wrap any page/component that requires login.
 * Shows a brief loading spinner while the token is being verified,
 * then either renders children or bounces to the login page.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <AccountPage />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, redirectTo = "login" }) {
  const { isAuthenticated, loading } = useAuth();
  const { navigate } = useNav();

  // ── While checking token ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-mm-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-4 border-mm-border border-t-mm-red"
        />
      </div>
    );
  }

  // ── Not logged in → redirect ────────────────────────────────────────────────
  if (!isAuthenticated) {
    // Small delay so the redirect feels intentional, not jarring
    setTimeout(() => navigate(redirectTo), 0);
    return null;
  }

  return children;
}