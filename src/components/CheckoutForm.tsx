
"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

type User = {
  name: string;
  email: string;
  phone: string;
};

type CartProduct = {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  imageUrl: string;
  stock: number;
};

type CartItem = {
  product: CartProduct;
  quantity: number;
};

type FormState = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
  couponCode: string;
  paymentMethod: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (x: any) => void) => void;
    };
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function CheckoutForm({ user }: { user: User }) {
  const [form, setForm] = useState<FormState>({
    customerName: user.name,
    email: user.email,
    phone: user.phone || "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
    couponCode: "",
    paymentMethod: "RAZORPAY",
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function loadCart() {
      try {
        const parsed = JSON.parse(
          localStorage.getItem("makhana-cart") || "[]",
        );
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCart([]);
      }
    }

    loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("makhana-cart-updated", loadCart);

    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("makhana-cart-updated", loadCart);
    };
  }, []);

  function update(key: keyof FormState, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.product.pricePaise * item.quantity,
    0,
  );

  const shippingEstimate =
    subtotal === 0 ? 0 : subtotal >= 49900 ? 0 : 5000;

  const estimatedTotal = subtotal + shippingEstimate;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const raw = JSON.parse(
        localStorage.getItem("makhana-cart") || "[]",
      );

      if (!Array.isArray(raw)) {
        throw new Error("Your basket could not be loaded. Please refresh.");
      }

      const items = raw.map((item: any) => ({
        productId: item.product?.id,
        quantity: item.quantity,
      }));

      if (
        !items.length ||
        items.some(
          (item: { productId?: string; quantity?: number }) =>
            !item.productId ||
            !Number.isInteger(item.quantity) ||
            (item.quantity ?? 0) < 1,
        )
      ) {
        throw new Error("Your basket is empty or contains invalid items.");
      }

      const phone = form.phone.replace(/\D/g, "");

      if (!/^[6-9]\d{9}$/.test(phone)) {
        throw new Error("Enter a valid 10-digit Indian mobile number.");
      }

      if (!/^[1-9]\d{5}$/.test(form.postalCode.trim())) {
        throw new Error("Enter a valid 6-digit Indian PIN code.");
      }

      if (!form.address.trim() || !form.city.trim() || !form.state) {
        throw new Error("Complete all required delivery address fields.");
      }

      // Keep address line 2 optional while sending one combined address
      // to the existing checkout API.
      const {
        addressLine2,
        ...checkoutForm
      } = form;

      const combinedAddress = [
        form.address.trim(),
        addressLine2.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checkoutForm,
          phone,
          address: combinedAddress,
          postalCode: form.postalCode.trim(),
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed.");
      }

      if (form.paymentMethod === "COD") {
        localStorage.removeItem("makhana-cart");
        window.dispatchEvent(new Event("makhana-cart-updated"));
        window.location.href = `/orders/${data.orderId}`;
        return;
      }

      if (!window.Razorpay) {
        throw new Error(
          "The payment window is still loading. Please try again.",
        );
      }

      const payment = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: process.env.NEXT_PUBLIC_STORE_NAME || "Makhana House",
        description: "Makhana House order",
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.customerName,
          email: form.email,
          contact: phone,
        },
        handler: async (result: any) => {
          try {
            const verification = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_order_id: result.razorpay_order_id,
                razorpay_payment_id: result.razorpay_payment_id,
                razorpay_signature: result.razorpay_signature,
              }),
            });

            const verificationData = await verification.json();

            if (!verification.ok) {
              throw new Error(
                verificationData.error ||
                  "Payment verification failed.",
              );
            }

            localStorage.removeItem("makhana-cart");
            window.dispatchEvent(new Event("makhana-cart-updated"));
            window.location.href = `/orders/${data.orderId}`;
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed. Please check your order status.",
            );
          }
        },
        modal: {
          ondismiss: () => {
            setMessage(
              "Payment window closed. Your order may remain pending until payment is confirmed.",
            );
          },
        },
      });

      payment.on("payment.failed", (result: any) => {
        setMessage(
          result?.error?.description || "Payment failed. Please try again.",
        );
      });

      payment.open();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  const fields: {
    key: "customerName" | "email" | "phone" | "city" | "postalCode";
    label: string;
    type: string;
    autoComplete: string;
  }[] = [
    {
      key: "customerName",
      label: "Full name",
      type: "text",
      autoComplete: "name",
    },
    {
      key: "email",
      label: "Email address",
      type: "email",
      autoComplete: "email",
    },
    {
      key: "phone",
      label: "Mobile number",
      type: "tel",
      autoComplete: "tel",
    },
    {
      key: "city",
      label: "City",
      type: "text",
      autoComplete: "address-level2",
    },
    {
      key: "postalCode",
      label: "PIN code",
      type: "tel",
      autoComplete: "postal-code",
    },
  ];

  const mapsAddress = [
    form.address,
    form.addressLine2,
    form.city,
    form.state,
    form.postalCode,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <form onSubmit={submit} className="checkout-layout">
        <section className="checkout-main">
          <div className="card checkout-section">
            <span className="eyebrow">STEP 1 · YOUR DETAILS</span>
            <h2 className="checkout-section-title">
              Contact and delivery
            </h2>

            <div className="checkout-fields">
              {fields.map((field) => (
                <label
                  className={`field checkout-field checkout-field-${field.key}`}
                  key={field.key}
                >
                  {field.label}
                  <input
                    required
                    type={field.type}
                    autoComplete={field.autoComplete}
                    inputMode={
                      field.key === "phone" ||
                      field.key === "postalCode"
                        ? "numeric"
                        : undefined
                    }
                    maxLength={
                      field.key === "phone"
                        ? 10
                        : field.key === "postalCode"
                          ? 6
                          : undefined
                    }
                    pattern={
                      field.key === "phone"
                        ? "[6-9][0-9]{9}"
                        : field.key === "postalCode"
                          ? "[1-9][0-9]{5}"
                          : undefined
                    }
                    value={form[field.key]}
                    onChange={(event) =>
                      update(field.key, event.target.value)
                    }
                  />
                </label>
              ))}

              <label className="field checkout-field checkout-field-address">
                Address Line 1 *
                <input
                  required
                  autoComplete="address-line1"
                  placeholder="Flat / house no., building, street"
                  value={form.address}
                  onChange={(event) =>
                    update("address", event.target.value)
                  }
                />
              </label>

              <label className="field checkout-field checkout-field-address2">
                Address Line 2 (optional)
                <input
                  autoComplete="address-line2"
                  placeholder="Area, locality, landmark"
                  value={form.addressLine2}
                  onChange={(event) =>
                    update("addressLine2", event.target.value)
                  }
                />
              </label>

              <label className="field checkout-field checkout-field-state">
                State / Union Territory *
                <select
                  required
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(event) =>
                    update("state", event.target.value)
                  }
                >
                  <option value="">Select state / UT</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field checkout-notes">
              Delivery instructions (optional)
              <textarea
                rows={2}
                placeholder="Landmark or instructions for the delivery person"
                value={form.notes}
                onChange={(event) =>
                  update("notes", event.target.value)
                }
              />
            </label>

            <p className="muted checkout-map-note">
              {form.address.trim() &&
              form.city.trim() &&
              form.state &&
              form.postalCode.trim() ? (
                <a
                  className="text-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    mapsAddress,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Check delivery location on Google Maps ↗
                </a>
              ) : (
                "Enter your delivery address and PIN code to check the location."
              )}
            </p>
          </div>

          <div className="card checkout-section">
            <span className="eyebrow">STEP 2 · PAYMENT</span>
            <h2 className="checkout-section-title">
              Choose payment method
            </h2>

            <label className="field">
              Payment method
              <select
                value={form.paymentMethod}
                onChange={(event) =>
                  update("paymentMethod", event.target.value)
                }
              >
                <option value="RAZORPAY">
                  Online payment · UPI and cards
                </option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </label>

            <div className="checkout-secure-note">
              <span aria-hidden="true">🔒</span>
              <div>
                <strong>Secure checkout</strong>
                <p className="muted">
                  Online payments are handled by Razorpay. The server
                  validates the final price and stock availability.
                </p>
              </div>
            </div>

            {message && (
              <p
                role="alert"
                className="checkout-error"
                aria-live="polite"
              >
                {message}
              </p>
            )}

            <button
              className="btn checkout-submit"
              disabled={busy || cart.length === 0}
              type="submit"
            >
              {busy
                ? "Processing…"
                : form.paymentMethod === "COD"
                  ? "Place COD order"
                  : "Continue to secure payment"}
            </button>

            <p className="muted checkout-legal">
              By placing your order, you confirm that your delivery
              details are correct.
            </p>
          </div>
        </section>

        <aside className="card checkout-summary">
          <span className="eyebrow">MAKHANA HOUSE</span>
          <h2 className="checkout-section-title">Your order</h2>

          {cart.length === 0 ? (
            <div className="checkout-empty">
              <p className="muted">Your basket is empty or loading.</p>
              <Link className="text-link" href="/cart">
                Return to your basket →
              </Link>
            </div>
          ) : (
            <div className="checkout-cart-items">
              {cart.map((item) => (
                <div
                  className="checkout-cart-item"
                  key={item.product.id}
                >
                  <div className="checkout-cart-image-wrap">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="checkout-cart-image"
                    />
                    <span className="checkout-cart-quantity">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="checkout-cart-product">
                    <strong>{item.product.name}</strong>
                    <span className="muted">Qty: {item.quantity}</span>
                  </div>

                  <strong className="checkout-cart-price">
                    {formatMoney(
                      item.product.pricePaise * item.quantity,
                    )}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <label className="field checkout-coupon">
            Discount code
            <input
              type="text"
              placeholder="Enter coupon code"
              autoComplete="off"
              value={form.couponCode}
              onChange={(event) =>
                update("couponCode", event.target.value)
              }
            />
          </label>

          <p className="muted checkout-coupon-note">
            Eligible discounts are validated at checkout.
          </p>

          <hr className="checkout-divider" />

          <div className="checkout-total-row">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>

          <div className="checkout-total-row">
            <span>Estimated shipping</span>
            <strong>
              {shippingEstimate === 0 && cart.length > 0
                ? "FREE"
                : formatMoney(shippingEstimate)}
            </strong>
          </div>

          <hr className="checkout-divider" />

          <div className="checkout-grand-total">
            <strong>Total estimate</strong>
            <strong>{formatMoney(estimatedTotal)}</strong>
          </div>

          <p className="muted checkout-summary-note">
            This estimate excludes any coupon discount. The final
            amount is calculated by the server.
          </p>

          <Link href="/cart" className="text-link checkout-edit-cart">
            ← Edit basket
          </Link>
        </aside>
      </form>
    </>
  );
}
