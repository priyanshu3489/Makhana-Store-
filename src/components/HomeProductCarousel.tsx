"use client";

import Link from "next/link";

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

function ProductCards({ products }: { products: HomeProduct[] }) {
  return (
    <>
      {products.map((product) => (
        <article className="card product-card home-product-card" key={product.id}>
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
      ))}
    </>
  );
}

export default function HomeProductCarousel({ products }: { products: HomeProduct[] }) {
  return (
    <div className="home-products-track" aria-label="All Foxberry products">
      <div className="home-products-marquee">
        <div className="home-products-set">
          <ProductCards products={products} />
        </div>
        <div className="home-products-set" aria-hidden="true">
          <ProductCards products={products} />
        </div>
      </div>
    </div>
  );
}
