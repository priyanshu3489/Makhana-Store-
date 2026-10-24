import CheckoutForm from "@/components/CheckoutForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/account?next=/checkout");
  }

  return (
    <main
      className="container checkout-page"
      style={{
        paddingTop: 32,
        paddingBottom: 64,
        maxWidth: 1200,
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <p className="eyebrow">MAKHANA HOUSE · SECURE CHECKOUT</p>
        <h1 style={{ fontSize: 36, margin: "8px 0" }}>
          Complete your order
        </h1>
        <p className="muted">
          Fresh crunch, delivered to your doorstep.
        </p>
      </header>

      <CheckoutForm
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone || "",
        }}
      />
    </main>
  );
}
