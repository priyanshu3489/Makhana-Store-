"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Product = {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  imageUrl: string;
  stock: number;
  flavor: string;
  weightGrams: number;
};

type Combo = {
  slug: string;
  name: string;
  count: number;
  image: string;
  tag: string;
  description: string;
};

const COMBOS: Combo[] = [
  {
    slug: "3-jar-taste-combo",
    name: "3-Jar Taste Combo",
    count: 3,
    image: "/products/3-jar%20taste%20combo.png",
    tag: "TASTE COMBO",
    description: "Pick any 3 makhana jars and create your own flavour mix.",
  },
  {
    slug: "4-jar-classic-combo",
    name: "4-Jar Classic Combo",
    count: 4,
    image: "/products/4-jar%20taste%20combo.png",
    tag: "CLASSIC COLLECTION",
    description: "Choose 4 favourites for a classic Foxberry selection.",
  },
  {
    slug: "6-jar-premium-collection",
    name: "6-Jar Premium Collection",
    count: 6,
    image: "/products/6-jar%20taste%20combo.png",
    tag: "PREMIUM COLLECTION",
    description: "Build a premium collection with any 6 makhana jars.",
  },
];

export default function GiftHamperShop({ products }: { products: Product[] }) {
  const [combo, setCombo] = useState<Combo>(COMBOS[0]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const available = useMemo(
    () => products.filter((product) => product.stock > 0),
    [products],
  );
  const chosen = useMemo(
    () => selected
      .map((id) => available.find((product) => product.id === id))
      .filter(Boolean) as Product[],
    [selected, available],
  );
  const totalPaise = chosen.reduce((sum, product) => sum + product.pricePaise, 0);

  function chooseCombo(nextCombo: Combo) {
    setCombo(nextCombo);
    setSelected([]);
    setMessage("");
  }

  function toggleProduct(id: string) {
    setMessage("");
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < combo.count
          ? [...current, id]
          : current,
    );
  }

  function addCombo() {
    if (chosen.length !== combo.count) {
      setMessage(`Please select exactly ${combo.count} jars to continue.`);
      return;
    }

    try {
      const raw = JSON.parse(localStorage.getItem("makhana-cart") || "[]");
      const cart = Array.isArray(raw) ? raw : [];
      const comboDetails = {
        slug: combo.slug,
        name: combo.name,
        count: combo.count,
        pricePaise: totalPaise,
        productNames: chosen.map((product) => product.name),
      };
      const otherItems = cart.filter((item: any) => !item.hamper);
      const comboItems = chosen.map((product) => ({
        product,
        quantity: 1,
        hamper: comboDetails,
      }));

      localStorage.setItem("makhana-cart", JSON.stringify([...otherItems, ...comboItems]));
      window.dispatchEvent(new Event("makhana-cart-updated"));
      setMessage(`${combo.name} added to your basket for ${formatMoney(totalPaise)}.`);
    } catch {
      setMessage("Could not update your basket. Please try again.");
    }
  }

  return (
    <div className="taste-combo-page">
      <section className="taste-combo-intro">
        <span className="gift-eyebrow">BUILD YOUR OWN FOXBERRY COMBO</span>
        <h1>Pick your combo. Choose your flavours.</h1>
        <p>Choose a collection, then fill it with the makhana jars you love. Every jar in your combo is your choice.</p>
      </section>

      <section className="taste-combo-content" aria-label="Choose your makhana combo">
        <div className="taste-combo-options">
          {COMBOS.map((option) => (
            <button
              type="button"
              key={option.slug}
              className={`taste-combo-card ${combo.slug === option.slug ? "is-selected" : ""}`}
              onClick={() => chooseCombo(option)}
              aria-pressed={combo.slug === option.slug}
            >
              <span className="taste-combo-image-wrap">
                <img src={option.image} alt={option.name} />
                <span className="taste-combo-tag">{option.tag}</span>
              </span>
              <span className="taste-combo-card-copy">
                <strong>{option.name}</strong>
                <small>{option.description}</small>
                <span className="taste-combo-card-action">
                  {combo.slug === option.slug ? "Selected ✓" : "Choose this combo →"}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="taste-combo-builder">
          <div className="taste-combo-picker">
            <div className="taste-combo-picker-heading">
              <div>
                <span className="gift-eyebrow">STEP 2 · PICK YOUR JARS</span>
                <h2>{combo.name}</h2>
                <p>Select any {combo.count} in-stock flavours for your collection.</p>
              </div>
              <strong className="taste-combo-count">{selected.length} / {combo.count}</strong>
            </div>

            {available.length ? (
              <div className="gift-product-grid taste-combo-product-grid">
                {available.map((product) => {
                  const isSelected = selected.includes(product.id);
                  const isFull = selected.length >= combo.count;
                  return (
                    <label
                      className={`gift-product-option ${isSelected ? "is-selected" : ""}`}
                      key={product.id}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelected && isFull}
                        onChange={() => toggleProduct(product.id)}
                      />
                      <img src={product.imageUrl} alt={product.name} />
                      <span className="gift-product-details">
                        <strong>{product.name}</strong>
                        <small>{product.flavor} · {product.weightGrams} g</small>
                        <b>{formatMoney(product.pricePaise)}</b>
                      </span>
                      <span className="gift-select-indicator">{isSelected ? "✓" : "+"}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="muted">No makhana jars are currently in stock.</p>
            )}
          </div>

          <aside className="taste-combo-summary">
            <span className="gift-eyebrow">YOUR CUSTOM COMBO</span>
            <h2>{combo.name}</h2>
            <div className="taste-combo-summary-image">
              <img src={combo.image} alt={combo.name} />
            </div>
            <p className="taste-combo-summary-count">{selected.length} of {combo.count} jars selected</p>
            <ul className="taste-combo-selected-list">
              {chosen.map((product) => (
                <li key={product.id}>
                  <span>{product.name}</span>
                  <strong>{formatMoney(product.pricePaise)}</strong>
                </li>
              ))}
              {!chosen.length && <li className="muted">Your chosen flavours will appear here.</li>}
            </ul>
            <div className="taste-combo-total">
              <span>Combo total</span>
              <strong>{formatMoney(totalPaise)}</strong>
            </div>
            <button
              type="button"
              className="gift-add-button"
              disabled={chosen.length !== combo.count}
              onClick={addCombo}
            >
              Add combo to basket →
            </button>
            <small className="gift-selection-hint">
              Select exactly {combo.count} jars. Combo total is calculated from your selected jars.
            </small>
          </aside>
        </div>

        {message && <p className="gift-cart-feedback" role="status">{message} <a href="/cart">View basket →</a></p>}
      </section>
    </div>
  );
}
