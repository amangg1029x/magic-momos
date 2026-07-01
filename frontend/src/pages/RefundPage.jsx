import PolicyPage, { PolicySection, PolicyList } from "./PolicyPage";

export default function RefundPage() {
  return (
    <PolicyPage title="Refund Policy" lastUpdated="June 2025">
      <PolicySection title="1. Overview">
        <p>
          At Magic Momos, we take quality seriously. If you are not satisfied with your order, we are
          here to help. Please read this policy carefully before placing an order.
        </p>
      </PolicySection>

      <PolicySection title="2. Eligibility for Refund">
        <p>You may be eligible for a full or partial refund in the following situations:</p>
        <PolicyList items={[
          "You received the wrong items in your order.",
          "Your order arrived in a damaged or spoiled condition.",
          "Your order was significantly delayed beyond our estimated time and you did not receive it.",
          "A duplicate payment was charged for the same order.",
        ]} />
      </PolicySection>

      <PolicySection title="3. Non-Refundable Situations">
        <p>Refunds will NOT be issued in the following cases:</p>
        <PolicyList items={[
          "Change of mind after the order has been confirmed and preparation has begun.",
          "Incorrect delivery address provided by the customer.",
          "Order successfully delivered but customer was unavailable to receive it.",
          "Dissatisfaction based on personal taste preference (spice level, portion size, etc.) where the item was prepared as described on the menu.",
          "Promotional or discounted orders (unless the item itself was wrong or damaged).",
        ]} />
      </PolicySection>

      <PolicySection title="4. How to Request a Refund">
        <p>To request a refund:</p>
        <PolicyList items={[
          "Contact us within 1 hour of receiving your order.",
          "Email support@magicmomos.app or call +91 70422 89004 with your order number.",
          "Attach a photo of the incorrect or damaged item where applicable.",
          "Our team will review your request within 24 hours.",
        ]} />
      </PolicySection>

      <PolicySection title="5. Refund Processing">
        <PolicyList items={[
          "Approved refunds will be credited to the original payment method.",
          "Refunds typically take 5–7 business days depending on your bank or payment provider.",
          "UPI refunds are generally faster (1–3 business days).",
          "You will receive an email notification once the refund has been initiated.",
        ]} />
      </PolicySection>

      <PolicySection title="6. Partial Refunds">
        <p>
          In cases where only part of an order was incorrect or missing, we may issue a partial refund
          or offer store credit at our discretion.
        </p>
      </PolicySection>

      <PolicySection title="7. Contact">
        <p>
          For all refund-related queries, reach out to us at{" "}
          <a href="mailto:support@magicmomos.app" className="text-mm-red hover:underline">support@magicmomos.app</a>{" "}
          or +91 70422 89004.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
