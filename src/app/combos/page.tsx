import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ComboBuilder from "@/components/ComboBuilder";
export const dynamic="force-dynamic";
export default async function CombosPage(){
 const products=await prisma.product.findMany({where:{active:true,stock:{gt:0}},orderBy:{createdAt:"desc"}});
 return <main className="container content-page"><span className="eyebrow">MIX · MATCH · MUNCH</span><h1>Build your own makhana combo.</h1><p>Pick the flavours that suit your mood, from familiar favourites to new discoveries. Choose two to six packs and add them together in one easy step.</p><div className="content-panel"><strong>How combos work</strong><p>Each pack keeps its listed price. Add any eligible coupon at checkout to see applicable discounts. Free shipping applies to orders of ₹499 or more; orders below ₹499 currently have ₹50 shipping.</p></div><ComboBuilder products={products.map(p=>({id:p.id,slug:p.slug,name:p.name,pricePaise:p.pricePaise,imageUrl:p.imageUrl,stock:p.stock,flavor:p.flavor,weightGrams:p.weightGrams}))}/><p style={{marginTop:24}}><Link className="text-link" href="/">← Back to all flavours</Link></p></main>;
}
