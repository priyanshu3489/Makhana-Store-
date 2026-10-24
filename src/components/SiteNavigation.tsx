import Link from "next/link";

function Icon({ name }: { name: "shop" | "book" | "star" | "user" | "basket" | "package" | "gift" | "shield" }) {
  const paths = {
    shop: <><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"/><path d="M4 6h13M8 8h6"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    basket: <><path d="m3 9 2 11h14l2-11H3Z"/><path d="m8 9 4-6 4 6M9 12v5m6-5v5"/></>,
    package: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M2 6h20v3H2zM12 6c-6 0-6-5-2-5 3 0 2 5 2 5Zm0 0c6 0 6-5 2-5-3 0-2 5-2 5Z"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function SiteNavigation({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="nav-links">
      <Link href="/"><Icon name="shop" /> <span>Shop</span></Link>
      {!isAdmin && <>
        <Link href="/combos"><Icon name="gift" /> <span>Combos</span></Link>
        <Link href="/journal"><Icon name="book" /> <span>Journal</span></Link>
        <Link href="/reviews"><Icon name="star" /> <span>Reviews</span></Link>
        <Link href="/track"><Icon name="package" /> <span>Track</span></Link>
        <Link href="/account"><Icon name="user" /> <span>Account</span></Link>
        <Link href="/cart"><Icon name="basket" /> <span>Basket</span></Link>
      </>}
      {isAdmin && <>
        <Link className="nav-admin" href="/admin">Admin Dashboard</Link>
        <Link href="/admin/inventory">Inventory Management</Link>
        <Link href="/admin/offers">Manage Offers</Link>
      </>}
    </div>
  );
}