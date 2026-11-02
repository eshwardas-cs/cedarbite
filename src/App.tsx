import { useEffect, useMemo, useState } from "react";
import { menuItems } from "./data/menu";
import { getUpcomingPickupSlots } from "./data/pickupSlots";
import type { OrderMode } from "./types";
import { getOrderReviewError } from "./data/orderValidation";
import "./App.css";

const fullPickupSlotIds: ReadonlySet<string> = new Set();

function formatPrice(pricePaisa: number): string {
  const rupees = pricePaisa / 100;
  return `Rs ${rupees.toLocaleString("en-PK")}`;
}

function App() {
  const [orderMode, setOrderMode] = useState<OrderMode>("quick");
  const [bucket, setBucket] = useState<Record<string, number>>({});
  const [bucketIsOpen, setBucketIsOpen] = useState(false);
  const [pickupSlotId, setPickupSlotId] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [reviewIsOpen, setReviewIsOpen] = useState(false);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30_000);

    return () => window.clearInterval(timerId);
  }, []);

  const pickupSlots = useMemo(
    () => getUpcomingPickupSlots(currentTime, fullPickupSlotIds),
    [currentTime],
  );

  useEffect(() => {
    const selectedSlotStillAvailable = pickupSlots.some(
      (slot) => slot.id === pickupSlotId,
    );

    if (pickupSlotId && !selectedSlotStillAvailable) {
      setPickupSlotId("");
    }
  }, [pickupSlotId, pickupSlots]);

  const visibleItems = menuItems.filter((item) => {
    const allowedForMode =
      orderMode === "quick" ? item.quickAllowed : item.scheduledAllowed;

    return item.available && allowedForMode;
  });

  const bucketLines = Object.entries(bucket)
    .map(([itemId, quantity]) => ({
      item: menuItems.find((menuItem) => menuItem.id === itemId),
      quantity,
    }))
    .filter(
      (line): line is { item: (typeof menuItems)[number]; quantity: number } =>
        line.item !== undefined,
    );

  const bucketCount = bucketLines.reduce(
    (total, line) => total + line.quantity,
    0,
  );

  const bucketSubtotal = bucketLines.reduce(
    (total, line) => total + line.item.pricePaisa * line.quantity,
    0,
  );
  const orderReviewError = getOrderReviewError({
  itemCount: bucketCount,
  orderMode,
  pickupSlotId,
});

  function addToBucket(itemId: string) {
    setBucket((currentBucket) => ({
      ...currentBucket,
      [itemId]: (currentBucket[itemId] ?? 0) + 1,
    }));
  }

  function decreaseQuantity(itemId: string) {
    setBucket((currentBucket) => {
      const currentQuantity = currentBucket[itemId] ?? 0;

      if (currentQuantity <= 1) {
        const updatedBucket = { ...currentBucket };
        delete updatedBucket[itemId];
        return updatedBucket;
      }

      return {
        ...currentBucket,
        [itemId]: currentQuantity - 1,
      };
    });
  }

  function removeFromBucket(itemId: string) {
    setBucket((currentBucket) => {
      const updatedBucket = { ...currentBucket };
      delete updatedBucket[itemId];
      return updatedBucket;
    });
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="#" aria-label="CedarBite home">
          Cedar<span>Bite</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#menu">Menu</a>
          <a href="#about">About</a>
        </nav>

        <button
          className="bucket-button"
          type="button"
          aria-expanded={bucketIsOpen}
          aria-controls="bucket-panel"
          onClick={() => setBucketIsOpen((isOpen) => !isOpen)}
        >
          Bucket <span>{bucketCount}</span>
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">CEDAR COLLEGE CANTEEN</p>
        <h1>
          Order your break.
          <br />
          Pick it up with ease.
        </h1>
        <p className="hero-copy">
          Choose ready-to-go favourites or schedule freshly prepared food.
        </p>

        <div className="mode-switch" aria-label="Choose an order type">
          <button
            type="button"
            aria-pressed={orderMode === "quick"}
            onClick={() => {
              setOrderMode("quick");
              setPickupSlotId("");
            }}
          >
            Quick Order
          </button>

          <button
            type="button"
            aria-pressed={orderMode === "scheduled"}
            onClick={() => setOrderMode("scheduled")}
          >
            Scheduled Order
          </button>
        </div>

        <p className="mode-help" aria-live="polite">
          {orderMode === "quick"
            ? "For ready-to-sell items. No pickup slot needed."
            : "For prepared food. Choose a pickup window from your bucket."}
        </p>
      </section>

      <section id="menu" className="menu-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE CANTEEN MENU</p>
            <h2>
              {orderMode === "quick" ? "Ready to collect" : "Prepared for pickup"}
            </h2>
          </div>

          <p aria-live="polite">{visibleItems.length} items</p>
        </div>

        <div className="menu-grid">
          {visibleItems.map((item) => (
            <article className="menu-card" key={item.id}>
              <div className="menu-card-top">
                <span className="category-label">{item.category}</span>
                <span className="availability-label">Available</span>
              </div>

              <h3>{item.name}</h3>
              <p>{item.description}</p>

              <div className="menu-card-bottom">
                <strong>{formatPrice(item.pricePaisa)}</strong>
                <button type="button" onClick={() => addToBucket(item.id)}>
                  Add to bucket
                </button>
              </div>
            </article>
          ))}

          {visibleItems.length === 0 && (
            <p className="empty-message">
              There are no available items in this order mode right now.
            </p>
          )}
        </div>
      </section>

      {bucketIsOpen && (
        <section
          id="bucket-panel"
          className="bucket-panel"
          aria-labelledby="bucket-heading"
        >
          <div className="bucket-panel-header">
            <div>
              <p className="eyebrow">YOUR ORDER</p>
              <h2 id="bucket-heading">Your bucket</h2>
            </div>

            <button
              className="close-bucket-button"
              type="button"
              onClick={() => setBucketIsOpen(false)}
              aria-label="Close bucket"
            >
              Close
            </button>
          </div>

          {bucketLines.length === 0 ? (
            <p className="empty-message">Your bucket is empty.</p>
          ) : (
            <>
              <ul className="bucket-list">
                {bucketLines.map(({ item, quantity }) => (
                  <li className="bucket-line" key={item.id}>
                    <div className="bucket-line-details">
                      <strong>{item.name}</strong>
                      <span>{formatPrice(item.pricePaisa)} each</span>
                    </div>

                    <div className="bucket-line-actions">
                      <div
                        className="quantity-controls"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => addToBucket(item.id)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="remove-item-button"
                        type="button"
                        onClick={() => removeFromBucket(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="bucket-total">
                <span>Subtotal</span>
                <strong>{formatPrice(bucketSubtotal)}</strong>
              </div>
            </>
          )}

          {orderMode === "scheduled" && (
            <div className="pickup-slot-field">
              <label htmlFor="pickup-slot">Pickup window</label>

              {pickupSlots.length > 0 ? (
                <select
                  id="pickup-slot"
                  value={pickupSlotId}
                  onChange={(event) => setPickupSlotId(event.target.value)}
                >
                  <option value="">Choose a pickup time</option>
                  {pickupSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="no-pickup-slots" aria-live="polite">
                  No pickup windows are available right now.
                </p>
              )}

              {pickupSlotId && (
                <p className="selected-pickup-slot" aria-live="polite">
                  Selected:{" "}
                  {pickupSlots.find((slot) => slot.id === pickupSlotId)?.label}
                </p>
              )}
            </div>
          )}

          {reviewIsOpen ? (
  <section className="order-review" aria-labelledby="order-review-heading">
    <h3 id="order-review-heading">Review your order</h3>

    <p>
      Order type:{" "}
      <strong>
        {orderMode === "quick" ? "Quick Order" : "Scheduled Order"}
      </strong>
    </p>

    {orderMode === "scheduled" && (
      <p>
        Pickup window:{" "}
        <strong>
          {pickupSlots.find((slot) => slot.id === pickupSlotId)?.label}
        </strong>
      </p>
    )}

    <ul className="review-order-items">
      {bucketLines.map(({ item, quantity }) => (
        <li key={item.id}>
          <span>
            {item.name} × {quantity}
          </span>
          <strong>{formatPrice(item.pricePaisa * quantity)}</strong>
        </li>
      ))}
    </ul>

    <div className="review-order-total">
      <span>Subtotal</span>
      <strong>{formatPrice(bucketSubtotal)}</strong>
    </div>

    <button
      className="review-button review-button-secondary"
      type="button"
      onClick={() => setReviewIsOpen(false)}
    >
      Back to bucket
    </button>

    <p className="review-disclaimer">
      This is an order review. It does not submit an order or take payment.
    </p>
  </section>
) : (
  <div className="review-actions">
    <button
      className="review-button"
      type="button"
      disabled={Boolean(orderReviewError)}
      onClick={() => setReviewIsOpen(true)}
    >
      Review order
    </button>

    {orderReviewError && (
      <p className="review-error" aria-live="polite">
        {orderReviewError}
      </p>
    )}
  </div>
)}

          <p className="bucket-note">
            Checkout and payment will be added in a later chunk.
          </p>
        </section>
      )}

      <footer id="about">CedarBite · A Cedar College student project</footer>
    </main>
  );
}

export default App;