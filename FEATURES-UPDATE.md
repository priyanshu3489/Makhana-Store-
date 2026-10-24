# Makhana Store — feature update

## Included in this update
- Refreshed storefront homepage with product catalogue, sale pricing when configured, offer callout, snack-time benefits, responsive layout and store navigation.
- New About page with editable brand-story placeholders. Replace these with your own verified sourcing, quality, founder and certification information.
- Shared footer linking to shopping, About, basket, account, orders and admin.
- Customer account dashboard with purchase count, recent orders, lifetime paid/COD-pending spend, favourite flavour inferred from order history, currently active store coupons and personalised product suggestions.
- Admin sign-in routes ADMIN accounts to `/admin` by default; customer accounts continue to the storefront.
- Admin sales overview with paid revenue, COD order value, pending payments, units sold, last-30-day sales, low-stock products and CSV export for orders/inventory/purchases.
- Inventory tools to adjust counted stock, record supplier purchases, track supplier/reference/quantity/unit cost/total cost and automatically increase stock on purchase receipt.
- Basket estimate shows subtotal, estimated shipping and estimated total. Server checkout remains authoritative for prices, stock, coupon eligibility and shipping.
- Checkout validates Indian 10-digit mobile numbers and six-digit PIN codes, and provides a Google Maps address preview link.
- Order detail page acts as a bill/invoice and provides print / Save as PDF, order/payment status, line items, discount, shipping, total, delivery details and Google Maps link. Successful online payment and COD order creation redirect to this page.
- Responsive visual styling and print-specific invoice styles.

## Apply and run
1. Back up your existing project and extract this archive into a separate folder first.
2. Copy the updated project files into your working project. Keep your existing `.env` private; the archive deliberately excludes `.env`, `node_modules`, and `.next`.
3. Install dependencies with `npm install`.
4. Set `DATABASE_URL`, `SESSION_SECRET` (at least 32 characters), and Razorpay credentials in your local `.env`. Start with Razorpay test credentials.
5. Apply the new inventory-purchase database migration and regenerate Prisma Client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx tsc --noEmit
   ```
   The archive includes a migration SQL file for `InventoryPurchase`; if Prisma reports that your local migration history differs, inspect the migration status and do not reset the database.
6. Start the app with `npm run dev` and test `/`, `/about`, `/cart`, `/account`, `/orders`, `/admin` and checkout in test mode.

## Important limitations / production tasks
- Phone/PIN format validation and map links are included. Actual SMS OTP, email verification, password reset and delivery-service PIN lookup require a configured verification/email/logistics provider; the UI does not falsely mark unverified contact details as verified.
- Personalisation currently uses purchase history to recommend a favourite flavour and displays active eligible store coupons. Customer-exclusive, single-use offers need customer-bound coupon records and checkout enforcement before they should be advertised as exclusive.
- Purchase entries record supplier stock receipts and purchase cost; they are not supplier invoices/accounting, tax ledgers or a full procurement workflow.
- PDF download uses the browser print dialog (“Save as PDF”), not a server-generated certified tax invoice. Add the registered business identity, GST/tax fields, invoice numbering and required legal details before production use.
- Review rate limiting, CSRF/origin checks, email/SMS verification, privacy and retention, refund/cancellation handling, abandoned payment stock release, payment/webhook reconciliation, supplier accounting, backups and applicable Indian food-labeling/tax/consumer rules before live sales.
- Never commit `.env` or expose Razorpay secrets. Rotate any real credential that may have been shared or committed accidentally.
