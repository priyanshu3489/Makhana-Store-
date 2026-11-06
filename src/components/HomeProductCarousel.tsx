"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  flavor: string;
  weightGrams: number;
  description: string;
  pricePaise: number;
  compareAtPaise: number | null;
  stock: number;
};

function ProductCard({ product }: { product: HomeProduct }) {
  return (
    <article className="card product-card home-product-card">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <img className="product-image" src={product.imageUrl} alt={product.name} />
      </Link>
      <div className="home-product-copy">
        <span className="pill">{product.flavor} · {product.weightGrams} g</span>
        <h3>{product.name}</h3>
        <p className="muted product-description">{product.description}</p>
        <div className="home-product-bottom">
          <div>
            <strong>₹{(product.pricePaise / 100).toFixed(2)}</strong>
            {product.compareAtPaise && product.compareAtPaise > product.pricePaise ? (
              <div className="muted home-product-compare">₹{(product.compareAtPaise / 100).toFixed(2)}</div>
            ) : null}
          </div>
          {product.stock > 0 ? (
            <Link className="btn" href={`/products/${product.slug}`}>View product</Link>
          ) : (
            <span className="home-product-out">Out of stock</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HomeProductCarousel({ products }: { products: HomeProduct[] }) {
  const [orderedProducts, setOrderedProducts] = useState(products);
  const [moving, setMoving] = useState(false);
  const [stepWidth, setStepWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrderedProducts(products);
    setMoving(false);
    setStepWidth(0);
  }, [products]);

  useEffect(() => {
    if (orderedProducts.length < 2 || moving) return;

    const timer = window.setTimeout(() => {
      const track = trackRef.current;
      const firstCard = track?.querySelector<HTMLElement>(".home-product-card");
      if (!track || !firstCard) return;

      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
      setStepWidth(firstCard.getBoundingClientRect().width + gap);
      setMoving(true);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [orderedProducts, moving]);

  const finishSlide = () => {
    if (!moving) return;
    setOrderedProducts((current) => [...current.slice(1), current[0]]);
    setMoving(false);
    setStepWidth(0);
  };

  return (
    <div className="home-products-track" aria-label="All Foxberry products">
      <div
        className={`home-products-step-track${moving ? " is-moving" : ""}`}
        ref={trackRef}
        style={{ transform: `translate3d(-${moving ? stepWidth : 0}px, 0, 0)` }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === "transform") finishSlide();
        }}
      >
        {orderedProducts.map((product) => (
          <div className="home-products-step-item" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
