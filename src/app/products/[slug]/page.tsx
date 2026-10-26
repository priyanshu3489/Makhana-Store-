import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import ProductAdd from "@/components/ProductAdd";
export const dynamic = "force-dynamic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const p=await prisma.product.findUnique({where:{slug}});
 if(!p||!p.active)notFound();
 return <main className="container product-detail-page">
  <div className="product-detail-grid">
   <div className="product-detail-visual"><span className="product-detail-stamp">MAKHANA HOUSE · GOODNESS IN EVERY CRUNCH</span><div className="product-detail-image-frame"><img className="product-detail-image" src={p.imageUrl} alt={p.name}/></div><div className="product-detail-caption"><span>✦ Carefully packed</span><span>✦ Made for snack time</span></div></div>
   <section className="product-detail-copy"><Link className="product-back-link" href="/#shop">← Back to all flavours</Link><span className="pill product-flavour-pill">{p.flavor} · {p.weightGrams} g</span><p className="eyebrow" style={{marginTop:24}}>YOUR NEXT FAVOURITE CRUNCH</p><h1>{p.name}</h1><p className="product-detail-description">{p.description}</p><div className="product-detail-price">{formatMoney(p.pricePaise)}{p.compareAtPaise&&p.compareAtPaise>p.pricePaise?<del>{formatMoney(p.compareAtPaise)}</del>:null}</div><p className={`product-availability ${p.stock>0?"in-stock":"sold-out"}`}><span/> {p.stock>0?(p.stock<=10?`Only ${p.stock} left in stock`:"In stock · Ready for your basket"):"Currently sold out"}</p><ProductAdd product={{id:p.id,slug:p.slug,name:p.name,pricePaise:p.pricePaise,imageUrl:p.imageUrl,stock:p.stock}}/><div className="product-promise-list"><div><span>✧</span><div><strong>A flavour for your moment</strong><p>Find your own favourite from our range.</p></div></div><div><span>♧</span><div><strong>Clear, upfront pricing</strong><p>Shipping and eligible offers are shown at checkout.</p></div></div><div><span>↗</span><div><strong>Order updates</strong><p>Follow your purchase from order to delivery.</p></div></div></div><details className="product-information"><summary>Product and packaging information</summary><p>Please check the packaging for the current ingredients, allergen information, nutrition details, batch information and best-before date.</p></details></section>
  </div>
 </main>;
}
