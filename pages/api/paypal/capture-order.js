import { getUser } from "@netlify/identity";
import { paypalRequest } from "../../../lib/paypal";
import { recordPurchase } from "../../../lib/purchaseLedger";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await getUser();
    if (!user?.id) return res.status(401).json({ error: "Please log in again" });
    const orderId = typeof req.body?.orderId === "string" ? req.body.orderId : "";
    if (!/^[A-Z0-9]+$/i.test(orderId)) {
      return res.status(400).json({ error: "Invalid PayPal order" });
    }

    const order = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: { "PayPal-Request-Id": `capture-${orderId}` },
      body: "{}",
    });
    const unit = order.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];

    if (order.status !== "COMPLETED" || unit?.custom_id !== user.id || capture?.status !== "COMPLETED") {
      return res.status(400).json({ error: "PayPal did not confirm the payment" });
    }

    try {
      await recordPurchase({
        userId: user.id,
        provider: "paypal",
        providerPaymentId: capture.id,
        checkoutEmail: order.payer?.email_address || user.email,
        collectionIds: (unit.items || []).map((item) => item.sku).filter(Boolean),
        amount: capture.amount?.value,
        currency: capture.amount?.currency_code,
        purchasedAt: capture.create_time || new Date().toISOString(),
      });
    } catch (ledgerError) {
      console.error("PayPal payment captured; webhook must record it:", ledgerError);
    }

    return res.status(200).json({ status: "COMPLETED" });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return res.status(500).json({ error: "Unable to complete PayPal checkout" });
  }
}
