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
          <div className="home-product-price">
            <strong>₹{(product.pricePaise / 100).toFixed(2)}</strong>
            {product.compareAtPaise && product.compareAtPaise > product.pricePaise ? (
              <span className="muted home-product-compare">₹{(product.compareAtPaise / 100).toFixed(2)}</span>
            ) : null}
          </div>
          {product.stock > 0 ? (
            <Link className="btn home-product-view" href={`/products/${product.slug}`}>View product</Link>
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
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const completedSlideRef = useRef(true);

  useEffect(() => {
    setOrderedProducts(products);
    setMoving(false);
    setStepWidth(0);
    completedSlideRef.current = true;
  }, [products]);

  // Wait two seconds between steps. Hover pauses the carousel without
  // interrupting a slide halfway through.
  useEffect(() => {
    if (orderedProducts.length < 2 || moving || hovered) return;

    const timer = window.setTimeout(() => {
      const track = trackRef.current;
      const firstCard = track?.querySelector<HTMLElement>(".home-products-step-item");
      if (!track || !firstCard) return;

      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
      completedSlideRef.current = false;
      setStepWidth(firstCard.getBoundingClientRect().width + gap);
      setMoving(true);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [orderedProducts, moving, hovered]);

  useEffect(() => {
    if (!moving) return;

    // Safety fallback in case the browser does not emit transitionend.
    const fallback = window.setTimeout(() => {
      if (completedSlideRef.current) return;
      completedSlideRef.current = true;
      setOrderedProducts((current) => [...current.slice(1), current[0]]);
      setMoving(false);
      setStepWidth(0);
    }, 1100);
    return () => window.clearTimeout(fallback);
  }, [moving]);

  function finishSlide() {
    if (completedSlideRef.current) return;
    completedSlideRef.current = true;
    setOrderedProducts((current) => [...current.slice(1), current[0]]);
    setMoving(false);
    setStepWidth(0);
  }

  const loopProducts = [...orderedProducts, ...orderedProducts];

  return (
    <div
      className="home-products-track"
      aria-label="All Foxberry products"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
      }}
    >
      <div
        className={`home-products-step-track${moving ? " is-moving" : ""}`}
        ref={trackRef}
        style={{ transform: `translate3d(-${moving ? stepWidth : 0}px, 0, 0)` }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === "transform") finishSlide();
        }}
      >
        {loopProducts.map((product, index) => (
          <div
            className="home-products-step-item"
            key={`${product.id}-loop-${index}`}
            aria-hidden={index >= orderedProducts.length ? true : undefined}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
