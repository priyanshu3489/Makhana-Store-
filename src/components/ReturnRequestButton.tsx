"use client";

import { useMemo, useState } from "react";

type Props = {
  orderNumber: number;
  items: string[];
};

export default function ReturnRequestButton({ orderNumber, items }: Props) {
  const [open, setOpen] = useState(false);
  const [requestType, setRequestType] = useState("Replacement");
  const [reason, setReason] = useState("Damaged in transit");
  const [details, setDetails] = useState("");

  const mailto = useMemo(() => {
    const subject = `${requestType} request - Foxberry Order #${orderNumber}`;
    const body = [
      `Order number: #${orderNumber}`,
      `Request: ${requestType}`,
      `Reason: ${reason}`,
      `Items: ${items.join(", ")}`,
      "",
      "Please describe the issue:",
      details || "(Please add details here)",
      "",
      "I can share clear photos/video of the product and packaging.",
    ].join("\n");
    return `mailto:info@foxberry.in.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [details, items, orderNumber, reason, requestType]);

  return (
    <section className="return-request-box">
      <button className="btn secondary" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Close request form" : "Return / Replace item"}
      </button>
      {open && (
        <div className="return-request-form">
          <h3>Request a return or replacement</h3>
          <p className="muted">Available for delivered orders. Please report an issue within 48 hours of delivery and keep the product and packaging.</p>
          <label htmlFor={`return-type-${orderNumber}`}>What would you like?</label>
          <select id={`return-type-${orderNumber}`} value={requestType} onChange={(event) => setRequestType(event.target.value)}>
            <option>Replacement</option>
            <option>Return and refund</option>
          </select>
          <label htmlFor={`return-reason-${orderNumber}`}>Reason</label>
          <select id={`return-reason-${orderNumber}`} value={reason} onChange={(event) => setReason(event.target.value)}>
            <option>Damaged in transit</option>
            <option>Wrong product received</option>
            <option>Expired or tampered product</option>
            <option>Missing item</option>
            <option>Product quality / safety concern</option>
            <option>Other issue</option>
          </select>
          <label htmlFor={`return-details-${orderNumber}`}>Additional details</label>
          <textarea id={`return-details-${orderNumber}`} rows={4} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Tell us which item is affected and describe the issue." />
          <p className="muted">Your email app will open with the request pre-filled. Attach clear photos of the product, packaging and batch/expiry label before sending.</p>
          <a className="btn" href={mailto}>Continue by email →</a>
        </div>
      )}
    </section>
  );
}
