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
                <svg viewBox="0 0 48 48" width="34" height="34" fill="none" role="img">
                  <path d="M24 5c-5 7-13 12-13 22a13 13 0 0 0 26 0C37 17 29 12 24 5Z" fill="#F5D58A"/>
                  <path d="M24 15c-3 5-7 8-7 13a7 7 0 0 0 14 0c0-5-4-8-7-13Z" fill="#fff8e7"/>
                  <path d="M24 31v9" stroke="#F5D58A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </span>
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