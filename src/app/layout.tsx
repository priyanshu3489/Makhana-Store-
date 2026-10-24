import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import SiteNavigation from "@/components/SiteNavigation";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || "Makhana House",
  description: "Shop roasted makhana and fox nuts online.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="container nav">
            <Link href="/" className="brand">
              <span className="brand-mark">M</span>
              <span>
                {process.env.NEXT_PUBLIC_STORE_NAME || "Makhana House"}
                <small>EVERYDAY CRUNCH</small>
              </span>
            </Link>

            <SiteNavigation isAdmin={isAdmin} />
          </nav>
        </header>

        {children}

        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <Link href="/" className="footer-brand">
                Makhana House
              </Link>
              <p className="muted">Fresh crunch. Thoughtfully packed.</p>
              <p className="muted" style={{ maxWidth: 320 }}>
                A flavourful little break for the everyday. Browse the range,
                track orders and find your next favourite.
              </p>
            </div>

            <div>
              <h3>Explore</h3>
              <Link href="/">Shop all flavours</Link>
              <Link href="/about">About us</Link>
              {!isAdmin && <Link href="/cart">Basket</Link>}
            </div>

            <div>
              <h3>{isAdmin ? "Store management" : "Your account"}</h3>

              {isAdmin ? (
                <>
                  <Link href="/admin">Admin Dashboard</Link>
                  <Link href="/admin/inventory">Inventory Management</Link>
                  <Link href="/admin/offers">Manage Offers</Link>
                </>
              ) : (
                <>
                  <Link href="/account">Sign in / create account</Link>
                  <Link href="/orders">Order history</Link>
                </>
              )}
            </div>

            <div>
              <h3>Help &amp; information</h3>
              <Link href="/about#story">Our story</Link>
              <span className="muted">Support: add your business email</span>
              <span className="muted">
                Shipping &amp; returns: add your policy
              </span>
            </div>
          </div>

          <div className="container footer-bottom">
            <span>
              © {new Date().getFullYear()}{" "}
              {process.env.NEXT_PUBLIC_STORE_NAME || "Makhana House"}
            </span>
            <span>Made for your everyday crunch.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}