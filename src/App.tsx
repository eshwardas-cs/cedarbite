import { useState } from "react";
import { menuItems } from "./data/menu";
import type { OrderMode } from "./types";
import "./App.css";

function formatPrice(pricePaisa: number): string {
  const rupees = pricePaisa / 100;
  return `Rs ${rupees.toLocaleString("en-PK")}`;
}

function App() {
  const [orderMode, setOrderMode] = useState<OrderMode>("quick");
  const [bucket, setBucket] = useState<Record<string, number>>({});
  const [bucketIsOpen, setBucketIsOpen] = useState(false);

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
            onClick={() => setOrderMode("quick")}
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
            : "For prepared food. Pickup-time selection will be added in a later chunk."}
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
                      <span>
                        {formatPrice(item.pricePaisa)} each
                      </span>
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

              <p className="bucket-note">
                Checkout and payment will be added in a later chunk.
              </p>
            </>
          )}
        </section>
      )}

      <footer id="about">CedarBite · A Cedar College student project</footer>
    </main>
  );
}

export default App;