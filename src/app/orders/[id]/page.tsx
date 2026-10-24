import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatMoney } from "@/lib/money";
import InvoiceActions from "@/components/InvoiceActions";

export const dynamic = "force-dynamic";

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/account?next=/orders");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="container" style={{ paddingTop: 40, maxWidth: 820 }}>
      <div className="invoice-heading">
        <div>
          <p className="eyebrow">ORDER CONFIRMATION · BILL</p>
          <h1 style={{ fontSize: 36, margin: 0 }}>
            Invoice #{order.customerOrderNumber}
          </h1>
          <p className="muted">
            Placed {order.createdAt.toLocaleString("en-IN")} ·{" "}
            {order.paymentStatus}
          </p>
        </div>
        <InvoiceActions />
      </div>

      <div className="card" style={{ padding: 22, marginTop: 20 }}>
        <div className="row">
          <span>Order status</span>
          <strong>{order.status}</strong>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <span>Payment status</span>
          <strong>{order.paymentStatus}</strong>
        </div>

        <hr style={{ margin: "20px 0", borderColor: "#e7e4da" }} />

        {order.items.map((item) => (
          <div className="row" key={item.id} style={{ margin: "12px 0" }}>
            <span>
              {item.productName} × {item.quantity}
            </span>
            <strong>
              {formatMoney(item.unitPricePaise * item.quantity)}
            </strong>
          </div>
        ))}

        <hr style={{ margin: "20px 0", borderColor: "#e7e4da" }} />

        <div className="row">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotalPaise)}</span>
        </div>

        <div className="row">
          <span>Discount</span>
          <span>−{formatMoney(order.discountPaise)}</span>
        </div>

        <div className="row">
          <span>Shipping</span>
          <span>{formatMoney(order.shippingPaise)}</span>
        </div>

        <div className="row" style={{ fontSize: 20, marginTop: 14 }}>
          <strong>Total</strong>
          <strong>{formatMoney(order.totalPaise)}</strong>
        </div>

        <hr style={{ margin: "20px 0", borderColor: "#e7e4da" }} />

        <h3>Delivery address</h3>
        <p>
          {order.customerName}
          <br />
          {order.address}
          <br />
          {order.city}, {order.state} {order.postalCode}
          <br />
          {order.phone}
        </p>

        <p>
          <a
            className="text-link"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${order.address}, ${order.city}, ${order.state} ${order.postalCode}`
            )}`}
          >
            View delivery address on Google Maps ↗
          </a>
        </p>

        <div className="invoice-footer">
          <p>
            <strong>Thank you for choosing Makhana House.</strong>
          </p>
          <p className="muted">
            Keep this bill for your records. For help, contact your store
            support team.
          </p>
        </div>
      </div>
    </main>
  );
}