"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Product = { id:string; slug:string; name:string; pricePaise:number; imageUrl:string; stock:number; flavor:string; weightGrams:number };
type CartItem = { product: Product; quantity: number };

export default function ComboBuilder({products}:{products:Product[]}) {
  const [selected,setSelected]=useState<string[]>([]);
  const [message,setMessage]=useState("");
  const chosen=useMemo(()=>products.filter(p=>selected.includes(p.id)),[products,selected]);
  const total=chosen.reduce((sum,p)=>sum+p.pricePaise,0);
  function toggle(id:string) {
    setMessage("");
    setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length>=6?current:[...current,id]);
  }
  function addCombo() {
    if(selected.length<2){setMessage("Choose at least two flavours to build your combo.");return;}
    try {
      const cart:CartItem[]=JSON.parse(localStorage.getItem("makhana-cart")||"[]");
      for(const p of chosen) {
        const found=cart.find(x=>x.product.id===p.id);
        if(found) found.quantity=Math.min(found.quantity+1,p.stock);
        else cart.push({product:p,quantity:1});
      }
      localStorage.setItem("makhana-cart",JSON.stringify(cart));
      window.dispatchEvent(new Event("makhana-cart-updated"));
      setMessage("Your combo has been added to the basket. Any eligible offers and shipping are confirmed at checkout.");
    } catch { setMessage("We couldn't update your basket. Please try again."); }
  }
  if(products.length===0) return <p className="muted">No in-stock flavours are available to build a combo right now.</p>;
  return <div>
    <p className="muted" style={{marginTop:0}}>Choose 2–6 packs. This builder adds your selected packs to the basket; current product prices and eligible coupon discounts are calculated at checkout.</p>
    <div className="combo-builder-grid">{products.map(p=><label className="combo-pick" key={p.id}>
      <input type="checkbox" checked={selected.includes(p.id)} disabled={!selected.includes(p.id)&&selected.length>=6} onChange={()=>toggle(p.id)} />
      <img src={p.imageUrl} alt="" />
      <span className="combo-pick-info"><strong>{p.name}</strong><span className="muted">{p.flavor} · {p.weightGrams} g</span><strong>{formatMoney(p.pricePaise)}</strong></span>
    </label>)}</div>
    <div className="combo-builder-footer"><div><strong>{selected.length} flavour{selected.length===1?"":"s"} selected</strong><p>Combined pack total: {formatMoney(total)}</p></div><button type="button" className="btn" onClick={addCombo} disabled={selected.length<2}>Add combo to basket →</button></div>
    {message&&<p role="status" className="combo-feedback">{message} <a href="/cart" className="text-link">View basket</a></p>}
  </div>;
}
