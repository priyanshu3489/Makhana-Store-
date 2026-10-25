"use client";

import { useState } from "react";

type Product = { id: string; slug: string; name: string; pricePaise: number; imageUrl: string; stock: number };
type CartItem = { product: Product; quantity: number };

export default function ProductAdd({ product }: { product: Product }) {
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  function add() {
    try {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("makhana-cart") || "[]");
      const found = cart.find((item) => item.product.id === product.id);
      if (found) found.quantity = Math.min(found.quantity + 1, product.stock);
      else cart.push({ product, quantity: 1 });
      localStorage.setItem("makhana-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("makhana-cart-updated"));
      setAdded(true);
      setMessage(found && found.quantity >= product.stock ? "Basket updated — maximum available quantity reached." : "Added to your basket.");
    } catch {
      setAdded(false);
      setMessage("Could not update your basket. Please try again.");
    }
  }

  return (
    <div className="product-add-wrap">
      <button className={`btn product-add-button${added ? " is-added" : ""}`} disabled={product.stock < 1} onClick={add}>
        <span aria-hidden="true">{added ? "✓" : "+"}</span>{product.stock > 0 ? (added ? "Add another pack" : "Add to basket") : "Sold out"}
      </button>
      <p role="status" aria-live="polite" className={`product-add-feedback${message ? " is-visible" : ""}`}>
        {message}{message && <> <a href="/cart">View basket →</a></>}
      </p>
    </div>
  );
}
