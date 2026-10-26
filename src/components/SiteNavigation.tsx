import Link from "next/link";

function Icon({ name }: { name: "search" | "user" | "basket" | "home" | "shop" | "gift" | "book" | "leaf" }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    basket: <><path d="m3 9 2 11h14l2-11H3Z"/><path d="m8 9 4-6 4 6M9 12v5m6-5v5"/></>,
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    shop: <><path d="M3 10h18l-2-6H5l-2 6Z"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M2 6h20v3H2zM12 6c-6 0-6-5-2-5 3 0 2 5 2 5Zm0 0c6 0 6-5 2-5-3 0-2 5-2 5Z"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"/><path d="M4 6h13M8 8h6"/></>,
    leaf: <><path d="M20 4C9 3 4 8 4 15c0 3 2 5 5 5 8 0 12-8 11-16Z"/><path d="M4 21 15 9M7 12l1 4M12 9l4 1"/></>
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function SiteNavigation({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="nav-links">
      <div className="nav-primary">
        <Link href="/" className="nav-home">Home</Link>
        <Link href="/#shop">Shop</Link>
        {!isAdmin && <>
          <Link href="/combos">Combos</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/about">About</Link>
        </>}
      </div>
      <div className="nav-utilities">
        {!isAdmin && <Link href="/#shop" className="nav-icon-link" aria-label="Search products" title="Search products"><Icon name="search" /></Link>}
        <Link href={isAdmin ? "/admin" : "/account"} className="nav-icon-link" aria-label={isAdmin ? "Admin dashboard" : "Account"} title={isAdmin ? "Admin dashboard" : "Account"}><Icon name="user" /></Link>
        {!isAdmin && <Link href="/cart" className="nav-icon-link nav-basket-link" aria-label="Shopping basket" title="Shopping basket"><Icon name="basket" /><span className="nav-basket-dot" aria-hidden="true" /></Link>}
      </div>
    </div>
  );
}
