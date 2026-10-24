"use client";
export default function InvoiceActions(){return <div className="invoice-actions"><button className="btn" onClick={()=>window.print()}>Download / print bill</button><button className="btn secondary" onClick={()=>window.history.back()}>Back</button><p className="muted">Choose “Save as PDF” in the print dialog to download a PDF copy.</p></div>}
