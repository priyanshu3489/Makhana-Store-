"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type P = {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  imageUrl: string;
  stock: number;
};

type C = {
  product: P;
  quantity: number;
  hamper?: {slug:string;name:string;image?:string;count:number;productIds?:string[];pricePaise:number;productNames:string[];boxPricePaise?:number;messageCardPricePaise?:number;includeMessageCard?:boolean;messageCardText?:string};
};

export default function Cart() {
  const [cart, setCart] = useState<C[]>([]);

  function load() {
    try {
      const stored = JSON.parse(
        localStorage.getItem("makhana-cart") || "[]",
      );

      setCart(Array.isArray(stored) ? stored : []);
    } catch {
      setCart([]);
    }
  }

  useEffect(() => {
    load();

    window.addEventListener("storage", load);
    window.addEventListener("makhana-cart-updated", load);

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("makhana-cart-updated", load);
    };
  }, []);

  function save(next: C[]) {
    setCart(next);
    localStorage.setItem("makhana-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("makhana-cart-updated"));
  }

  function changeQuantity(productId: string, amount: number) {
    save(
      cart
        .map((item) => {
          if (item.product.id !== productId) return item;

          return {
            ...item,
            quantity: Math.min(
              item.product.stock,
              item.quantity + amount,
            ),
          };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  const visibleCart = cart.filter((item, index) => !item.hamper || cart.findIndex((entry) => entry.hamper?.slug === item.hamper?.slug) === index);
  const subtotal = cart.reduce((sum, item, index) => item.hamper ? (cart.findIndex((entry) => entry.hamper?.slug === item.hamper?.slug) === index ? sum + item.hamper.pricePaise : sum) : sum + item.product.pricePaise * item.quantity, 0);

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const freeShippingThreshold = 49900;
  const shipping = subtotal >= freeShippingThreshold
    ? 0
    : cart.length > 0
      ? 5000
      : 0;

  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal,
  );

  const estimatedTotal = subtotal + shipping;

  return (
    <section style={{ marginTop: 24 }}>
      {cart.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>🥣</div>
          <h2 style={{ fontSize: 25, margin: "0 0 10px" }}>
            Your basket is waiting for a little crunch
          </h2>
          <p className="muted">
            Explore our roasted makhana and find your next favourite.
          </p>
          <Link className="btn" href="/">
            Explore makhana
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, 0.85fr)",
            gap: 24,
            alignItems: "start",
          }}
          className="basket-layout"
        >
          <div>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ fontSize: 22, margin: 0 }}>
                Your selection
              </h2>
              <span className="muted">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </span>
            </div>

            {remainingForFreeShipping > 0 ? (
              <div
                className="card"
                style={{
                  padding: 16,
                  marginBottom: 16,
                  background: "var(--card, #fbfaf6)",
                }}
              >
                <p style={{ margin: "0 0 10px" }}>
                  Add{" "}
                  <strong>
                    {formatMoney(remainingForFreeShipping)}
                  </strong>{" "}
                  more to qualify for free shipping.
                </p>
                <div
                  style={{
                    height: 6,
                    borderRadius: 99,
                    background: "#e7e4da",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(
                        100,
                        (subtotal / freeShippingThreshold) * 100,
                      )}%`,
                      background: "#496b43",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                className="card"
                style={{
                  padding: 14,
                  marginBottom: 16,
                  color: "#315b35",
                }}
              >
                <strong>You unlocked free shipping!</strong>
              </div>
            )}

            <div className="stack" style={{ gap: 14 }}>
              {visibleCart.map((item) => (
                <article
                  className="card"
                  key={item.hamper ? `hamper-${item.hamper.slug}` : item.product.id}
                  style={{ padding: 18 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "104px minmax(0, 1fr)",
                      gap: 16,
                    }}
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      aria-label={`View ${item.product.name}`}
                    >
                      <img
                        src={item.hamper ? (item.hamper.image || (item.hamper.slug === "3-jar-taste-combo" ? "/products/3-jar%20taste%20combo.png" : item.hamper.slug === "4-jar-classic-combo" ? "/products/4-jar%20taste%20combo.png" : "/products/6-jar%20taste%20combo.png")) : item.product.imageUrl}
                        alt={item.hamper ? item.hamper.name : item.product.name}
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: item.hamper ? "contain" : "cover",
                          borderRadius: 14,
                          background: "#f5f2e9",
                        }}
                      />
                    </Link>

                    <div style={{ minWidth: 0 }}>
                      <div
                        className="row"
                        style={{
                          justifyContent: "space-between",
                          alignItems: "start",
                          gap: 10,
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: 17,
                              margin: "0 0 6px",
                            }}
                          >
                            {item.hamper ? item.hamper.name : item.product.name}
                          </h3>
                          <p
                            className="muted"
                            style={{ margin: 0, fontSize: 14 }}
                          >
                            {item.hamper ? `${item.hamper.count} selected jars · ${item.hamper.productNames.join(", ")}${item.hamper.includeMessageCard ? " · Message card added" : ""}` : formatMoney(item.product.pricePaise)+" per pack"}
                          </p>
                        </div>

                        <strong style={{ whiteSpace: "nowrap" }}>
                          {formatMoney(
                            item.hamper ? item.hamper.pricePaise : item.product.pricePaise * item.quantity,
                          )}
                        </strong>
                      </div>
                      {item.hamper && (
                        <div style={{marginTop:10,fontSize:13,color:"var(--muted, #777)",display:"grid",gap:5}}>
                          <div className="row"><span>Hamper box</span><span>{formatMoney(item.hamper.boxPricePaise || 0)}</span></div>
                          {item.hamper.includeMessageCard && <div className="row"><span>Message card</span><span>{formatMoney(item.hamper.messageCardPricePaise || 0)}</span></div>}
                          {item.hamper.messageCardText && <p style={{margin:"4px 0"}}>Card message: “{item.hamper.messageCardText}”</p>}
                        </div>
                      )}

                      {!item.hamper && <div
                        className="row"
                        style={{
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          marginTop: 16,
                          gap: 10,
                        }}
                      >
                        <div
                          className="row"
                          style={{
                            justifyContent: "flex-start",
                            gap: 0,
                            border: "1px solid #e7e4da",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}
                        >
                          <button
                            type="button"
                            aria-label={`Decrease ${item.product.name} quantity`}
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              changeQuantity(item.product.id, -1)
                            }
                            style={{
                              width: 36,
                              height: 36,
                              border: 0,
                              background: "transparent",
                              cursor: "pointer",
                            }}
                          >
                            −
                          </button>

                          <span
                            style={{
                              minWidth: 32,
                              textAlign: "center",
                              alignSelf: "center",
                            }}
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${item.product.name} quantity`}
                            disabled={
                              item.quantity >= item.product.stock
                            }
                            onClick={() =>
                              changeQuantity(item.product.id, 1)
                            }
                            style={{
                              width: 36,
                              height: 36,
                              border: 0,
                              background: "transparent",
                              cursor: "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            save(
                              item.hamper ? cart.filter((entry) => entry.hamper?.slug !== item.hamper?.slug) : cart.filter((entry) => entry.product.id !== item.product.id),
                            )
                          }
                          style={{
                            border: 0,
                            background: "transparent",
                            color: "var(--muted, #777)",
                            textDecoration: "underline",
                            cursor: "pointer",
                            padding: 6,
                          }}
                        >
                          Remove
                        </button>
                      </div>}
                      {item.hamper && (
                        <div className="row" style={{ justifyContent: "flex-start", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
                          <Link
                            href={`/combos?edit=${encodeURIComponent(item.hamper.slug)}`}
                            className="btn secondary"
                            style={{ padding: "9px 14px", fontSize: 13 }}
                          >
                            Edit hamper
                          </Link>
                          <button type="button" onClick={() => save(cart.filter((entry) => entry.hamper?.slug !== item.hamper?.slug))} style={{ border: 0, background: "transparent", color: "var(--muted, #777)", textDecoration: "underline", cursor: "pointer", padding: 6 }}>
                            Remove entire hamper
                          </button>
                        </div>
                      )}

                      {item.quantity >= item.product.stock &&
                        item.product.stock > 0 && (
                          <p
                            className="muted"
                            style={{ fontSize: 12, marginBottom: 0 }}
                          >
                            Maximum available quantity reached.
                          </p>
                        )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p style={{ marginTop: 22 }}>
              <Link className="text-link" href="/">
                ← Continue shopping
              </Link>
            </p>
          </div>

          <aside
            className="card basket-summary"
            style={{
              padding: 22,
              position: "sticky",
              top: 24,
            }}
          >
            <p className="eyebrow">FOXBERRY</p>
            <h2 style={{ fontSize: 23, margin: "8px 0 20px" }}>
              Order summary
            </h2>

            {visibleCart.map((item) => (
              <div
                className="row"
                key={item.product.id}
                style={{
                  alignItems: "start",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <span style={{ flex: 1 }}>
                  {item.hamper ? `${item.hamper.name} · ${item.product.name}` : item.product.name+" × "+item.quantity}
                </span>
                <strong style={{ whiteSpace: "nowrap" }}>
                  {formatMoney(
                    item.hamper ? item.hamper.pricePaise : item.product.pricePaise * item.quantity,
                  )}
                </strong>
              </div>
            ))}

            <hr
              style={{
                margin: "18px 0",
                borderColor: "#e7e4da",
              }}
            />

            <div className="row">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <span>Estimated shipping</span>
              <strong>
                {shipping === 0 ? "FREE" : formatMoney(shipping)}
              </strong>
            </div>

            <hr
              style={{
                margin: "18px 0",
                borderColor: "#e7e4da",
              }}
            />

            <div
              className="row"
              style={{ fontSize: 20, alignItems: "start" }}
            >
              <strong>Estimated total</strong>
              <strong>{formatMoney(estimatedTotal)}</strong>
            </div>

            <p
              className="muted"
              style={{ fontSize: 12, lineHeight: 1.6 }}
            >
              Final shipping, discounts and payable amount are confirmed
              at checkout.
            </p>

            <Link
              className="btn"
              href="/checkout"
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                boxSizing: "border-box",
                marginTop: 18,
              }}
            >
              Proceed to checkout →
            </Link>

            <p
              className="muted"
              style={{
                fontSize: 12,
                textAlign: "center",
                marginBottom: 0,
                marginTop: 14,
              }}
            >
              Secure checkout · Payment via Razorpay
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
