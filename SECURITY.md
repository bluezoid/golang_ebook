# Security Architecture

## Threat Model

### Assets

| Asset | Sensitivity | Where Stored |
|-------|------------|--------------|
| Full PDF (paid content) | High | Cloudflare R2 (private bucket) |
| Product pricing | Medium | MongoDB — never in frontend code |
| Customer email/phone | Medium | MongoDB (orders collection) |
| Cashfree secret key | Critical | Vercel env var only |
| R2 access credentials | Critical | Vercel env var only |
| Admin API key | Critical | Vercel env var only |
| Download tokens | High | SHA-256 hash in MongoDB only |

### Threat Actors

- **Price tampering attacker** — modifies request body to pay a lower amount
- **Webhook spoofer** — sends a fake `PAYMENT_SUCCESS` webhook to unlock content
- **Replay attacker** — replays a valid older webhook to trigger duplicate processing
- **IDOR attacker** — guesses order IDs or download tokens to access paid content
- **NoSQL injection attacker** — sends `$gt`/`$where` operators in form fields
- **Rate abuser / bot** — floods checkout/download with automated requests
- **Scraper** — harvests content or pricing data programmatically

---

## Payment Flow Security

```
Browser                    Next.js API              MongoDB            Cashfree
  |                            |                       |                   |
  |-- POST /api/checkout ----→ |                       |                   |
  |   {productSlug, name,      |                       |                   |
  |    email, phone}           |-- findOne(slug) ----→ |                   |
  |   NO amount, NO price      |←-- {price from DB} -- |                   |
  |                            |-- Order.create ------→ |                   |
  |                            |   {lockedAmount=price} |                   |
  |                            |-- PGCreateOrder -------------------------→ |
  |                            |   amount=lockedAmount  |                   |
  |←-- {paymentSessionId} ---- |                       |                   |
  |                            |                       |                   |
  |== Cashfree checkout UI ====|========================|===================|
  |                            |                       |                   |
  |                            |←-- WEBHOOK POST ----------------------------
  |                            |    {PAYMENT_SUCCESS}   |                   |
  |                            |-- verify HMAC-SHA256   |                   |
  |                            |-- check timestamp age  |                   |
  |                            |-- check idempotency    |                   |
  |                            |-- reconcile amounts    |                   |
  |                            |-- generate token ----→ |                   |
  |                            |-- send email           |                   |
  |←-- redirect to /success -- |                       |                   |
  |                            |                       |                   |
  |-- POST /api/verify-payment→|                       |                   |
  |   {orderId}                |-- findOne(orderId) --→ |                   |
  |←-- {paid: true} --------- |←-- {status: paid} --- |                   |
  |                            |                       |                   |
  |== Email: download link =====|========================|                   |
  |                            |                       |                   |
  |-- GET /api/download/[token]→|                       |                   |
  |                            |-- hashToken(token)     |                   |
  |                            |-- findOne(tokenHash) →|                   |
  |                            |-- check expiry         |                   |
  |                            |-- atomic usedAt=now   →|                   |
  |                            |-- getSignedUrl(R2)     |                   |
  |←-- 302 → signed R2 URL --- |                       |                   |
```

### Key Controls at Each Step

| Step | Control | Bypass Resistance |
|------|---------|-------------------|
| Checkout | Price fetched from MongoDB, never from request | Attacker can't send amount — field rejected by schema |
| Order creation | `lockedAmount` set once at creation, immutable | No update path for amount field |
| Cashfree order | Called with `lockedAmount` directly | Even if Cashfree were compromised, our lock matters |
| Webhook | HMAC-SHA256 with `timingSafeEqual` | Can't forge without `CASHFREE_SECRET_KEY` |
| Replay protection | Timestamp freshness ≤ 5 minutes | Old webhooks rejected even with valid signature |
| Duplicate prevention | Unique `webhookIdempotencyKey` index in MongoDB | DB-level uniqueness constraint, not application-level |
| Amount reconciliation | Integer paise comparison | Float rounding tricks don't work |
| Token generation | `randomBytes(32)` → 2^256 space | Brute force takes longer than the universe's age |
| Token storage | SHA-256 hash only | Leak of DB doesn't expose valid tokens |
| Token redemption | Atomic `findOneAndUpdate` with `usedAt: null` guard | Concurrent requests both succeed the lookup but only one wins the update |
| R2 URL | Signed, expires in 10 minutes | Shared URL expires before it can be widely distributed |

---

## Required Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Cashfree
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=production   # or sandbox

# Cloudflare R2
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_key_id
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_FULL_PDF_KEY=ebooks/deep-dive-into-go/full.pdf
R2_SAMPLE_PDF_KEY=ebooks/deep-dive-into-go/sample.pdf

