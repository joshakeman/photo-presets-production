# Purchase email delivery

Stripe and PayPal both pass completed purchases to the shared fulfillment code in
`lib/purchaseDelivery.js`. The purchase is recorded before email delivery is
attempted, so a temporary email failure does not remove the collection from the
customer's Library.

## Netlify environment variables

- `PURCHASE_EMAIL_ENABLED`: Set to `true` only after testing the sender. Email is
  disabled by default.
- `RESEND_API_KEY`: Server-side Resend API key.
- `PURCHASE_EMAIL_FROM`: A sender on a domain verified in Resend, for example
  `Photo Presets <presets@example.com>`.
- `DOWNLOAD_LINK_SECRET`: A long, random secret used to sign seven-day download
  links. Do not reuse a payment-provider secret.
- `SITE_URL`: The public site origin, for example
  `https://photo-presets.netlify.app`.

After adding or changing environment variables, redeploy the site. Test with
Stripe and PayPal sandbox purchases before enabling live payment modes.

## Delivery behavior

- Each message contains one download button per purchased collection.
- Emailed links work for seven days and are verified against the purchase ledger.
- The customer's Library remains the permanent place to download purchases.
- The stable payment-provider ID is used as Resend's idempotency key, and the
  resulting message ID is saved on the purchase record to prevent duplicates.
