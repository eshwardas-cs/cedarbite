// Added order confirmation system
```tsx
import type { OrderReceipt } from "../data/orderStorage";
import "./OrderConfirmation.css";

type OrderConfirmationProps = {
  receipt: OrderReceipt;
  onReturn: () => void;
};

export default function OrderConfirmation({
  receipt,
  onReturn,
}: OrderConfirmationProps) {
  return (
    <main className="order-confirmation">
      <section
        className="order-confirmation-card"
        aria-labelledby="confirmation-heading"
      >
        <div className="confirmation-check" aria-hidden="true">
          ✓
        </div>

        <p className="confirmation-eyebrow">CEDARBITE SAMPLE ORDER</p>
        <h1 id="confirmation-heading">Sample order saved</h1>
        <p className="confirmation-copy">
          Your sample receipt has been saved in this browser.
        </p>

        <div className="pickup-code">
          <span>Pickup code</span>
          <strong>{receipt.pickupCode}</strong>
        </div>

        <p className="confirmation-note">
          This local sample is not sent to the canteen and does not take
          payment.
        </p>

        <button
          className="confirmation-return"
          type="button"
          onClick={onReturn}
        >
          ← Return to menu
        </button>
      </section>
    </main>
  );
}
```