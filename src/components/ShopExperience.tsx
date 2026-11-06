"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type ShopProduct = {
  id: string; slug: string; name: string; imageUrl: string; flavor: string;
  weightGrams: number; description: string; pricePaise: number;
  compareAtPaise: number | null; stock: number;
};

export default function ShopExperience({ products }: { products: ShopProduct[] }) {
  const [query, setQuery] = useState("");
  const [flavor, setFlavor] = useState("All");
  const [pack, setPack] = useState("All packs");
  const [sort, setSort] = useState("featured");
  const flavors = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.flavor).filter(Boolean)))], [products]);
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const text = (p.name + " " + p.flavor + " " + p.description).toLowerCase();
      const matchesQuery = text.includes(query.trim().toLowerCase());
      const matchesFlavor = flavor === "All" || p.flavor === flavor;
      const matchesPack = pack === "All packs" || (pack === "Family packs" ? p.weightGrams >= 200 : p.weightGrams < 200);
      return matchesQuery && matchesFlavor && matchesPack;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.pricePaise - b.pricePaise);
    if (sort === "high") list = [...list].sort((a, b) => b.pricePaise - a.pricePaise);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "available") list = [...list].sort((a, b) => b.stock - a.stock);
    return list;
  }, [products, query, flavor, pack, sort]);
  const availableCount = products.filter((p) => p.stock > 0).length;

  return (
    <main className="container content-page fox-shop">
      <section className="fox-shop-hero">
        <div className="fox-shop-hero-copy">
          <span className="fox-shop-kicker"><span className="fox-shop-kicker-dot" /> THE FOXBERRY SNACK CLUB</span>
          <h1>A little crunch.<br /><em>A lot of joy.</em></h1>
          <p>Meet your new favourite snack. Explore deliciously light makhana, discover your flavour and make every break a better one.</p>
          <div className="fox-shop-hero-actions">
            <a className="fox-shop-primary" href="#shop-collection">Explore the collection <span>↓</span></a>
            <Link className="fox-shop-secondary" href="/combos">Build your own combo ↗</Link>
          </div>
          <div className="fox-shop-proof"><span>✳ Carefully selected flavours</span><span>✳ Made for every snack break</span></div>
        </div>
        <div className="fox-shop-hero-art" aria-label="Foxberry makhana gifting collection">
          <div className="fox-shop-art-orbit fox-shop-orbit-one" />
          <div className="fox-shop-art-orbit fox-shop-orbit-two" />
          <span className="fox-shop-art-spark fox-shop-spark-one">✳</span>
          <span className="fox-shop-art-spark fox-shop-spark-two">✦</span>
          <img src="/products/4-jar%20taste%20combo.png" alt="Foxberry makhana flavour collection" />
          <div className="fox-shop-art-note"><strong>Find your crunch</strong><span>Flavour starts here</span></div>
        </div>
        <div className="fox-shop-hero-bottom"><span>GOOD SNACKS. GOOD MOOD.</span><span>SCROLL TO DISCOVER ↓</span></div>
      </section>

      <section className="fox-shop-benefits" aria-label="Shopping highlights">
        <div><span>✦</span><strong>Flavours for every mood</strong><small>Find your perfect match</small></div>
        <div><span>◈</span><strong>Choose your pack</strong><small>Little treats to family packs</small></div>
        <div><span>＋</span><strong>Build a hamper</strong><small>Mix the makhana you love</small></div>
      </section>

      <section id="shop-collection" className="fox-shop-collection">
        <div className="fox-shop-section-head">
          <div><span className="fox-shop-eyebrow">THE GOOD STUFF</span><h2>Find your flavour.</h2><p>Pick a favourite or let a new flavour surprise you.</p></div>
          <span className="fox-shop-count">{filtered.length} of {products.length} products</span>
        </div>
        <div className="fox-shop-toolbar">
          <label className="fox-shop-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search flavours, products..." aria-label="Search products" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>
          <label className="fox-shop-sort"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A to Z</option><option value="available">Availability</option></select></label>
        </div>
        <div className="fox-shop-filter-row">
          <div className="fox-shop-chips" aria-label="Filter by flavour">
            {flavors.map((item) => <button key={item} type="button" className={flavor === item ? "is-active" : ""} onClick={() => setFlavor(item)}>{item === "All" ? "All flavours" : item}</button>)}
          </div>
          <div className="fox-shop-pack-filter">
            {["All packs", "Snack packs", "Family packs"].map((item) => <button key={item} type="button" className={pack === item ? "is-active" : ""} onClick={() => setPack(item)}>{item}</button>)}
          </div>
        </div>
        {filtered.length ? <div className="fox-shop-grid">
          {filtered.map((product, index) => <article className="fox-shop-card" key={product.id} style={{ animationDelay: Math.min(index * 45, 360) + "ms" }}>
            <Link href={"/products/" + product.slug} className="fox-shop-card-image" aria-label={"View " + product.name}>
              <img src={product.imageUrl} alt={product.name} loading={index > 3 ? "lazy" : "eager"} />
              <span className="fox-shop-card-number">{String(index + 1).padStart(2, "0")}</span>
              {product.stock > 0 && product.stock <= 10 ? <span className="fox-shop-stock">Only {product.stock} left</span> : null}
              {product.stock <= 0 ? <span className="fox-shop-soldout">Out of stock</span> : null}
              <span className="fox-shop-image-arrow">↗</span>
            </Link>
            <div className="fox-shop-card-copy">
              <div className="fox-shop-card-meta"><span>{product.flavor}</span><i /> <span>{product.weightGrams} g</span></div>
              <h3><Link href={"/products/" + product.slug}>{product.name}</Link></h3>
              <p>{product.description}</p>
              <div className="fox-shop-card-footer"><div className="fox-shop-price"><strong>{formatMoney(product.pricePaise)}</strong>{product.compareAtPaise && product.compareAtPaise > product.pricePaise ? <del>{formatMoney(product.compareAtPaise)}</del> : null}</div>
                <Link href={"/products/" + product.slug} className="fox-shop-view">{product.stock > 0 ? "Discover" : "View details"} <span>→</span></Link>
              </div>
            </div>
          </article>)}
        </div> : <div className="fox-shop-empty"><span>◌</span><h3>No flavours found just yet.</h3><p>Try another search or clear your filters to see the full collection.</p><button type="button" onClick={() => { setQuery(""); setFlavor("All"); setPack("All packs"); }}>Clear all filters</button></div>}
      </section>

      <section className="fox-shop-combo">
        <div className="fox-shop-combo-image"><img src="/products/6-jar%20taste%20combo.png" alt="Foxberry six jar makhana hamper" loading="lazy" /></div>
        <div className="fox-shop-combo-copy"><span className="fox-shop-eyebrow">THE MORE-THE-MERRIER CLUB</span><h2>One flavour is never enough.</h2><p>Create a hamper with the makhana flavours you love. Pick your jars, make it yours and bring home a little box of happiness.</p><Link href="/combos" className="fox-shop-primary">Create your hamper <span>↗</span></Link></div>
        <span className="fox-shop-combo-star">✳</span>
      </section>
      <div className="fox-shop-bottom-note"><span>✦</span> Your next favourite snack is just one click away. <span>✦</span></div>
    </main>
  );
}
