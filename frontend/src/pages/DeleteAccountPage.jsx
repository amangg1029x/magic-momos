import { useState } from "react";
import PolicyPage, { PolicySection, PolicyList } from "./PolicyPage";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavigationContext";
import api from "../services/api";
import { Trash2, AlertCircle, CheckCircle } from "lucide-react";

export default function DeleteAccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { navigate } = useNav();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await api.auth.deleteAccount();
      setSuccess(true);
      logout();
      setTimeout(() => {
        navigate("home");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to delete account. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PolicyPage title="Account Deletion & Data Removal" lastUpdated="August 2026">
      <PolicySection title="1. How to Delete Your Account">
        <p>
          At Magic Momos, you have full control over your personal data. You can delete your account
          and all associated personal information directly through the app or by submitting a request.
        </p>
        <p>
          <strong>Within the Mobile App / Website:</strong> Go to <em>Account → Settings → Delete Account</em>.
          Confirm your deletion and your account will be permanently deleted immediately.
        </p>
      </PolicySection>

      <PolicySection title="2. Types of Data Deleted">
        <p>Upon deleting your account, the following data is permanently purged from our servers:</p>
        <PolicyList items={[
          "Your name, email address, phone number, and password credentials.",
          "All saved delivery addresses and geographical coordinates.",
          "Device notification tokens (FCM push notification tokens).",
          "Customer notification history and inbox messages.",
        ]} />
      </PolicySection>

      <PolicySection title="3. Data Retention for Accounting & Legal Compliance">
        <p>
          Past financial transaction records and invoice receipts (order items, billing amounts, Razorpay payment reference IDs)
          may be retained for a mandatory retention period strictly for legal, tax, and accounting compliance under Indian law.
          These records will no longer be linked to an active user profile.
        </p>
      </PolicySection>

      <PolicySection title="4. Manual Deletion Request">
        <p>
          If you are unable to log in or wish to request data deletion via email, you can send an email to:
        </p>
        <p className="font-bold text-mm-red">
          magicmomos12@gmail.com
        </p>
        <p>
          Please provide your registered email address and phone number with the subject line <em>"Account Deletion Request"</em>.
          We process all manual deletion requests within 48 to 72 hours.
        </p>
      </PolicySection>

      {/* Interactive In-Page Delete Card if logged in */}
      <div className="mt-10 p-6 bg-mm-card rounded-2xl border border-red-200/40">
        <h3 className="font-display text-xl text-red-600 mb-2">Delete Your Account Now</h3>
        {isAuthenticated && user ? (
          <div>
            <p className="font-body text-sm text-mm-cream mb-4">
              You are currently logged in as <strong>{user.email}</strong>.
            </p>
            {success ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-sm font-bold">
                <CheckCircle size={16} />
                <span>Your account and data have been successfully deleted. Redirecting...</span>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-4">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                {!confirmOpen ? (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-body font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={15} /> Delete Account ({user.email})
                  </button>
                ) : (
                  <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 space-y-3">
                    <p className="text-xs font-bold text-red-700">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmOpen(false)}
                        disabled={loading}
                        className="px-4 py-2 bg-mm-card2 border border-mm-border rounded-lg text-xs font-bold text-mm-cream cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
                      >
                        {loading ? "Deleting..." : "Confirm Permanent Deletion"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="font-body text-xs text-mm-muted mb-4">
              To delete your account instantly, please log in first, or send an email to <span className="text-mm-cream font-bold">magicmomos12@gmail.com</span>.
            </p>
            <button
              onClick={() => navigate("login")}
              className="bg-mm-card2 hover:bg-mm-border text-mm-cream border border-mm-border px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Sign In to Delete Account
            </button>
          </div>
        )}
      </div>
    </PolicyPage>
  );
}
