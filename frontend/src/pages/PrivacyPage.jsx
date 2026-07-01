import PolicyPage, { PolicySection, PolicyList } from "./PolicyPage";

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" lastUpdated="June 2025">
      <PolicySection title="1. Introduction">
        <p>
          Magic Momos ("we", "us", "our") is committed to protecting your personal information. This
          Privacy Policy explains how we collect, use, and safeguard your data when you use our website
          or mobile application.
        </p>
      </PolicySection>

      <PolicySection title="2. Information We Collect">
        <PolicyList items={[
          "Personal identification: name, email address, phone number.",
          "Delivery address and location coordinates (used solely for delivery zone validation).",
          "Order history and preferences.",
          "Device information and browser type for analytics.",
          "Payment transaction references (we do NOT store card numbers or CVVs).",
        ]} />
      </PolicySection>

      <PolicySection title="3. How We Use Your Information">
        <PolicyList items={[
          "To process and deliver your orders.",
          "To send order confirmation and status updates.",
          "To respond to your customer support queries.",
          "To improve our menu, services, and user experience.",
          "To send promotional offers (only if you have opted in).",
          "To comply with legal obligations.",
        ]} />
      </PolicySection>

      <PolicySection title="4. Data Sharing">
        <p>
          We do not sell or rent your personal data to third parties. We may share data with:
        </p>
        <PolicyList items={[
          "Razorpay — to process payments securely.",
          "Delivery partners — limited to name, phone, and address for order fulfilment.",
          "Cloud service providers — for hosting and infrastructure (data stored securely in India).",
          "Law enforcement — if required by Indian law or court order.",
        ]} />
      </PolicySection>

      <PolicySection title="5. Cookies">
        <p>
          Our website uses essential cookies to maintain your session and cart. We do not use
          third-party tracking cookies. You can disable cookies in your browser settings, but this
          may affect website functionality.
        </p>
      </PolicySection>

      <PolicySection title="6. Data Retention">
        <p>
          We retain your personal data for as long as your account is active or as required by
          applicable law. You may request deletion of your account and associated data at any time
          by emailing us.
        </p>
      </PolicySection>

      <PolicySection title="7. Security">
        <p>
          We implement industry-standard security measures including HTTPS encryption, JWT-based
          authentication, and password hashing (bcrypt) to protect your data. However, no method
          of transmission over the internet is 100% secure.
        </p>
      </PolicySection>

      <PolicySection title="8. Your Rights">
        <PolicyList items={[
          "Access the personal data we hold about you.",
          "Request correction of inaccurate data.",
          "Request deletion of your account and data.",
          "Withdraw consent for marketing communications at any time.",
        ]} />
        <p className="mt-2">To exercise any of these rights, email us at <a href="mailto:support@ge " className="text-mm-red hover:underline">support@magicmomos.app</a>.</p>
      </PolicySection>

      <PolicySection title="9. Contact">
        <p>
          For privacy-related concerns, contact our Data Controller at{" "}
          <a href="mailto:support@magicmomos.app" className="text-mm-red hover:underline">support@magicmomos.app</a>{" "}
          or call +91 70422 89004.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
