"use client";

import { useEffect, useState } from "react";

type Tracking = {
  orderNumber: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items: { name: string; quantity: number }[];
};

const stages = [
  { label: "Placed", statuses: ["PENDING"] },
  { label: "Processed", statuses: ["CONFIRMED", "PROCESSING", "PACKED"] },
  { label: "Shipped", statuses: ["SHIPPED"] },
  { label: "Out for delivery", statuses: ["OUT_FOR_DELIVERY"] },
  { label: "Delivered", statuses: ["DELIVERED"] },
];

function label(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function stageIndex(status: string) {
  if (status === "CANCELLED" || status === "PAYMENT_FAILED") return -1;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].statuses.includes(status)) return i;
  }
  if (status === "PROCESSING" || status === "PACKED" || status === "CONFIRMED") return 1;
  return 0;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function TrackPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Tracking | null>(null);

  useEffect(() => {
    const savedOrderNumber = new URLSearchParams(window.location.search).get("orderNumber");
    if (savedOrderNumber && /^[0-9]+$/.test(savedOrderNumber)) setNumber(savedOrderNumber);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: number, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not find this order.");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not look up this order.");
    } finally {
      setLoading(false);
    }
  }

  const currentStage = order ? stageIndex(order.status) : -1;
  const cancelled = order?.status === "CANCELLED" || order?.status === "PAYMENT_FAILED";

  return (
    <main className="container track-page">
      <section className="track-intro">
        <span className="eyebrow">ORDER STATUS</span>
        <h1>Track your makhana.</h1>
        <p>Enter your customer order number and the email address used at checkout.<br className="track-desktop-break" /> For privacy, we only show delivery progress and item names here.</p>
      </section>

      <form className="track-form" onSubmit={submit}>
        <label className="track-field">
          <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7z"/><path d="M10 7h4M10 11h4M10 15h2"/></svg>Customer order number</span>
          <input required inputMode="numeric" pattern="[0-9]+" value={number} onChange={e => setNumber(e.target.value)} placeholder="e.g. 1234" />
        </label>
        <label className="track-field">
          <span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>Checkout email</span>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <button className="btn track-submit" type="submit" disabled={loading}>{loading ? "Looking up order…" : <>Track order <span aria-hidden="true">→</span></>}</button>
        {error && <p role="alert" className="checkout-error track-error">{error}</p>}
      </form>

      {order && (
        <section className="track-result" aria-live="polite">
          <div className="track-result-head">
            <div className="track-order-thumb" aria-hidden="true"><span>✿</span><span>✦</span><span>❋</span></div>
            <div className="track-order-summary">
              <div className="track-order-title"><h2>Order #{order.orderNumber}</h2><span className={cancelled ? "track-status track-status-cancelled" : "track-status"}>{label(order.status)}</span></div>
              <p className="track-order-subtitle">{cancelled ? "Please contact store support if you need help." : "Thank you for shopping with Makhana House."}</p>
              <p className="track-order-date">Order placed {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {cancelled ? (
            <p className="track-cancelled-note">This order is {label(order.status).toLowerCase()}. Please contact store support if you need assistance.</p>
          ) : (
            <div className="track-timeline" aria-label="Delivery progress">
              {stages.map((stage, i) => {
                const done = i <= currentStage;
                const active = i === currentStage;
                return <div className={`track-timeline-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`} key={stage.label}>
                  <div className="track-timeline-line" aria-hidden="true" />
                  <span className="track-timeline-icon" aria-hidden="true">{done ? "✓" : i === 4 ? "⌂" : "○"}</span>
                  <strong>{stage.label}</strong>
                </div>;
              })}
            </div>
          )}

          <div className="track-items">
            <div className="track-items-heading"><h3>Items in this order</h3><span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span></div>
            {order.items.map((item, i) => <div className="track-item" key={`${item.name}-${i}`}><span>{item.name}</span><strong>× {item.quantity}</strong></div>)}
          </div>
          <p className="track-updated">Last updated {new Date(order.updatedAt).toLocaleString("en-IN")}</p>
        </section>
      )}

      <p className="track-help">Already have an account? View your full order history in <a className="text-link" href="/orders">My Orders</a>.</p>
    </main>
  );
}
