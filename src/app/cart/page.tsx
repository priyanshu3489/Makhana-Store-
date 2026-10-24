import Link from "next/link";
import Cart from "@/components/Cart";

export default function CartPage() {
  return (
    <main
      className="container"
      style={{
        paddingTop: 36,
        paddingBottom: 64,
        maxWidth: 1200,
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <p className="eyebrow">MAKHANA HOUSE · YOUR SELECTION</p>

        <div
          className="row"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: 36, margin: "8px 0" }}>
              Your basket
            </h1>
            <p className="muted">
              Your favourite crunch is just a few steps away.
            </p>
          </div>

          <Link className="text-link" href="/">
            ← Continue shopping
          </Link>
        </div>
      </header>

      <Cart />
    </main>
  );
}
