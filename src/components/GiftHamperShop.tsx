"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Product = { id:string; slug:string; name:string; pricePaise:number; imageUrl:string; stock:number; flavor:string; weightGrams:number };
type CartItem = { product: Product; quantity: number };
const hampers = [
  { id:"classic-delight", name:"Classic Delight Hamper", tag:"A thoughtful first gift", description:"A wholesome selection of Classic, Pudina, Cheese and Peri Peri makhana.", slugs:["classic-roasted-makhana","pudina-makhana","cheese-makhana","peri-peri-makhana"], ribbon:"BESTSELLER" },
  { id:"flavour-fiesta", name:"Flavour Fiesta Hamper", tag:"For the flavour explorer", description:"A lively mix of Peri Peri, Black Pepper, Tomato Chilli and Cream & Onion.", slugs:["peri-peri-makhana","black-pepper-makhana","tomato-chilli-makhana","cream-onion-makhana"], ribbon:"FAN FAVOURITE" },
  { id:"premium-wellness", name:"Premium Wellness Hamper", tag:"A premium little gesture", description:"A considered selection of Classic, Himalayan Pink Salt, Achari and Desi Masala.", slugs:["classic-roasted-makhana","himalayan-pink-salt-makhana","achari-masala-makhana","masala-makhana"], ribbon:"PREMIUM" },
  { id:"ultimate-gifting", name:"Ultimate Gifting Hamper", tag:"Make the occasion special", description:"The complete makhana experience with six favourite flavours in a keepsake gift box.", slugs:["classic-roasted-makhana","peri-peri-makhana","cheese-makhana","pudina-makhana","himalayan-pink-salt-makhana","masala-makhana"], ribbon:"FULL COLLECTION" },
];

export default function GiftHamperShop({products}:{products:Product[]}) {
  const [message,setMessage]=useState("");
  const available=useMemo(()=>new Map(products.map(p=>[p.slug,p])),[products]);
  const bundles=hampers.map(h=>({...h,items:h.slugs.map(s=>available.get(s)).filter((p):p is Product=>Boolean(p)),complete:h.slugs.every(s=>available.has(s))}));
  function addHamper(items:Product[]) {
    try {
      const cart:CartItem[]=JSON.parse(localStorage.getItem("makhana-cart")||"[]");
      for(const p of items) {
        const found=cart.find(x=>x.product.id===p.id);
        if(found) found.quantity=Math.min(found.quantity+1,p.stock);
        else cart.push({product:p,quantity:1});
      }
      localStorage.setItem("makhana-cart",JSON.stringify(cart));
      window.dispatchEvent(new Event("makhana-cart-updated"));
      setMessage("Your hamper items have been added to your basket. Review the items and delivery details at checkout.");
    } catch { setMessage("We couldn't update your basket. Please try again."); }
  }
  return <div className="gift-hamper-page">
    <section className="gift-hero">
      <div className="gift-hero-copy"><span className="gift-eyebrow">A GIFT THAT FEELS GOOD</span><h1>Makhana<br/><em>Gift Hampers</em></h1><p>Perfect for gifting. Perfect for wellness. Share a little crunch, wrapped with a lot of thought.</p><div className="gift-script">Healthy Gift, Happy Heart ♡</div><div className="gift-perks"><span>♧ Premium gift box</span><span>✿ Thoughtful gifting</span><span>❋ Happy snacking</span></div></div>
      <div className="gift-hero-art" aria-label="Illustration of a premium gift hamper with makhana jars"><div className="gift-leaf gift-leaf-one">❧</div><div className="gift-box-back"><span>✦</span><b>Makhana<br/>Store</b><small>GIFT COLLECTION</small></div><div className="gift-jar gift-jar-one"><span>✿</span><b>Makhana</b><small>ROASTED</small></div><div className="gift-jar gift-jar-two"><span>✿</span><b>Makhana</b><small>PERI PERI</small></div><div className="gift-bowl">◌ ◌ ◌</div><div className="gift-ribbon"/></div>
    </section>
    <section className="gift-hamper-list"><div className="gift-section-heading"><span className="gift-eyebrow">MADE TO BE SHARED</span><h2>Our Combo Hampers</h2><p>A delightful blend of flavours in a premium gift box</p></div>
      <div className="gift-card-grid">{bundles.map((h,i)=><article className="gift-card" key={h.id}><div className={"gift-card-art gift-card-art-"+(i+1)}><div className="gift-card-box"><span className="gift-card-brand-mark">✿</span><strong>Makhana<br/>Store</strong><small>{h.name.replace(" Hamper","").toUpperCase()}</small><div className="gift-card-jars">{h.items.slice(0,6).map((p,j)=><div className="mini-jar" key={p.id+"-"+j}><span>✿</span><small>{p.flavor}</small></div>)}</div></div><span className="gift-card-ribbon">{h.ribbon}</span></div><div className="gift-card-body"><span className="gift-card-tag">{h.tag}</span><h3>{h.name}</h3><p>{h.description}</p><div className="gift-card-includes">{h.items.length} makhana jars · Gift-ready box</div><div className="gift-card-price"><strong>{formatMoney(h.items.reduce((sum,p)=>sum+p.pricePaise,0))}</strong><span>Price for included products</span></div><button className="gift-add-button" type="button" disabled={!h.complete||h.items.some(p=>p.stock<1)} onClick={()=>addHamper(h.items)}>♧ &nbsp; Add hamper to basket</button>{!h.complete?<small className="gift-unavailable">Some hamper flavours are not in the catalogue yet.</small>:null}</div></article>)}</div>
      {message?<p className="gift-cart-feedback" role="status">{message} <a href="/cart">View basket →</a></p>:null}
      <p className="gift-price-note">Hamper totals are calculated from the current prices of the included products. Items are added to your basket individually; shipping and any eligible offers are confirmed at checkout.</p>
    </section>
  </div>;
}
