import { prisma } from "@/lib/prisma";
import GiftHamperShop from "@/components/GiftHamperShop";
export const dynamic="force-dynamic";
export default async function CombosPage(){
 const products=await prisma.product.findMany({where:{active:true,stock:{gt:0}},orderBy:{createdAt:"desc"}});
 return <main className="gift-hamper-main"><GiftHamperShop products={products.map(p=>({id:p.id,slug:p.slug,name:p.name,pricePaise:p.pricePaise,imageUrl:p.imageUrl,stock:p.stock,flavor:p.flavor,weightGrams:p.weightGrams}))}/></main>;
}
