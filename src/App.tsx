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

  const visibleItems = menuItems.filter((item) => {
    const allowedForMode =
      orderMode === "quick" ? item.quickAllowed : item.scheduledAllowed;

    return item.available && allowedForMode;
  });

  const bucketCount = Object.values(bucket).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  function addToBucket(itemId: string) {
    setBucket((currentBucket) => ({
      ...currentBucket,
      [itemId]: (currentBucket[itemId] ?? 0) + 1,
    }));
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

        <button className="bucket-button" type="button">
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
            : "For prepared food. Choose an available pickup time in your bucket."}
        </p>
      </section>

      <section id="menu" className="menu-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE CANTEEN MENU</p>
            <h2>{orderMode === "quick" ? "Ready to collect" : "Prepared for pickup"}</h2>
          </div>

          <p aria-live="polite">
            {visibleItems.length} items
          </p>
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

      <footer id="about">
        CedarBite · A Cedar College student project
      </footer>
    </main>
  );
}

export default App;
