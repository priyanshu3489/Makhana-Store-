import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import ProductAdd from "@/components/ProductAdd";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.active) notFound();

  const hasDiscount = Boolean(product.compareAtPaise && product.compareAtPaise > product.pricePaise);

  return (
    <main className="container product-detail-page">
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/#shop">Shop flavours</Link><span aria-hidden="true">/</span><span>{product.name}</span>
      </nav>
      <div className="product-detail-grid">
        <div className="product-detail-visual">
          <img className="product-detail-image" src={product.imageUrl} alt={product.name} />
          <span className="product-image-caption">A LITTLE CRUNCH, A LOT OF JOY</span>
        </div>
        <section className="product-detail-info">
          <span className="product-flavour-badge">{product.flavor}</span>
          <p className="eyebrow product-meta">{product.weightGrams} g pack · Makhana House</p>
          <h1>{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <div className="product-price-line">
            <strong>{formatMoney(product.pricePaise)}</strong>
            {hasDiscount && <del>{formatMoney(product.compareAtPaise!)}</del>}
            {hasDiscount && <span className="product-savings">Special price</span>}
          </div>
          <p className={product.stock > 0 ? "product-availability" : "product-availability sold-out"}>
            <span aria-hidden="true" />{product.stock > 0 ? (product.stock <= 10 ? `Only ${product.stock} packs left` : "In stock · Ready for your snack shelf") : "Currently sold out"}
          </p>
          <ProductAdd product={{ id: product.id, slug: product.slug, name: product.name, pricePaise: product.pricePaise, imageUrl: product.imageUrl, stock: product.stock }} />
          <div className="product-trust-row"><span>✓ Secure checkout</span><span>✓ Order tracking</span><span>✓ Carefully packed</span></div>
          <div className="product-details-panel">
            <h2>Good to know</h2>
            <p>Check the packaging for current ingredients, allergen information, nutrition details, batch information and best-before date.</p>
          </div>
        </section>
      </div>
      <div className="product-back-link"><Link href="/#shop">← Explore more flavours</Link></div>
    </main>
  );
}
