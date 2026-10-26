"use client";
import {useState} from "react";
type P={id:string;slug:string;name:string;pricePaise:number;imageUrl:string;stock:number};
type C={product:P;quantity:number};
export default function ProductAdd({product}:{product:P}){
 const [message,setMessage]=useState("");
 const [added,setAdded]=useState(false);
 function add(){
  try{
   const cart:C[]=JSON.parse(localStorage.getItem("makhana-cart")||"[]");
   const found=cart.find(x=>x.product.id===product.id);
   if(found)found.quantity=Math.min(found.quantity+1,product.stock);else cart.push({product,quantity:1});
   localStorage.setItem("makhana-cart",JSON.stringify(cart));
   window.dispatchEvent(new Event("makhana-cart-updated"));
   setAdded(true);setMessage("Added to your basket — happy crunching!");
   window.setTimeout(()=>setAdded(false),1800);
  }catch{setMessage("Could not update basket. Please try again.");}
 }
 return <div className="product-add-wrap"><button className={`btn product-add-btn ${added?"product-added":""}`} disabled={product.stock<1} onClick={add}>{product.stock<1?"Sold out":added?<><span aria-hidden="true">✓</span> Added to basket</> : <><span aria-hidden="true">＋</span> Add to basket</>}</button>{message&&<p role="status" className={`product-add-feedback ${added?"is-added":""}`}>{message} <a href="/cart">View basket →</a></p>}</div>
}