# Brevo (email)
BREVO_API_KEY=your_brevo_key
BREVO_FROM_EMAIL=noreply@bluezoid.in
BREVO_FROM_NAME=Bluezoid

# App
NEXT_PUBLIC_APP_URL=https://bluezoid.in
NEXT_PUBLIC_CASHFREE_ENV=production

# Admin
ADMIN_API_KEY=long_random_string_min_32_chars
ADMIN_ALLOWED_IPS=1.2.3.4,5.6.7.8   # optional IP allowlist
```

---

## Deployment Checklist

### Before First Deploy

- [ ] MongoDB Atlas: IP allowlist set to Vercel outbound IPs
- [ ] R2 bucket: Public access **disabled**; only signed URLs work
- [ ] R2 CORS: Not configured (no browser-direct access needed)
- [ ] `CASHFREE_ENV=production` set in Vercel
- [ ] `ADMIN_API_KEY` is at least 32 random characters
- [ ] `NEXT_PUBLIC_APP_URL` matches the production domain exactly
- [ ] Cashfree webhook URL registered: `https://bluezoid.in/api/webhooks/cashfree`
- [ ] Cashfree webhook secret matches `CASHFREE_SECRET_KEY`
- [ ] Run `npm run seed` to populate the product in MongoDB
- [ ] Test the full checkout flow in Cashfree sandbox before going live

### After Each Deploy

- [ ] Verify `/api/products/deep-dive-into-go` returns current price
- [ ] Verify a test webhook (from Cashfree dashboard) is accepted
- [ ] Check Vercel logs for any `[webhook]` errors

---

## Penetration Testing Checklist

### Price Tampering

```bash
# Should be rejected — amount field stripped by schema, price comes from DB
curl -X POST https://bluezoid.in/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Test","lastName":"User","email":"t@t.com","phone":"+911234567890",
       "productSlug":"deep-dive-into-go","amount":1,"price":1}'
# Expected: 200 with paymentSessionId (amount ignored — DB price used)
```

### Webhook Spoofing

```bash
# Should return 200 but with processingResult=rejected in WebhookLog
curl -X POST https://bluezoid.in/api/webhooks/cashfree \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-signature: invalidsignature' \
  -H 'x-webhook-timestamp: '$(date +%s) \
  -d '{"type":"PAYMENT_SUCCESS","data":{"order":{"order_id":"BLZ-TEST"},"payment":{"payment_amount":149}}}'
# Expected: {"received":false} — check FraudMonitoring for webhook_spoof_attempt signal
```

### Replay Attack

```bash
# Use a valid signature but with a stale timestamp (> 5 min ago)
# Expected: {"received":false}, isReplay=true in WebhookLog
```

### Token Brute Force

```bash
# Should be rate-limited after 3 attempts per IP per minute
for i in $(seq 1 10); do
  curl -s https://bluezoid.in/api/download/$(openssl rand -hex 32)
done
# Expected: 429 after 3 attempts
```

### IDOR via Order ID

```bash
# BLZ- IDs contain a UUID fragment — not sequentially guessable
# Verify-payment returns 404 for non-existent IDs — no oracle
curl -X POST https://bluezoid.in/api/verify-payment \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"BLZ-0000000000000001"}'
# Expected: 404 {"error":"Order not found"}
```

### NoSQL Injection

```bash
curl -X POST https://bluezoid.in/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"firstName":{"$gt":""},"lastName":"User","email":"t@t.com","phone":"+911234567890","productSlug":"deep-dive-into-go"}'
# Expected: 400 {"error":"Invalid request"}
```

### Admin Endpoint Auth

```bash
# Without token — should 401
curl https://bluezoid.in/api/admin/orders
# Expected: 401

# With wrong token — should 401
curl -H 'Authorization: Bearer wrongtoken' https://bluezoid.in/api/admin/orders
# Expected: 401
```

---

## Incident Response

### Suspicious Webhook Volume

1. Check `WebhookLog` for `processingResult: 'rejected'` spike
2. Check `FraudMonitoring` for `webhook_spoof_attempt` signals
3. If under attack: rotate `CASHFREE_SECRET_KEY` in Cashfree dashboard and Vercel env

### Compromised Download Token

Tokens expire in 10 minutes and are single-use. A leaked token is limited in blast radius:
- Maximum one download before it's consumed
- Token is useless after expiry
- Action: no rollback needed unless the same email/order is at risk

### Compromised R2 Credentials

1. Rotate R2 access keys immediately in Cloudflare dashboard
2. Update `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` in Vercel
3. All existing signed URLs expire within 10 minutes automatically

### Data Breach (MongoDB)

- Download tokens: only SHA-256 hashes stored — leaked hashes are not exploitable (tokens are random 256-bit values)
- Payment data: amounts and status only — no card numbers (Cashfree handles PCI)
- Customer PII: email, name, phone — notify affected customers per applicable law
