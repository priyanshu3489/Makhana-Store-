import Link from "next/link";

export default function SiteNavigation({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  return (
    <div className="nav-links">
      <Link href="/">Shop</Link>
      <Link href="/about">About</Link>
      <Link href="/account">Account</Link>

      {!isAdmin && (
        <>
          <Link href="/cart">Basket</Link>
          <Link href="/orders">My Orders</Link>
        </>
      )}

      {isAdmin && (
        <>
          <Link className="nav-admin" href="/admin">
            Admin Dashboard
          </Link>
          <Link href="/admin/inventory">Inventory Management</Link>
          <Link href="/admin/offers">Manage Offers</Link>
        </>
      )}
    </div>
  );
}