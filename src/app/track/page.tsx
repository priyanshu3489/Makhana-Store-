"use client";

import { useEffect, useState } from "react";

type Tracking = {
  orderNumber: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  shipping: { status: string | null; updatedAt: string | null; awb: string | null; courier: string | null; trackingUrl: string | null };
  items: { name: string; quantity: number }[];
};

const stages = [
  { label: "Placed", statuses: ["PENDING"] },
  { label: "Processed", statuses: ["CONFIRMED", "PROCESSING", "PACKED"] },
  { label: "Shipped", statuses: ["SHIPPED", "IN TRANSIT", "PICKUP SCHEDULED", "PICKED UP"] },
  { label: "Out for delivery", statuses: ["OUT_FOR_DELIVERY", "OUT FOR DELIVERY"] },
  { label: "Delivered", statuses: ["DELIVERED"] },
];

function label(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function progressStatus(order: Tracking) {
  const shipping = (order.shipping.status || "").toUpperCase().replaceAll("-", " ").trim();
  if (shipping.includes("DELIVERED")) return "DELIVERED";
  if (shipping.includes("OUT FOR DELIVERY")) return "OUT FOR DELIVERY";
  if (shipping.includes("TRANSIT") || shipping.includes("PICKED") || shipping.includes("PICKUP")) return shipping;
  return order.status;
}

function stageIndex(status: string) {
  if (status === "CANCELLED" || status === "PAYMENT_FAILED") return -1;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].statuses.includes(status)) return i;
  }
  return 0;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function stageDate(order: Tracking, index: number, currentStage: number) {
  if (index === 0) return formatDate(order.createdAt);
  if (index === currentStage) {
    const value = index >= 2 && order.shipping.updatedAt ? order.shipping.updatedAt : order.updatedAt;
    return formatDate(value);
  }
  return index < currentStage ? "Completed" : "Awaiting update";
}

export default function TrackPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Tracking | null>(null);

  useEffect(() => {
    const savedOrderNumber = new URLSearchParams(window.location.search).get("orderNumber");
    if (!savedOrderNumber || !/^[0-9]+$/.test(savedOrderNumber)) return;
    setNumber(savedOrderNumber);
    let cancelled = false;
    setAutoLoading(true);
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: savedOrderNumber }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sign in or enter your checkout email to view this order.");
        if (!cancelled) setOrder(data.order);
      })
      .catch(() => {
        // Guest users can still use the order number + checkout email form below.
      })
      .finally(() => {
        if (!cancelled) setAutoLoading(false);
      });
    return () => { cancelled = true; };
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

  const statusForProgress = order ? progressStatus(order) : "";
  const currentStage = order ? stageIndex(statusForProgress) : -1;
  const cancelled = order?.status === "CANCELLED" || order?.status === "PAYMENT_FAILED";

  return (
    <main className="container track-page">
      <section className="track-intro">
        <span className="eyebrow">ORDER STATUS</span>
        <h1>Track your makhana.</h1>
        <p>See every step of your order, from placement to delivery. Sign in and open Track order from My Orders for one-click access, or enter your order number and checkout email below.</p>
      </section>

      {!order && (
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
          {autoLoading && <p className="track-help">Loading your order securely…</p>}
        </form>
      )}

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
                  <small className="track-stage-date">{stageDate(order, i, currentStage)}</small>
                </div>;
              })}
            </div>
          )}

          {(order.shipping.status || order.shipping.awb || order.shipping.courier) && (
            <section className="track-shipment" aria-label="Courier tracking details" style={{ margin: "18px 0", padding: 18, border: "1px solid #e7e4da", borderRadius: 14 }}>
              <h3 style={{ marginTop: 0 }}>Shipment tracking</h3>
              <p><strong>Shipment status:</strong> {order.shipping.status || "Shipment information received"}</p>
              {order.shipping.courier && <p><strong>Courier:</strong> {order.shipping.courier}</p>}
              {order.shipping.awb && <p><strong>AWB / tracking number:</strong> <span style={{ wordBreak: "break-all" }}>{order.shipping.awb}</span></p>}
              {order.shipping.trackingUrl && <a className="btn secondary" href={order.shipping.trackingUrl} target="_blank" rel="noreferrer">Track with courier ↗</a>}
              {order.shipping.updatedAt && <p className="track-updated">Shipment updated {new Date(order.shipping.updatedAt).toLocaleString("en-IN")}</p>}
            </section>
          )}

          <div className="track-items">
            <div className="track-items-heading"><h3>Items in this order</h3><span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span></div>
            {order.items.map((item, i) => <div className="track-item" key={`${item.name}-${i}`}><span>{item.name}</span><strong>× {item.quantity}</strong></div>)}
          </div>
          <p className="track-updated">Last updated {new Date(order.updatedAt).toLocaleString("en-IN")}</p>
          <p><button className="btn secondary" type="button" onClick={() => { setOrder(null); setNumber(""); setEmail(""); }}>Track another order</button></p>
        </section>
      )}

      <p className="track-help">Already have an account? View every order in <a className="text-link" href="/orders">My Orders</a>. Select Track order on any order to open its details directly.</p>
    </main>
  );
}
