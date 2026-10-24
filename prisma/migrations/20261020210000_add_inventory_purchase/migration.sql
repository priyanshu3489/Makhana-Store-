CREATE TABLE "InventoryPurchase" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "reference" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitCostPaise" INTEGER NOT NULL,
    "totalCostPaise" INTEGER NOT NULL,
    "notes" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryPurchase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InventoryPurchase_purchasedAt_idx" ON "InventoryPurchase"("purchasedAt");
CREATE INDEX "InventoryPurchase_productId_idx" ON "InventoryPurchase"("productId");
ALTER TABLE "InventoryPurchase" ADD CONSTRAINT "InventoryPurchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
