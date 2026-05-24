@AGENTS.md

---

# Bluezoid Digital Products — Project Memory

## Stack
- **Next.js 16.2.6** App Router (not Pages Router) — `src/app/` convention
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **MongoDB** via Mongoose (`src/lib/mongoose.ts` — singleton connection)
- **Cashfree PG v6** (`cashfree-pg` SDK) — sandbox + production
- **Cloudflare R2** (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`)
- **Brevo** (`@getbrevo/brevo`) — transactional email
- **Zod** — schema validation on all API boundaries
- **Vitest** — unit tests (`src/__tests__/`)
- **Playwright** — E2E + accessibility tests (`tests/`)

---

## Product
Single product: **Deep Dive Into Go** ebook
- Slug: `deep-dive-into-go`
- Current price: **₹179** (seeded via `npm run seed`)
- Product page: `/products/deep-dive-into-go`

---

## Security Architecture (fully implemented)

### Core principle
Frontend sends: `productSlug + identity only` — **never amount**.
Amount is always fetched from MongoDB and locked before Cashfree is called.

### Full payment flow
1. Frontend hits `POST /api/checkout` with `{productSlug, firstName, lastName, email, phone}`
2. Backend fetches price from MongoDB → creates Order with `lockedAmount`
3. Cashfree order created with locked amount → returns `paymentSessionId`
4. User pays on Cashfree checkout page
5. Cashfree fires webhook → `POST /api/webhooks/cashfree`
6. Webhook: HMAC-SHA256 verified → timestamp freshness → idempotency → amount reconciliation → order marked `paid` → one-time token generated → Brevo email sent
7. Success page polls `POST /api/verify-payment` every 3s (up to 60s) until `paid: true`
8. Buyer clicks download link in email → `GET /api/download/[token]` → atomic one-time redemption → 302 redirect to signed R2 URL (10 min)

### Key security properties
- **Price tamper-proof**: amount locked in DB before Cashfree call, reconciled on webhook
- **Webhook HMAC**: `HMAC-SHA256(timestamp + rawBody, CASHFREE_SECRET_KEY)` — timing-safe comparison
- **Timestamp**: Cashfree sandbox sends ms (13 digits), production sends seconds (10 digits) — auto-detected in `isWebhookTimestampFresh`
- **Idempotency**: SHA-256(`cfOrderId:cfPaymentId:eventType`) stored in WebhookLog, prevents double-processing
- **One-time download token**: `randomBytes(32).hex` → SHA-256 hash stored in DB, atomic `findOneAndUpdate` with `usedAt: null` guard
- **IDOR protection**: admin routes behind timing-safe bearer token (`ADMIN_API_KEY`)
- **Rate limiting**: MongoDB sliding window per (endpoint, IP), in-memory fallback on DB error
- **Fraud checks**: IP velocity, email velocity, disposable email, bot UA detection

---

## Key Files

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/checkout/route.ts` | Create order + Cashfree session. Price always from DB. |
| `src/app/api/webhooks/cashfree/route.ts` | HMAC verify → reconcile → mark paid → send email |
| `src/app/api/verify-payment/route.ts` | Polling endpoint. Reads order status from MongoDB only. |
| `src/app/api/download/[token]/route.ts` | One-time token redemption → signed R2 URL (10 min) |
| `src/app/api/products/[slug]/route.ts` | DB-driven product data. Never returns `fullPdfR2Key`. |
| `src/app/api/admin/products/[id]/route.ts` | PATCH product with bearer token auth |
| `src/app/api/admin/orders/route.ts` | GET orders with filters, bearer token auth |

### Libraries
| File | Purpose |
|------|---------|
| `src/lib/cashfree.ts` | Cashfree SDK wrapper, `verifyCashfreeWebhook`, `reconcileAmounts` |
| `src/lib/security.ts` | HMAC helpers, token generation, `isWebhookTimestampFresh`, NoSQL sanitization |
| `src/lib/fraud.ts` | IP velocity, email velocity, disposable email, bot UA |
| `src/lib/rate-limiter.ts` | MongoDB sliding window. Uses two-step upsert (key-only) to avoid E11000 race |
| `src/lib/r2.ts` | R2 signed URLs. `fullPdfR2Key` never returned to client |
| `src/lib/brevo.ts` | Transactional email. Download link valid 10 minutes. |
| `src/lib/admin-auth.ts` | Timing-safe bearer token verification |
| `src/lib/audit.ts` | Fire-and-forget audit log writes |
| `src/lib/mongoose.ts` | Mongoose singleton connection |

### Models
| File | Purpose |
|------|---------|
| `src/models/Order.ts` | Core order — `lockedAmount`, `status`, `signedUrlMeta` |
| `src/models/Product.ts` | Product catalog — `currentPrice`, `fullPdfR2Key`, `isActive`, `isSaleEnabled` |
| `src/models/Payment.ts` | Payment record per webhook event |
| `src/models/WebhookLog.ts` | Every webhook hit logged, valid or not |
| `src/models/AuditLog.ts` | Security audit trail |
| `src/models/RateLimitTracking.ts` | Sliding window rate limit records |
| `src/models/FraudMonitoring.ts` | Fraud signals (replay attacks, spoof attempts, amount probes) |
| `src/models/PaymentAttempt.ts` | Checkout attempt log per IP |

### Frontend
| File | Purpose |
|------|---------|
| `src/components/deep-dive-into-go/DeepDiveIntoGoPage.tsx` | Fetches product from `/api/products/[slug]`, passes to children |
| `src/components/deep-dive-into-go/PurchaseModal.tsx` | Checkout form. Sends `productSlug`, no amount. Button: "Buy Now ₹{price}" |
| `src/components/deep-dive-into-go/HeroSection.tsx` | Accepts `product: ProductData` prop |
| `src/components/deep-dive-into-go/PricingCard.tsx` | Accepts `product: ProductData` prop |
| `src/app/products/deep-dive-into-go/success/page.tsx` | Polls `verify-payment` every 3s up to 60s |
| `src/proxy.ts` | Security headers, bot blocking, admin IP allowlist, route allowlist |

### Scripts & Config
| File | Purpose |
|------|---------|
| `scripts/seed-product.ts` | Idempotent upsert of product. Run: `npm run seed` |
| `SECURITY.md` | Full threat model, flow diagram, deployment checklist |
| `vitest.config.ts` | Unit test config, coverage thresholds (80% lines/functions/statements, 75% branches) |
| `playwright.config.ts` | E2E config, webServer on localhost:3000 |
| `.github/workflows/ci.yml` | lint → unit tests → E2E → accessibility |

---

## Environment Variables (all required)

```
# MongoDB
MONGODB_URI=...

# Cashfree
CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...
CASHFREE_ENV=sandbox|production
NEXT_PUBLIC_CASHFREE_ENV=sandbox|production
NEXT_PUBLIC_APP_URL=https://yourdomain.in

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_FULL_PDF_KEY=ebooks/golang/v1/deep_dive_into_go.pdf
R2_SAMPLE_PDF_KEY=ebooks/golang/v1/deep_dive_into_go_sample.pdf

# Brevo email
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=support@bluezoid.in
BREVO_SENDER_NAME=Bluezoid

# Admin
ADMIN_API_KEY=<openssl rand -hex 32>
ADMIN_ALLOWED_IPS=1.2.3.4  # optional, comma-separated
```

---

## Test Suite

### Unit Tests (Vitest) — `npm run test:unit`
Coverage thresholds: 80% lines/functions/statements, 75% branches.

| Test file | What it covers |
|-----------|---------------|
| `src/__tests__/api/checkout.test.ts` | Rate limiting, fraud block, product not found, Cashfree failure, success |
| `src/__tests__/api/verify-payment.test.ts` | Invalid orderId, order not found, pending/paid/failed states |
| `src/__tests__/api/products-slug.test.ts` | 200 with product, 404 not found, 400 invalid slug, cache-control header |
| `src/__tests__/api/sample-download.test.ts` | Sample PDF signed URL generation |
| `src/__tests__/lib/cashfree.test.ts` | `verifyCashfreeWebhook`, `reconcileAmounts`, `fetchCashfreeOrder` |
| `src/__tests__/lib/r2.test.ts` | `getSamplePdfSignedUrl`, `getFullPdfSignedUrl`, `getFullPdfR2Key` |
| `src/__tests__/lib/brevo.test.ts` | Email sends correct subject, recipient, HTML with 10-minute expiry |
| `src/__tests__/lib/validators.test.ts` | Zod schema validation, disposable email block |
| `src/__tests__/components/SuccessPage.test.tsx` | paid/pending/failed/error states, polling behaviour |
| `src/__tests__/components/PurchaseModal.test.tsx` | Form validation, submission, error display |
| `src/__tests__/components/HeroSection.test.tsx` | Renders with product prop |
| `src/__tests__/components/CancelledPage.test.tsx` | Cancelled page rendering |
| `src/__tests__/components/FAQAccordion.test.tsx` | Expand/collapse, ARIA |

**Run:** `npm run test:unit` or `npm run test:unit:coverage`

### E2E Tests (Playwright) — `npm run test:e2e`
Require dev server running (`npm run dev`) or CI auto-starts it.

| Test file | What it covers |
|-----------|---------------|
| `tests/e2e/landing-page.spec.ts` | Hero heading, cover image, Buy Now button, JSON-LD, OG tags, FAQ, footer |
| `tests/e2e/purchase-flow.spec.ts` | Modal open/close, ARIA, validation errors, checkout API called, error state |
| `tests/e2e/success-page.spec.ts` | Verifying spinner, paid/pending/failed/error states, back link |
| `tests/e2e/cancelled-page.spec.ts` | Heading, no-charge message, links |
| `tests/e2e/middleware-redirect.spec.ts` | `/` → product page, `/about` → product page, success/cancelled not redirected, sitemap/robots |

### Accessibility Tests (Playwright + axe-core) — `npm run test:a11y`

| Test file | What it covers |
|-----------|---------------|
| `tests/accessibility/axe.spec.ts` | WCAG 2.1 AA: landing, cancelled, success (paid state), purchase modal, all images alt text, keyboard focus, Escape closes modal |

---

## npm Scripts

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run test:unit        # Vitest unit tests
npm run test:unit:coverage  # Vitest with coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:a11y        # Playwright accessibility tests
npm run seed             # Seed product into MongoDB (idempotent)
```

---

## Known Quirks & Fixes Applied

1. **Cashfree webhook timestamp**: sandbox sends milliseconds (13 digits), production sends seconds (10 digits). `isWebhookTimestampFresh` auto-detects via `ts > 1e12` check.
2. **Cashfree `cfOrderId` in sandbox**: webhook `order.order_id` is our `BLZ-...` internal ID, not the numeric Cashfree ID. Webhook handler looks up by `cashfreeOrderId` first, then falls back to `internalOrderId`.
3. **Rate limiter E11000**: two-step upsert (first try update within window, then upsert by key only) prevents duplicate key race condition on the `key_1` unique index.
4. **Success page polling**: polls every 3s up to 20 attempts (60s max). Previously called verify-payment once and got stuck on "processing".
5. **Mongoose deprecation**: `new: true` → `returnDocument: 'after'` in rate-limiter.
6. **Duplicate schema indexes**: removed inline `index: true` from `webhookIdempotencyKey` (Payment) and `idempotencyKey` (WebhookLog) — kept only the explicit `schema.index()` declarations.
7. **Download link expiry**: email says 10 minutes (matching `DOWNLOAD_TOKEN_TTL_MS = 10 * 60 * 1000`).

---

## Deployment Checklist (Vercel)

- [ ] Switch `CASHFREE_ENV=production` and `NEXT_PUBLIC_CASHFREE_ENV=production`
- [ ] Register production webhook URL in Cashfree dashboard (not sandbox)
- [ ] Set `NEXT_PUBLIC_APP_URL=https://yourdomain.in`
- [ ] Run `npm run seed` against production MongoDB
- [ ] Set `ADMIN_ALLOWED_IPS` to your IP (optional but recommended)
- [ ] Verify R2 bucket CORS allows GET from your domain
- [ ] Test full end-to-end: pay → webhook → email → download link → PDF opens

---

## Admin API (curl examples)

```bash
# Update product price
curl -X PATCH https://yourdomain.in/api/admin/products/<product_id> \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"currentPrice": 199, "discountPercent": 80}'

# List recent orders
curl "https://yourdomain.in/api/admin/orders?status=paid&limit=20" \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```
