export const formatMoney = (paise: number) => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR" }).format(paise / 100);
