import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import BuyAgainButton from "@/components/BuyAgainButton";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account?next=/orders");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return <main className="container" style={{ paddingTop: 40, maxWidth: 900 }}>
    <div className="row" style={{ alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ flex: 1 }}><p className="muted">YOUR PURCHASE HISTORY</p><h1 style={{ fontSize: 36, margin: 0 }}>My orders</h1><p className="muted">Every order, all in one place.</p></div>
      <Link className="btn" href="/">+ Place a new order</Link>
    </div>
    {orders.length === 0 ? <div className="card" style={{ padding: 24, marginTop: 20 }}><h2>No orders yet</h2><p className="muted">Your previous purchases will appear here after your first order.</p><Link className="btn" href="/">Discover our makhana</Link></div> :
      <div className="stack" style={{ marginTop: 22 }}>{orders.map(o => <article className="card" key={o.id} style={{ padding: 20 }}>
        <div className="row" style={{ alignItems: "flex-start" }}><div><strong>Order #{o.customerOrderNumber}</strong><p className="muted">{o.createdAt.toLocaleString("en-IN")} · {o.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</p></div><span className="pill">{o.status}</span></div>
        <div style={{ margin: "12px 0" }}>{o.items.map(item => <div className="row" key={item.id} style={{ margin: "8px 0" }}><span>{item.productName} × {item.quantity}</span><span>{formatMoney(item.unitPricePaise * item.quantity)}</span></div>)}</div>
        <div className="row" style={{ borderTop: "1px solid #e7e4da", paddingTop: 12 }}><span className="muted">{o.paymentMethod} · {o.paymentStatus}</span><strong>{formatMoney(o.totalPaise)}</strong></div>
        <div className="row" style={{ justifyContent: "flex-start", flexWrap: "wrap", marginTop: 14 }}><Link className="btn secondary" href={`/orders/${o.id}`}>View details</Link><BuyAgainButton items={o.items.map(item => ({ product: item.product, quantity: item.quantity }))} /></div>
      </article>)}</div>}
  </main>;
}
