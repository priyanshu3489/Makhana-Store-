import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import AccountPanel from "@/components/AccountPanel";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next &&
    params.next.startsWith("/") &&
    !params.next.startsWith("//")
      ? params.next
      : "/";

  const user = await getCurrentUser();

  if (!user) {
    return (
      <main
        className="container"
        style={{ paddingTop: 40, maxWidth: 720 }}
      >
        <p className="muted">YOUR MAKHANA HOUSE ACCOUNT</p>
        <h1 style={{ fontSize: 36 }}>Welcome back</h1>
        <p className="muted">
          Sign in to track orders, revisit past purchases and check out faster.
        </p>
        <AccountPanel next={next} />
      </main>
    );
  }

  const eligibleOrders = {
    userId: user.id,
    paymentStatus: { in: ["PAID", "COD_PENDING"] },
  };

  const [
    orders,
    count,
    allItems,
    activeCoupons,
    spendAggregate,
    purchasedProducts,
    availableProducts,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: true },
    }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.orderItem.findMany({
      where: { order: eligibleOrders },
      select: {
        productName: true,
        quantity: true,
        product: { select: { id: true, flavor: true } },
      },
    }),
    prisma.coupon.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
        ],
      },
      select: {
        code: true,
        discountType: true,
        discountValue: true,
        minSubtotalPaise: true,
        maxDiscountPaise: true,
      },
      take: 10,
    }),
    prisma.order.aggregate({
      where: eligibleOrders,
      _sum: { totalPaise: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { userId: user.id } },
      select: { productId: true },
      distinct: ["productId"],
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, flavor: true },
      take: 100,
    }),
  ]);

  const flavorCounts = allItems.reduce(
    (acc, item) => {
      const flavor = item.product.flavor || item.productName;
      acc[flavor] = (acc[flavor] || 0) + item.quantity;
      return acc;
    },
    {} as Record<string, number>,
  );

  const favoriteEntry = Object.entries(flavorCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const favoriteFlavor = favoriteEntry?.[0];
  const favoriteQuantity = favoriteEntry?.[1] ?? 0;
  const lifetimeSpend = spendAggregate._sum.totalPaise || 0;
  const suggestedCoupon = activeCoupons.find(
    (coupon) => coupon.minSubtotalPaise <= 29900,
  );

  const purchasedProductIds = new Set(
    purchasedProducts
      .map((item) => item.productId)
      .filter((id): id is string => Boolean(id)),
  );

  const newProducts = availableProducts
    .filter((product) => !purchasedProductIds.has(product.id))
    .filter((product) => !favoriteFlavor || product.flavor !== favoriteFlavor)
    .slice(0, 3);

  return (
    <main
      className="container"
      style={{ paddingTop: 40, maxWidth: 900 }}
    >
      <div
        className="row"
        style={{ alignItems: "center", flexWrap: "wrap" }}
      >
        <div style={{ flex: 1 }}>
          <p className="muted">YOUR ACCOUNT</p>
          <h1 style={{ fontSize: 36, margin: 0 }}>
            Hello, {user.name}
          </h1>
          <p className="muted">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid-products" style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <p className="muted">Total orders</p>
          <strong style={{ fontSize: 28 }}>{count}</strong>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <p className="muted">Packs purchased</p>
          <strong style={{ fontSize: 28 }}>
            {Object.values(flavorCounts).reduce(
              (sum, quantity) => sum + quantity,
              0,
            )}
          </strong>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <p className="muted">Lifetime spend</p>
          <strong style={{ fontSize: 24 }}>
            {formatMoney(lifetimeSpend)}
          </strong>
        </div>
      </div>

      <section
        className="card personal-offer"
        style={{ padding: 22, marginTop: 26 }}
      >
        <span className="eyebrow">YOUR MAKHANA JOURNEY</span>

        <h2 style={{ fontSize: 26, margin: "8px 0" }}>
          {favoriteFlavor
            ? `Your favourite: ${favoriteFlavor}`
            : "Discover your first favourite"}
        </h2>

        <p className="muted">
          {favoriteFlavor
            ? `You have purchased ${favoriteQuantity} pack(s) of ${favoriteFlavor}. This is your most-purchased flavor based on eligible paid and pending-COD orders.`
            : "Your favorite flavor will appear here after you place an eligible order."}
        </p>

        <div
          className="row"
          style={{ gap: 10, flexWrap: "wrap", marginTop: 16 }}
        >
          <Link className="btn" href="/">
            {favoriteFlavor ? "Shop your favourite" : "Explore makhana"}
          </Link>

          <Link className="btn secondary" href="/orders">
            View order history
          </Link>
        </div>
      </section>

      <section style={{ marginTop: 30 }}>
        <div
          className="row"
          style={{ justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <h2 style={{ fontSize: 24, margin: 0 }}>
            Try something new
          </h2>
          <Link className="text-link" href="/">
            Explore all flavors →
          </Link>
        </div>

        <p className="muted">
          {newProducts.length
            ? "Discover products you haven't purchased yet."
            : "Explore the shop for your next snack discovery."}
        </p>

        {newProducts.length > 0 ? (
          <div className="grid-products" style={{ marginTop: 14 }}>
            {newProducts.map((product) => (
              <div
                className="card"
                key={product.id}
                style={{ padding: 18 }}
              >
                <p className="eyebrow">
                  {product.flavor || "DISCOVER"}
                </p>
                <h3 style={{ marginTop: 6 }}>{product.name}</h3>
                <p className="muted">
                  A new addition to your makhana journey.
                </p>
                <Link className="btn" href="/">
                  Explore product
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 18 }}>
            <p>There are no new recommendations to show right now.</p>
            <Link className="btn" href="/">
              Browse the store
            </Link>
          </div>
        )}
      </section>

      {suggestedCoupon && (
        <section
          className="card"
          style={{ padding: 20, marginTop: 26 }}
        >
          <span className="eyebrow">STORE OFFER</span>
          <h2 style={{ fontSize: 22 }}>A little something for your next order</h2>
          <p>
            Code: <strong>{suggestedCoupon.code}</strong>
            {" · "}
            {suggestedCoupon.discountType === "PERCENT"
              ? `${suggestedCoupon.discountValue}% off`
              : `${formatMoney(suggestedCoupon.discountValue)} off`}
            {suggestedCoupon.minSubtotalPaise > 0 &&
              ` on orders from ${formatMoney(suggestedCoupon.minSubtotalPaise)}`}
            {suggestedCoupon.maxDiscountPaise
              ? ` (max ${formatMoney(suggestedCoupon.maxDiscountPaise)})`
              : ""}
          </p>
          <p className="muted">
            Apply this code at checkout if your order meets the offer terms.
          </p>
          <Link className="btn" href="/">
            Shop now
          </Link>
        </section>
      )}

      <div
        className="row"
        style={{
          marginTop: 32,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: 24, margin: 0 }}>Recent orders</h2>
        <Link className="text-link" href="/orders">
          View all →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: 22, marginTop: 14 }}>
          <p>You have not placed an order yet.</p>
          <Link className="btn" href="/">
            Explore the store
          </Link>
        </div>
      ) : (
        <div className="stack" style={{ marginTop: 14 }}>
          {orders.map((order) => (
            <Link
              className="card"
              key={order.id}
              href={`/orders/${order.id}`}
              style={{ padding: 18 }}
            >
              <div className="row">
                <strong>Order #{order.customerOrderNumber}</strong>
                <span className="pill">{order.status}</span>
              </div>

              <p className="muted">
                {order.createdAt.toLocaleDateString("en-IN")}
                {" · "}
                {order.items.length} item(s)
              </p>

              <div className="row">
                <span>
                  {order.paymentMethod} · {order.paymentStatus}
                </span>
                <strong>{formatMoney(order.totalPaise)}</strong>
              </div>

              <p className="text-link" style={{ marginBottom: 0 }}>
                View order and reorder options →
              </p>
            </Link>
          ))}
        </div>
      )}

      {user.role === "ADMIN" && (
        <p style={{ marginTop: 24 }}>
          <Link className="btn secondary" href="/admin">
            Open admin dashboard
          </Link>
        </p>
      )}
    </main>
  );
}
