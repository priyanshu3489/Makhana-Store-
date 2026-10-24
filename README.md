# Makhana Store — DIY Next.js + PostgreSQL + Prisma + Razorpay

A starter e-commerce application for a makhana brand: product catalog, product pages, browser basket, customer registration/login, order history, online payments, Cash on Delivery, coupons, stock reservation, admin inventory/order screens and reports.

> This is a runnable starter, not a compliance-certified or fully audited commerce system. Before live sales, test payment and webhook behavior in Razorpay test mode, review the security notes below, and have the application reviewed.

## Stack
- Next.js App Router + React + TypeScript
- PostgreSQL + Prisma 6
- Password hashing with bcryptjs; signed HTTP-only JWT session cookie with jose
- Razorpay Standard Checkout and server-side payment verification
- Zod validation

## 1. Prerequisites
- Node.js 20.9+ (use a current LTS release)
- PostgreSQL database (local Docker/Postgres or managed database)
- Razorpay account; use test keys until end-to-end tests pass

## 2. Install
```bash
cp .env.example .env
npm install
```
Edit `.env` and set `DATABASE_URL`, `SESSION_SECRET` (at least 32 random characters), Razorpay test credentials, and the store name. Never commit `.env`.

Generate a strong local session secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## 3. Database
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```
If you modify `schema.prisma`, rerun `npx prisma migrate dev --name describe_change` and `npx prisma generate`.

## 4. Add your brand assets
Replace the demo paths in `prisma/seed.ts` with your own product image URLs or local paths such as `/products/classic.jpg`. Put images in `public/products/`. Re-run `npm run db:seed`; seed updates existing product records by slug. Replace the store name in `.env`.

## 5. Run
```bash
npm run dev
```
Open http://localhost:3000. Useful routes:
- `/` catalog
- `/products/[slug]` product detail
- `/cart` basket
- `/account` registration/sign-in
- `/checkout` checkout (login required)
- `/orders` order history
- `/admin` admin dashboard (admin role required)
- `/api/products` product JSON

## 6. Promote your own account to admin
1. Register your own account at `/account`.
2. Run `npx prisma studio`, open the `User` table and change only your own `role` from `CUSTOMER` to `ADMIN`.
3. Sign out and sign back in. Do not expose public admin registration or leave a default admin password.

Alternatively, after confirming the email belongs to you, use a SQL client with:
```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'your-verified-email@example.com';
```

## 7. Razorpay setup
1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from test mode.
2. In the Razorpay dashboard, add a webhook endpoint `https://YOUR_HOST/api/webhooks/razorpay` and select at least `payment.captured`, `payment.failed`, and `order.paid` events.
3. Copy the webhook signing secret to `RAZORPAY_WEBHOOK_SECRET`. This is different from the API key secret.
4. Use the test payment instruments listed in Razorpay's current documentation. Do not use real payments during development.
5. Confirm the payment is captured before fulfilling the order. Test browser callback, delayed webhook, duplicate webhook, failed payment, customer closing checkout, and server/network failure.

The API verifies checkout signatures and fetches payment details from Razorpay before marking the order paid. Webhooks are signature checked and deduplicated. The payment failure webhook restores reserved inventory. Test all of these paths with your account and current Razorpay API behavior before launch.

## 8. Business rules to review
- Delivery is currently ₹50 and free when the discounted merchandise subtotal is at least ₹499. Update `src/app/api/checkout/route.ts` for your shipping policy.
- `WELCOME10` is seeded as 10% off on a ₹299 minimum subtotal, capped at ₹100. Coupon discount values of type `FIXED` are stored in paise.
- Stock is reserved/decremented during checkout. Online payment failures restore stock via webhook; build a scheduled cleanup job for abandoned unpaid orders, because a customer can close checkout without a `payment.failed` event.
- COD orders are created as confirmed and have `COD_PENDING` payment status. Implement COD cancellation/return/collection reconciliation to match your courier process.
- Sales report currently sums captured online payments; COD is shown separately as order value, not recognized cash revenue.

