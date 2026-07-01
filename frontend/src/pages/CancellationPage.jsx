import PolicyPage, { PolicySection, PolicyList } from "./PolicyPage";

export default function CancellationPage() {
  return (
    <PolicyPage title="Cancellation Policy" lastUpdated="June 2025">
      <PolicySection title="1. Order Cancellation by Customer">
        <p>
          You may cancel your order only if it is still in <strong className="text-mm-cream">Pending</strong> status
          (i.e., not yet accepted by the kitchen). Once the order moves to <strong className="text-mm-cream">Confirmed</strong> or{" "}
          <strong className="text-mm-cream">Preparing</strong>, it cannot be cancelled as preparation has already begun.
        </p>
      </PolicySection>

      <PolicySection title="2. How to Cancel">
        <PolicyList items={[
          "Open the app and go to Account → Orders.",
          "Find your active order and tap 'Cancel Order' (visible only while order is Pending).",
          "Alternatively, call us immediately at +91 70422 89004 and we will attempt to stop preparation.",
        ]} />
      </PolicySection>

      <PolicySection title="3. Cancellation by Magic Momos">
        <p>We reserve the right to cancel any order in the following scenarios:</p>
        <PolicyList items={[
          "Delivery address is outside our serviceable zone.",
          "Items ordered are temporarily out of stock.",
          "Payment verification fails or is flagged as fraudulent.",
          "Severe weather, natural calamity, or operational emergencies.",
          "Incorrect pricing due to a technical error on our platform.",
        ]} />
        <p className="mt-2">
          If we cancel your order, you will be notified immediately and a full refund will be issued automatically.
        </p>
      </PolicySection>

      <PolicySection title="4. Refund on Cancellation">
        <PolicyList items={[
          "Cancellations made while in Pending status: full refund to original payment method.",
          "Cancellations after preparation has started: no refund (food cannot be reused).",
          "Cancellations initiated by Magic Momos: full refund regardless of stage.",
          "Refunds are typically processed within 5–7 business days.",
        ]} />
      </PolicySection>

      <PolicySection title="5. Repeated Cancellations">
        <p>
          Customers who repeatedly cancel confirmed orders may have their account flagged or restricted
          from placing future orders to prevent food wastage and protect our delivery partners.
        </p>
      </PolicySection>

      <PolicySection title="6. Contact">
        <p>
          To cancel an order or for any cancellation-related queries, please contact us immediately at{" "}
          <a href="mailto:support@magicmomos.app" className="text-mm-red hover:underline">support@magicmomos.app</a>{" "}
          or call <a href="tel:+917042289004" className="text-mm-red hover:underline">+91 70422 89004</a>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
