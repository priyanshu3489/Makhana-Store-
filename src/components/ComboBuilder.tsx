"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Product = { id: string; slug: string; name: string; pricePaise: number; imageUrl: string; stock: number; flavor: string; weightGrams: number };
type CartItem = { product: Product; quantity: number };

export default function ComboBuilder({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const chosen = useMemo(() => products.filter((product) => selected.includes(product.id)), [products, selected]);
  const total = chosen.reduce((sum, product) => sum + product.pricePaise, 0);

  function toggle(id: string) {
    setMessage("");
    setAdded(false);
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 6 ? current : [...current, id]);
  }

  function addCombo() {
    if (selected.length < 2) {
      setMessage("Choose at least two flavours to build your combo.");
      return;
    }
    try {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("makhana-cart") || "[]");
      for (const product of chosen) {
        const found = cart.find((item) => item.product.id === product.id);
        if (found) found.quantity = Math.min(found.quantity + 1, product.stock);
        else cart.push({ product, quantity: 1 });
      }
      localStorage.setItem("makhana-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("makhana-cart-updated"));
      setAdded(true);
      setMessage("Your selected flavours are in the basket.");
    } catch {
      setAdded(false);
      setMessage("We couldn't update your basket. Please try again.");
    }
  }

  if (products.length === 0) return <p className="muted">No in-stock flavours are available to build a combo right now.</p>;

  return (
    <div className="combo-builder">
      <div className="combo-builder-intro"><p>Choose 2–6 packs to create your own mix. Each selected pack is added to your basket at its current price.</p><span>{selected.length}/6 selected</span></div>
      <div className="combo-builder-grid">
        {products.map((product) => {
          const isSelected = selected.includes(product.id);
          return (
            <label className={`combo-pick${isSelected ? " is-selected" : ""}`} key={product.id}>
              <input type="checkbox" checked={isSelected} disabled={!isSelected && selected.length >= 6} onChange={() => toggle(product.id)} />
              <span className="combo-pick-check" aria-hidden="true">{isSelected ? "✓" : "+"}</span>
              <img src={product.imageUrl} alt="" />
              <span className="combo-pick-info"><strong>{product.name}</strong><span className="muted">{product.flavor} · {product.weightGrams} g</span><strong>{formatMoney(product.pricePaise)}</strong></span>
            </label>
          );
        })}
      </div>
      <div className="combo-builder-footer">
        <div><strong>{selected.length} flavour{selected.length === 1 ? "" : "s"} selected</strong><p>Combined pack total: <strong>{formatMoney(total)}</strong></p></div>
        <button type="button" className={`btn${added ? " combo-added" : ""}`} onClick={addCombo} disabled={selected.length < 2}>{added ? "✓ Added to basket" : "Add combo to basket →"}</button>
      </div>
      {message && <p role="status" aria-live="polite" className="combo-feedback">{message} <a href="/cart" className="text-link">View basket →</a></p>}
    </div>
  );
}
