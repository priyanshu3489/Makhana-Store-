"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Product = { id:string; slug:string; name:string; pricePaise:number; imageUrl:string; stock:number; flavor:string; weightGrams:number };
type CartItem = { product: Product; quantity: number };

export default function GiftHamperShop({products}:{products:Product[]}) {
  const [selected,setSelected]=useState<string[]>([]);
  const [message,setMessage]=useState("");
  const [giftNote,setGiftNote]=useState("");
  const available=useMemo(()=>products.filter(p=>p.stock>0),[products]);
  const chosen=useMemo(()=>available.filter(p=>selected.includes(p.id)),[available,selected]);
  const total=chosen.reduce((sum,p)=>sum+p.pricePaise,0);
  function toggle(id:string) {
    setMessage("");
    setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length>=6?current:[...current,id]);
  }
  function addCustomHamper() {
    if(chosen.length<2){setMessage("Please choose at least two makhana products for your gift hamper.");return;}
    try {
      const cart:CartItem[]=JSON.parse(localStorage.getItem("makhana-cart")||"[]");
      for(const p of chosen) {
        const found=cart.find(x=>x.product.id===p.id);
        if(found) found.quantity=Math.min(found.quantity+1,p.stock);
        else cart.push({product:p,quantity:1});
      }
      localStorage.setItem("makhana-cart",JSON.stringify(cart));
      window.dispatchEvent(new Event("makhana-cart-updated"));
      setMessage("Your selected hamper products have been added to your basket. Please review them before checkout.");
    } catch { setMessage("We couldn't update your basket. Please try again."); }
  }
  return <div className="gift-hamper-page">
    <section className="gift-hero">
      <div className="gift-hero-copy"><span className="gift-eyebrow">A GIFT THAT FEELS GOOD</span><h1>Your hamper.<br/><em>Your choice.</em></h1><p>Pick the makhana flavours you love. We’ll bring them together as a thoughtful gifting combo.</p><div className="gift-script">Made by you, gifted with love ♡</div><div className="gift-perks"><span>♧ Gift-style presentation</span><span>✿ Your favourite flavours</span><span>❋ A personal touch</span></div></div>
      <div className="gift-hero-art" aria-label="Illustration of a premium gift hamper with makhana jars"><div className="gift-leaf gift-leaf-one">❧</div><div className="gift-box-back"><span>✦</span><b>Makhana<br/>Store</b><small>MADE WITH LOVE</small></div>{[0,1,2].map((n)=><div className={"gift-jar gift-jar-"+(n===0?"one":n===1?"two":"three")} key={n}><span>✿</span><b>{chosen[n]?.flavor||"Makhana"}</b><small>{chosen[n]?"YOUR PICK":"YOUR CHOICE"}</small></div>)}<div className="gift-bowl">◌ ◌ ◌</div><div className="gift-ribbon"/></div>
    </section>
    <section className="gift-hamper-list">
      <div className="gift-section-heading"><span className="gift-eyebrow">CREATE SOMETHING THOUGHTFUL</span><h2>Build your own gift hamper</h2><p>Choose 2 to 6 makhana packs. Mix flavours and make a combo that feels just right.</p></div>
      <div className="gift-builder-layout">
        <div className="gift-product-picker"><div className="gift-picker-heading"><h3>1. Choose your makhana</h3><span>{selected.length} / 6 selected</span></div>
          {available.length===0?<p className="muted">No in-stock products are available right now.</p>:<div className="gift-product-grid">{available.map(p=><label className={"gift-product-option "+(selected.includes(p.id)?"is-selected":"")} key={p.id}><input type="checkbox" checked={selected.includes(p.id)} disabled={!selected.includes(p.id)&&selected.length>=6} onChange={()=>toggle(p.id)}/><img src={p.imageUrl} alt={p.name}/><span className="gift-product-details"><strong>{p.name}</strong><small>{p.flavor} · {p.weightGrams} g</small><b>{formatMoney(p.pricePaise)}</b></span><span className="gift-select-indicator">{selected.includes(p.id)?"✓":"+"}</span></label>)}</div>}
        </div>
        <aside className="gift-your-hamper"><span className="gift-eyebrow">YOUR GIFT BOX</span><h3>2. Review your selection</h3><div className="gift-preview-box"><div className="gift-preview-lid">MAKHANA STORE <span>✿</span></div><div className="gift-preview-jars">{chosen.length?chosen.map((p,i)=><div className="gift-preview-jar" key={p.id}><span>✿</span><small>{p.flavor}</small></div>):<p>Your chosen jars will appear here</p>}</div><div className="gift-preview-ribbon"/></div>
          {chosen.length?<ul className="gift-selected-list">{chosen.map(p=><li key={p.id}><span>{p.name}</span><strong>{formatMoney(p.pricePaise)}</strong></li>)}</ul>:<p className="gift-empty-selection">Select your favourite flavours to start building your hamper.</p>}
          <label className="gift-note-label">Gift message (optional)<textarea value={giftNote} onChange={e=>setGiftNote(e.target.value)} maxLength={160} placeholder="Write a little note for the recipient..." rows={3}/></label>
          <div className="gift-total"><span>{chosen.length} products selected</span><strong>{formatMoney(total)}</strong></div>
          <button className="gift-add-button" type="button" disabled={chosen.length<2} onClick={addCustomHamper}>♧ &nbsp; Add my hamper to basket</button>
          <small className="gift-selection-hint">Choose at least 2 and up to 6 different products.</small>
        </aside>
      </div>
      {message?<p className="gift-cart-feedback" role="status">{message} <a href="/cart">View basket →</a></p>:null}
      <p className="gift-price-note">The total shown is the sum of your selected makhana packs. Gift-box availability, gift wrapping, and any additional packaging charges should be confirmed before checkout. Your gift note is a preview only and is not yet saved with the order.</p>
    </section>
  </div>;
}
