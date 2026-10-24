import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
const schema=z.object({orderNumber:z.string().trim().regex(/^[1-9]\d{0,8}$/),email:z.string().trim().email().max(254)});
export async function POST(req:Request){
 try{
  const parsed=schema.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:"Enter a valid order number and checkout email."},{status:400});
  const number=Number(parsed.data.orderNumber);
  const order=await prisma.order.findFirst({where:{customerOrderNumber:number,email:parsed.data.email.toLowerCase()},select:{customerOrderNumber:true,status:true,paymentStatus:true,createdAt:true,updatedAt:true,items:{select:{productName:true,quantity:true}}}});
  if(!order)return NextResponse.json({error:"We couldn't find an order matching those details. Check the number and checkout email, or sign in to view your orders."},{status:404});
  return NextResponse.json({order:{orderNumber:order.customerOrderNumber,status:order.status,paymentStatus:order.paymentStatus,createdAt:order.createdAt.toISOString(),updatedAt:order.updatedAt.toISOString(),items:order.items.map(i=>({name:i.productName,quantity:i.quantity}))}});
 }catch(e){console.error("order_tracking_error",e);return NextResponse.json({error:"Order tracking is temporarily unavailable. Please try again."},{status:500});}
}
