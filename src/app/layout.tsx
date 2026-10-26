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
            <Link href="/" className="brand brand-icon-only" aria-label="Makhana House home" title="Makhana House">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="34" height="34" fill="none">
                  <path d="M24 5C17 11 8 17 8 27a13 13 0 0 0 26 0C34 16 28 10 24 5Z" fill="#315D3B"/>
                  <path d="M29 7C35 5 42 8 42 15c0 8-9 14-17 16 1-10-1-18 4-24Z" fill="#668B49"/>
                  <path d="M7 17C1 17 1 25 7 30c4 4 9 5 13 5-3-8-5-15-13-18Z" fill="#8EAA64"/>
                  <path d="M13 25 21 33 36 15" stroke="#FFFDF5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="brand-wordmark">Makhana House</span>
            </Link>
            <SiteNavigation isAdmin={isAdmin} />
          </nav>
        </header>

        <div className="offer-marquee" role="region" aria-label="Store offers">
          <div className="offer-marquee-track">
            <span>✦ FREE SHIPPING on orders ₹499 and above</span><span>✦ Check checkout for exclusive collection discounts</span><span>✦ Build your own makhana combo</span><span>✦ Secure checkout · Track orders from your account</span>
            <span aria-hidden="true">✦ FREE SHIPPING on orders ₹499 and above</span><span aria-hidden="true">✦ Check checkout for exclusive collection discounts</span><span aria-hidden="true">✦ Build your own makhana combo</span><span aria-hidden="true">✦ Secure checkout · Track orders from your account</span>
          </div>
        </div>
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
              <Link href="/combos">Build a combo</Link>
              <Link href="/journal">Journal</Link>
              <Link href="/reviews">Customer reviews</Link>
              <Link href="/returns">Shipping &amp; returns</Link>
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
                  <Link href="/orders">Order history &amp; tracking</Link>
                </>
              )}
            </div>

            <div>
              <h3>Help &amp; information</h3>
              <Link href="/about#story">Our story</Link>
              <span className="muted">Support: add your business email</span>
              <Link href="/returns">Shipping, refunds &amp; returns</Link>
              <Link href="/track">Track an order</Link>
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