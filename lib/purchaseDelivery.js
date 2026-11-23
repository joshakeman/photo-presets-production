import products from "./products.generated.json";
import { createDownloadToken } from "./downloadTokens";
import { recordPurchase, updatePurchaseEmailDelivery } from "./purchaseLedger";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function baseUrl() {
  const value = process.env.SITE_URL || process.env.URL;
  if (!value) throw new Error("SITE_URL is not configured for purchase delivery");
  return value.replace(/\/$/, "");
}

function purchaseCollections(purchase) {
  return purchase.collectionIds
    .map((id) => (products[id] ? { id, ...products[id] } : null))
    .filter(Boolean);
}

function emailContent(purchase) {
  const siteUrl = baseUrl();
  const collections = purchaseCollections(purchase);
  if (!collections.length) throw new Error("Purchase delivery contains no valid collections");

  const downloads = collections.map((collection) => ({
    title: collection.title,
    url: `${siteUrl}/api/download/${encodeURIComponent(collection.id)}?token=${encodeURIComponent(
      createDownloadToken(purchase, collection.id),
    )}`,
  }));

  const buttons = downloads
    .map(
      ({ title, url }) => `
        <tr><td style="padding: 8px 0;">
          <a href="${escapeHtml(url)}" style="display:block;background:#CE790A;color:#111111;text-decoration:none;text-align:center;font-size:18px;font-weight:bold;padding:14px 20px;border-radius:4px;">
            Download ${escapeHtml(title)}
          </a>
        </td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#171717;color:#ffffff;font-family:Georgia,serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Your Photo Presets are ready to download.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#171717;"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border:2px solid #CE790A;background:#242424;border-radius:18px;">
      <tr><td style="padding:40px 32px;text-align:center;">
        <p style="margin:0 0 10px;color:#CE790A;font-size:15px;letter-spacing:2px;text-transform:uppercase;">Photo Presets</p>
        <h1 style="margin:0 0 20px;color:#CE790A;font-size:38px;line-height:1.15;">Your presets have arrived</h1>
        <p style="margin:0 0 28px;color:#ffffff;font-size:18px;line-height:1.6;">The portmanteau is packed. Use the ${downloads.length === 1 ? "button" : "buttons"} below to download your ${downloads.length === 1 ? "collection" : "collections"}.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${buttons}</table>
        <p style="margin:28px 0 0;color:#cccccc;font-size:15px;line-height:1.6;">These private links expire in seven days. Your purchases remain permanently available in <a href="${escapeHtml(`${siteUrl}/downloads`)}" style="color:#CE790A;">Your Library</a>.</p>
        <p style="margin:18px 0 0;color:#999999;font-size:13px;line-height:1.5;">If you did not make this purchase, simply reply to this email and let us know.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = [
    "Your Photo Presets have arrived.",
    "",
    ...downloads.flatMap(({ title, url }) => [`Download ${title}:`, url, ""]),
    "These private links expire in seven days.",
    `Your purchases remain permanently available in Your Library: ${siteUrl}/downloads`,
  ].join("\n");

  return { html, text };
}

async function sendPurchaseEmail(purchase) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PURCHASE_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and PURCHASE_EMAIL_FROM are required for purchase delivery");
  }
  if (!purchase.checkoutEmail) throw new Error("Purchase does not include a delivery email");

  const { html, text } = emailContent(purchase);
  const idempotencyKey = `purchase-delivery/${purchase.provider}/${purchase.providerPaymentId}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [purchase.checkoutEmail],
      subject: "Your Photo Presets have arrived",
      html,
      text,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Resend returned ${response.status}`);
  }
  return { provider: "resend", messageId: result.id };
}

export async function fulfillPurchase(purchase) {
  const record = await recordPurchase(purchase);
  if (process.env.PURCHASE_EMAIL_ENABLED !== "true") return record;
  if (record.emailDelivery?.status === "sent") return record;

  const delivery = await sendPurchaseEmail(record);
  return updatePurchaseEmailDelivery(record, {
    status: "sent",
    ...delivery,
    sentAt: new Date().toISOString(),
  });
}
