"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Product = {
  id: string; slug: string; name: string; description: string; flavor: string;
  weightGrams: number; pricePaise: number; imageUrl: string; stock: number;
};

const pages = [
  { title: "Home", href: "/", keywords: "home homepage welcome foxberry pearls makhana" , detail:"Discover Foxberry"},
  { title: "Shop all makhana", href: "/shop", keywords: "shop products buy flavours snacks makhana fox nuts", detail:"Browse every available flavour"},
  { title: "Gift hampers & combos", href: "/combos", keywords: "combo hamper gift gifting box premium luxury celebration customize message", detail:"Create a personalised gift hamper"},
  { title: "Journal", href: "/journal", keywords: "journal articles reads snack rituals tea break movie night flavour", detail:"Ideas, flavour notes and snack inspiration"},
  { title: "About Foxberry", href: "/about", keywords: "about story brand company foxberry", detail:"Our story and what we value"},
  { title: "Shopping basket", href: "/cart", keywords: "cart basket bag checkout items payment", detail:"Review items before checkout"},
  { title: "My account", href: "/account", keywords: "account profile sign in login register password", detail:"Your profile and account details"},
  { title: "My orders", href: "/orders", keywords: "orders previous order history reorder purchase", detail:"View previous purchases"},
  { title: "Track an order", href: "/track", keywords: "track tracking delivery shipment courier shiprocket status awb", detail:"Check delivery progress"},
  { title: "Shipping & returns", href: "/returns", keywords: "shipping delivery refund return exchange policy", detail:"Shipping, refunds and returns"},
  { title: "Customer reviews", href: "/reviews", keywords: "reviews ratings feedback", detail:"Customer feedback"},
];

function SearchIcon(){return <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>}

export default function StoreSearch(){
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [products,setProducts]=useState<Product[]>([]);
  const [loading,setLoading]=useState(false);
  const inputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if(!open)return;
    let active=true;
    setLoading(true);
    fetch("/api/products")
      .then(r=>{if(!r.ok)throw new Error("Search unavailable");return r.json()})
      .then(data=>{if(active)setProducts(Array.isArray(data)?data:[])})
      .catch(()=>{if(active)setProducts([])})
      .finally(()=>{if(active)setLoading(false)});
    const timer=window.setTimeout(()=>inputRef.current?.focus(),40);
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    window.addEventListener("keydown",onKey);
    return()=>{active=false;window.clearTimeout(timer);window.removeEventListener("keydown",onKey)};
  },[open]);

  const normalized=query.trim().toLowerCase();
  const terms=normalized.split(/\\s+/).filter(Boolean);
  const productResults=useMemo(()=>{
    if(!normalized)return [];
    return products.filter(p=>{const haystack=[p.name,p.description,p.flavor,String(p.weightGrams)+" g"].join(" ").toLowerCase().replace(/[-_/]/g," ");return terms.every(term=>haystack.includes(term.replace(/[-_/]/g," ")));}).slice(0,7);
  },[products,normalized]);
  const pageResults=useMemo(()=>{
    if(!normalized)return pages.slice(0,5);
    return pages.filter(p=>{const haystack=(p.title+" "+p.keywords+" "+p.detail).toLowerCase().replace(/[-_/]/g," ");return terms.every(term=>haystack.includes(term.replace(/[-_/]/g," ")));}).slice(0,6);
  },[normalized]);
  const close=()=>{setOpen(false);setQuery("")};

  return <>
    <button type="button" className="nav-icon-link search-trigger" aria-label="Search Foxberry" title="Search products and pages" onClick={()=>setOpen(true)}><SearchIcon/></button>
    {open&&<div className="store-search-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <section className="store-search-dialog" role="dialog" aria-modal="true" aria-label="Search the Foxberry website">
        <div className="store-search-top">
          <span className="eyebrow">FIND YOUR FOXBERRY FAVOURITE</span>
          <button type="button" className="store-search-close" onClick={close} aria-label="Close search">×</button>
        </div>
        <label className="store-search-field">
          <SearchIcon/>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search flavours, products, hampers, orders..." aria-label="Search products and website pages"/>
          {query&&<button type="button" onClick={()=>setQuery("")} aria-label="Clear search">Clear</button>}
        </label>
        <div className="store-search-results">
          {!normalized?<p className="store-search-hint">Popular destinations</p>:<p className="store-search-hint">Search results for <strong>“{query.trim()}”</strong></p>}
          {normalized&&productResults.length>0&&<div className="store-search-group"><h3>Products</h3>{productResults.map(p=><Link href={`/products/${p.slug}`} className="store-search-result store-search-product" key={p.id} onClick={close}><img src={p.imageUrl} alt=""/><span><strong>{p.name}</strong><small>{p.flavor} · {p.weightGrams} g</small></span><b>View →</b></Link>)}</div>}
          <div className="store-search-group"><h3>{normalized?"Pages & services":"Explore Foxberry"}</h3>
            {pageResults.map(p=><Link href={p.href} className="store-search-result" key={p.href} onClick={close}><span><strong>{p.title}</strong><small>{p.detail}</small></span><b>Go →</b></Link>)}
          </div>
          {normalized&&!productResults.length&&!pageResults.length&&<div className="store-search-empty"><strong>No exact matches found.</strong><p>Try a flavour name, “gift hamper”, “track order” or “shipping”.</p><Link href="/shop" onClick={close}>Browse all products →</Link></div>}
          {loading&&<p className="store-search-loading">Loading products…</p>}
        </div>
        <div className="store-search-footer"><span>Search products and every main store section</span><kbd>ESC</kbd></div>
      </section>
    </div>}
  </>;
}
