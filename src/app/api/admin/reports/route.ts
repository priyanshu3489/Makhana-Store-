import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";
export async function GET(){
 if(!await requireAdmin())return NextResponse.json({error:"Forbidden"},{status:403});
 const [orders,paid,cod,pending,products,lowStock,inventory,purchases,items,lastOrders]=await Promise.all([
  prisma.order.count(),
  prisma.order.aggregate({where:{paymentStatus:"PAID"},_sum:{totalPaise:true},_count:true}),
  prisma.order.aggregate({where:{paymentMethod:"COD",status:{not:"CANCELLED"}},_sum:{totalPaise:true},_count:true}),
  prisma.order.count({where:{paymentStatus:"PENDING"}}),
  prisma.product.count({where:{active:true}}),
  prisma.product.findMany({where:{active:true,stock:{lte:10}},select:{id:true,name:true,stock:true},orderBy:{stock:"asc"},take:30}),
  prisma.product.findMany({where:{active:true},select:{pricePaise:true,stock:true}}),
  (prisma as any).inventoryPurchase.aggregate({_sum:{totalCostPaise:true,quantity:true},_count:true}),
  prisma.orderItem.findMany({where:{order:{paymentStatus:"PAID"}},select:{quantity:true}}),
  prisma.order.findMany({where:{paymentStatus:"PAID",createdAt:{gte:new Date(Date.now()-29*86400000)}},select:{createdAt:true,totalPaise:true},orderBy:{createdAt:"asc"}})
 ]);
 const dailyMap=new Map<string,{date:string;revenuePaise:number;count:number}>();
 for(const order of lastOrders){const date=order.createdAt.toISOString().slice(0,10);const row=dailyMap.get(date)||{date,revenuePaise:0,count:0};row.revenuePaise+=order.totalPaise;row.count++;dailyMap.set(date,row)}
 return NextResponse.json({orders,paidRevenuePaise:paid._sum.totalPaise||0,paidOrders:paid._count,codOrderCount:cod._count,codOrderValuePaise:cod._sum.totalPaise||0,pendingPayments:pending,activeProducts:products,lowStock,inventoryRetailValuePaise:(inventory as {pricePaise:number;stock:number}[]).reduce((sum:number,p)=>sum+p.pricePaise*p.stock,0),purchasedUnits:purchases._sum.quantity||0,purchaseSpendPaise:purchases._sum.totalCostPaise||0,purchaseRecords:purchases._count,soldUnits:(items as {quantity:number}[]).reduce((sum:number,i)=>sum+i.quantity,0),dailyPaidOrders:Array.from(dailyMap.values())});
}
