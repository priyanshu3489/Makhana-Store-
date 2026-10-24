"use client";

type Item = { product: { id: string; slug: string; name: string; pricePaise: number; imageUrl: string; stock: number; active: boolean }; quantity: number };

export default function BuyAgainButton({ items }: { items: Item[] }) {
  function buyAgain() {
    const available = items.filter((item) => item.product.active && item.product.stock > 0);
    if (!available.length) {
      window.alert("These products are currently unavailable. Please browse the store for alternatives.");
      return;
    }
    let current: { product: Item["product"]; quantity: number }[] = [];
    try { current = JSON.parse(localStorage.getItem("makhana-cart") || "[]"); } catch { current = []; }
    for (const item of available) {
      const existing = current.find((entry) => entry.product.id === item.product.id);
      const quantity = Math.min(item.quantity + (existing?.quantity || 0), item.product.stock, 20);
      if (existing) existing.quantity = quantity;
      else current.push({ product: item.product, quantity: Math.min(item.quantity, item.product.stock, 20) });
    }
    localStorage.setItem("makhana-cart", JSON.stringify(current));
    window.dispatchEvent(new Event("makhana-cart-updated"));
    window.location.assign("/cart");
  }
  return <button className="btn" type="button" onClick={buyAgain}>Buy again</button>;
}
