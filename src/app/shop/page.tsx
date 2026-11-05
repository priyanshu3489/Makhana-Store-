import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
  });

  const available = products.filter((product) => product.stock > 0);
  const familyPacks = available.filter((product) => product.weightGrams >= 200);
  const singlePacks = available.filter((product) => product.weightGrams < 200);

  function ProductGrid({ items }: { items: typeof products }) {
    return (
      <div className="grid-products">
        {items.map((product) => (
          <article className="card product-card" key={product.id}>
            <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
              <img className="product-image" src={product.imageUrl} alt={product.name} />
            </Link>
            <div style={{ padding: 16 }}>
              <span className="pill">{product.flavor} · {product.weightGrams} g</span>
              <h3 style={{ fontSize: 19, margin: "12px 0 6px" }}>{product.name}</h3>
              <p className="muted product-description">{product.description}</p>
              <div className="row" style={{ marginTop: 16, alignItems: "center" }}>
                <div>
                  <strong>{formatMoney(product.pricePaise)}</strong>
                  {product.compareAtPaise && product.compareAtPaise > product.pricePaise ? (
                    <div className="muted" style={{ fontSize: 12, textDecoration: "line-through" }}>{formatMoney(product.compareAtPaise)}</div>
                  ) : null}
                </div>
                <Link className="btn" href={`/products/${product.slug}`}>View product</Link>
              </div>
              {product.stock <= 10 ? <p className="stock-note">Only {product.stock} left</p> : null}
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <main className="container content-page">
      <section className="shop-page-hero">
        <span className="eyebrow">THE FOXBERRY COLLECTION</span>
        <h1>Find your kind of crunch.</h1>
        <p>Explore every flavour, stock up on your favourites and discover a new snack-time ritual.</p>
        <div className="shop-page-actions">
          <Link className="btn" href="/combos">Build a combo</Link>
          <span className="pill">{available.length} products available</span>
        </div>
      </section>

      {products.length === 0 ? (
        <div className="content-panel"><p>Our shop is being restocked. Please check back soon.</p></div>
      ) : (
        <>
          {singlePacks.length > 0 && <section className="shop-category">
            <div className="section-heading">
              <div><span className="eyebrow">PICK YOUR FAVOURITE</span><h2>All flavours</h2><p className="muted">Everyday packs, from classic to boldly seasoned.</p></div>
              <span className="pill">{singlePacks.length} products</span>
            </div>
            <ProductGrid items={singlePacks} />
          </section>}
          {familyPacks.length > 0 && <section className="shop-category">
            <div className="section-heading">
              <div><span className="eyebrow">MORE TO SHARE</span><h2>Family packs</h2><p className="muted">Bigger packs for sharing or keeping your pantry ready.</p></div>
              <span className="pill">{familyPacks.length} products</span>
            </div>
            <ProductGrid items={familyPacks} />
          </section>}
          {products.some((product) => product.stock === 0) && <section className="shop-category">
            <div className="section-heading"><div><span className="eyebrow">COMING BACK SOON</span><h2>Currently out of stock</h2></div></div>
            <ProductGrid items={products.filter((product) => product.stock === 0)} />
          </section>}
        </>
      )}

      <section className="shop-combo-banner">
        <div><span className="eyebrow">CAN’T PICK JUST ONE?</span><h2>Make your own makhana combo.</h2><p>Choose two to six in-stock packs and add your favourites to the basket together.</p></div>
        <Link className="btn" href="/combos">Explore combos →</Link>
      </section>
    </main>
  );
}
