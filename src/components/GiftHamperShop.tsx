"use client";
import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Product={id:string;slug:string;name:string;pricePaise:number;imageUrl:string;stock:number;flavor:string;weightGrams:number};
type Hamper={slug:string;name:string;count:number;pricePaise:number;tag:string};
const HAMPERS:Hamper[]=[{"slug":"most-selling","name":"Most Selling Hamper","count":3,"pricePaise":59900,"tag":"BESTSELLER"},{"slug":"premium","name":"Premium Hamper","count":5,"pricePaise":89900,"tag":"MORE TO LOVE"},{"slug":"celebration-gifting","name":"Celebration Gifting","count":8,"pricePaise":129900,"tag":"CELEBRATE"},{"slug":"luxury-gifting","name":"Luxury Gifting","count":12,"pricePaise":189900,"tag":"SIGNATURE GIFT"}];
export default function GiftHamperShop({products}:{products:Product[]}){
 const [tier,setTier]=useState<Hamper>(HAMPERS[0]);
 const [selected,setSelected]=useState<string[]>([]);
 const [giftNote,setGiftNote]=useState("");
 const [message,setMessage]=useState("");
 const available=useMemo(()=>products.filter(p=>p.stock>0),[products]);
 const chosen=useMemo(()=>selected.map(id=>available.find(p=>p.id===id)).filter(Boolean) as Product[],[selected,available]);
 function toggle(id:string){setMessage("");setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length>=tier.count?current:[...current,id]);}
 function chooseHamper(h:Hamper){setTier(h);setSelected([]);setMessage("");}
 function addHamper(){
  if(chosen.length!==tier.count){setMessage("Please select exactly "+tier.count+" packs for this hamper.");return;}
  try{
   const raw=JSON.parse(localStorage.getItem("makhana-cart")||"[]");
   const cart=Array.isArray(raw)?raw:[];
   const ids=chosen.map(p=>p.id);
   const filtered=cart.filter((x:any)=>!x.hamper);
   const hamper={slug:tier.slug,name:tier.name,count:tier.count,pricePaise:tier.pricePaise,productIds:ids,productNames:chosen.map(p=>p.name),giftNote:giftNote.trim()};
   for(const p of chosen) filtered.push({product:p,quantity:1,hamper});
   localStorage.setItem("makhana-cart",JSON.stringify(filtered));
   window.dispatchEvent(new Event("makhana-cart-updated"));
   setMessage(tier.name+" added to your basket at "+formatMoney(tier.pricePaise)+".");
  }catch{setMessage("Could not update your basket. Please try again.");}
 }
 return <div className="gift-hamper-page">
  <section className="gift-hero-banner" aria-label="Foxberry gifting hampers"><img src="/products/Hamper%20banner.png" alt="Foxberry makhana gifting hampers" fetchPriority="high"/></section>
  <section className="gift-hamper-list"><div className="gift-section-heading"><span className="gift-eyebrow">CHOOSE YOUR GIFT BOX</span><h2>Four ways to make someone smile</h2><p>Choose your box first. Then select exactly the number of jars included in that box. The hamper price covers the complete gift set.</p></div>
   <div className="gift-card-grid"><button type="button" className={"gift-card "+(tier.slug==="most-selling"?"is-selected":"")} onClick={()=>chooseHamper(HAMPERS[0])}><span className="gift-eyebrow">BESTSELLER</span><h3>Most Selling Hamper</h3><strong className="gift-card-price">{formatMoney(HAMPERS[0].pricePaise)}</strong><p>3 makhana jars · Choose any flavours</p><span className="gift-select-indicator">{tier.slug==="most-selling"?"Selected ✓":"Choose hamper →"}</span></button><button type="button" className={"gift-card "+(tier.slug==="premium"?"is-selected":"")} onClick={()=>chooseHamper(HAMPERS[1])}><span className="gift-eyebrow">MORE TO LOVE</span><h3>Premium Hamper</h3><strong className="gift-card-price">{formatMoney(HAMPERS[1].pricePaise)}</strong><p>5 makhana jars · Choose any flavours</p><span className="gift-select-indicator">{tier.slug==="premium"?"Selected ✓":"Choose hamper →"}</span></button><button type="button" className={"gift-card "+(tier.slug==="celebration-gifting"?"is-selected":"")} onClick={()=>chooseHamper(HAMPERS[2])}><span className="gift-eyebrow">CELEBRATE</span><h3>Celebration Gifting</h3><strong className="gift-card-price">{formatMoney(HAMPERS[2].pricePaise)}</strong><p>8 makhana jars · Choose any flavours</p><span className="gift-select-indicator">{tier.slug==="celebration-gifting"?"Selected ✓":"Choose hamper →"}</span></button><button type="button" className={"gift-card "+(tier.slug==="luxury-gifting"?"is-selected":"")} onClick={()=>chooseHamper(HAMPERS[3])}><span className="gift-eyebrow">SIGNATURE GIFT</span><h3>Luxury Gifting</h3><strong className="gift-card-price">{formatMoney(HAMPERS[3].pricePaise)}</strong><p>12 makhana jars · Choose any flavours</p><span className="gift-select-indicator">{tier.slug==="luxury-gifting"?"Selected ✓":"Choose hamper →"}</span></button></div>
   <div className="gift-builder-layout"><div className="gift-product-picker"><div className="gift-picker-heading"><h3>1. Fill your {tier.count}-pack hamper</h3><span>{selected.length} / {tier.count} selected</span></div><p className="muted">Choose any in-stock makhana flavours for your jars. You can mix different flavours to make the gift personal.</p><div className="gift-product-grid">{available.map(p=><label className={"gift-product-option "+(selected.includes(p.id)?"is-selected":"")} key={p.id}><input type="checkbox" checked={selected.includes(p.id)} disabled={!selected.includes(p.id)&&selected.length>=tier.count} onChange={()=>toggle(p.id)}/><img src={p.imageUrl} alt={p.name}/><span className="gift-product-details"><strong>{p.name}</strong><small>{p.flavor} · {p.weightGrams} g</small><b>{formatMoney(p.pricePaise)}</b></span><span className="gift-select-indicator">{selected.includes(p.id)?"✓":"+"}</span></label>)}</div></div>
   <aside className="gift-your-hamper"><span className="gift-eyebrow">YOUR GIFT BOX</span><h3>2. Add your gifting message & review</h3><div className="gift-preview-box"><div className="gift-preview-lid">MAKHANA STORE <span>✿</span></div><div className="gift-preview-jars">{chosen.length?chosen.map(p=><div className="gift-preview-jar" key={p.id}><span>✿</span><small>{p.flavor}</small></div>):<p>Your selected packs appear here</p>}</div><div className="gift-preview-ribbon"/></div><ul className="gift-selected-list">{chosen.map(p=><li key={p.id}><span>{p.name}</span><strong>Included</strong></li>)}</ul><label className="gift-note-label">Message for the gifting box (optional)<textarea value={giftNote} onChange={e=>setGiftNote(e.target.value)} maxLength={160} placeholder="Write a little note for the recipient..." rows={3}/></label><div className="gift-total"><span>Fixed hamper price</span><strong>{formatMoney(tier.pricePaise)}</strong></div><button className="gift-add-button" type="button" disabled={chosen.length!==tier.count} onClick={addHamper}>♧ &nbsp; Add hamper to basket</button><small className="gift-selection-hint">Select exactly {tier.count} packs to continue.</small></aside></div>
   {message?<p className="gift-cart-feedback" role="status">{message} <a href="/cart">View basket →</a></p>:null}<p className="gift-price-note">The displayed hamper price is the complete fixed price for the selected gift box and its chosen makhana jars. Delivery charges, if any, are shown at checkout.</p>
  </section></div>;
}