## 9. Important production hardening before accepting orders
1. **CSRF and rate limiting:** Add rate limits to login/register/checkout/admin endpoints and origin/CSRF protection for state-changing requests. Use a rate-limit store suitable for serverless deployments.
2. **Admin UI:** Protected product APIs support create/update/archive, but the starter UI only lists/archives products. Build a product editor for product create/update, image upload, and stock adjustment.
3. **Coupons:** Create/update/deactivate controls, redemption records, per-customer limits, and fully race-safe coupon reservation should be added before campaigns. Current usage limit check has a small concurrency edge case.
4. **Webhook correctness:** Add a scheduled reconciliation job that queries Razorpay for pending orders, confirm captured payment amount/currency/order association, and handle refunds and disputes. Verify current provider webhook payload shapes in test mode.
5. **Abandoned online orders:** Add a scheduled task to expire unpaid orders and release stock idempotently after a suitable timeout.
6. **Refunds and cancellations:** Do not manually mark paid orders cancelled. Add a refund API, refund state machine, audit trail, and stock policy.
7. **Session controls:** Add email verification, password reset, account lockout/abuse controls, session revocation, and a proper privacy/retention policy.
8. **Order access:** Customer order pages are scoped to the authenticated user. Avoid exposing order PII in public API responses.
9. **Inventory transactions:** Checkout uses serializable transactions and conditional stock updates. Retry transient serialization conflicts where needed; monitor duplicate order attempts.
10. **Legal and operations:** Check current FSSAI, food labeling, Legal Metrology, GST/tax, consumer protection, privacy, returns/refunds, shipping and invoice obligations applicable to your business.
11. **Production deployment:** Set secrets in the host dashboard, use `prisma migrate deploy`, enable backups, HTTPS, monitoring, error tracking and least-privilege database credentials.

## 10. Deployment (low-cost path)
- Push code to a Git repository; ensure `.env` is not committed.
- Deploy the Next.js app on a hosting provider compatible with Next.js.
- Create managed PostgreSQL and set `DATABASE_URL` in production environment settings.
- Set `SESSION_SECRET`, Razorpay API keys, webhook secret and public store URL.
- Run `npx prisma migrate deploy` as part of a controlled release step; seed production data intentionally rather than blindly reseeding.
- Configure Razorpay webhook to the production HTTPS URL and test it from the dashboard.
- Add a custom domain, transactional email service, backups and monitoring.

## API summary
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/products`
- `POST /api/checkout`
- `POST /api/payment/verify`
- `POST /api/webhooks/razorpay`
- Admin only: `GET/POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`, `GET/POST /api/admin/coupons`, `GET /api/admin/reports`

## Troubleshooting
- `SESSION_SECRET` error: set a random secret at least 32 characters long.
- Database errors: confirm PostgreSQL is reachable and `DATABASE_URL` includes the correct credentials and database name.
- Missing products: run `npm run db:seed` and check that `active=true`.
- Product images broken: verify that image files exist under `public/` and seed paths begin with `/`.
- Razorpay checkout missing: confirm `RAZORPAY_KEY_ID` is set and the checkout script has loaded.
- Payment pending: inspect webhook delivery and server logs; never manually mark an unverified payment as paid.

## Feature update: customer accounts, reports and inventory purchases
- `/about` contains editable brand-story content.
- Customer accounts show recent purchases, lifetime spend, flavour preferences inferred from order history and active eligible store offers.
- Admin reports include last-30-day paid sales, stock valuation at retail price, purchased units, recorded purchase spend, low-stock alerts and CSV exports.
- Admin inventory tab can record supplier stock receipts and automatically increase product stock. This requires applying the included `InventoryPurchase` migration and regenerating Prisma Client.
- Order details provide a print/Save as PDF bill and Google Maps link for the delivery address.
- Checkout validates Indian mobile/PIN formats. Actual OTP verification requires an SMS/email provider and is not simulated.

See `FEATURES-UPDATE.md` for the migration and testing steps.
# Makhana-Store-
