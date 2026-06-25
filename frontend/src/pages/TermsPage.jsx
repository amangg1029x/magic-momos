import PolicyPage, { PolicySection, PolicyList } from "./PolicyPage";

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions" lastUpdated="June 2025">
      <PolicySection title="1. Agreement to Terms">
        <p>
          By accessing or using the Magic Momos website (magic-momos.vercel.app) or our mobile application,
          you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
        </p>
      </PolicySection>

      <PolicySection title="2. About Us">
        <p>
          Magic Momos (referred to as "we", "us", or "our") is a food delivery and takeaway service
          operated from Gyan Mandir Chowk, Ekta Vihar, New Delhi – 110044, India.
          Contact: <a href="mailto:magicmomos12@gmail.com" className="text-mm-red hover:underline">magicmomos12@gmail.com</a> | +91 70422 89004.
        </p>
      </PolicySection>

      <PolicySection title="3. Eligibility">
        <p>You must be at least 18 years of age to place an order. By placing an order you confirm you meet this requirement.</p>
      </PolicySection>

      <PolicySection title="4. Orders & Pricing">
        <PolicyList items={[
          "All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes.",
          "We reserve the right to change prices at any time without prior notice.",
          "An order is confirmed only after you receive a confirmation notification or email.",
          "We reserve the right to cancel or refuse any order at our discretion.",
          "Availability of menu items may vary without notice.",
        ]} />
      </PolicySection>

      <PolicySection title="5. Delivery">
        <PolicyList items={[
          "Delivery is available within a 5 km radius of our restaurant location.",
          "Estimated delivery times are indicative and may vary due to traffic, weather, or demand.",
          "You are responsible for providing an accurate delivery address.",
          "If no one is available to receive the order, we are not liable for the loss.",
        ]} />
      </PolicySection>

      <PolicySection title="6. Payments">
        <p>
          Payments are processed securely via Razorpay. We accept UPI, credit/debit cards, net banking,
          and wallets. By making a payment, you agree to Razorpay's terms of service. We do not store
          your payment card details.
        </p>
      </PolicySection>

      <PolicySection title="7. Intellectual Property">
        <p>
          All content on this platform including logos, images, text, and design is the property of
          Magic Momos and may not be reproduced without prior written consent.
        </p>
      </PolicySection>

      <PolicySection title="8. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Magic Momos shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of our services.
        </p>
      </PolicySection>

      <PolicySection title="9. Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws of India. Any disputes
          shall be subject to the exclusive jurisdiction of courts in New Delhi.
        </p>
      </PolicySection>

      <PolicySection title="10. Contact">
        <p>
          For any questions regarding these Terms, please contact us at{" "}
          <a href="mailto:magicmomos12@gmail.com" className="text-mm-red hover:underline">magicmomos12@gmail.com</a>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
