import { paypalRequest, verifyPayPalWebhook } from "../../../lib/paypal";
import { fulfillPurchase } from "../../../lib/purchaseDelivery";
import { readRawBody } from "../../../lib/rawBody";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method not allowed");
  }

  try {
    const rawBody = await readRawBody(req);
    const event = JSON.parse(rawBody.toString("utf8"));
    const verified = await verifyPayPalWebhook(req.headers, event);
    if (!verified) return res.status(400).end("Invalid PayPal signature");

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (!orderId) throw new Error("PayPal capture did not include an order ID");

      const order = await paypalRequest(`/v2/checkout/orders/${orderId}`);
      const unit = order.purchase_units?.[0];
      const capture = unit?.payments?.captures?.find(
        (item) => item.id === event.resource?.id,
      ) || unit?.payments?.captures?.[0];

      if (order.status === "COMPLETED" && unit?.custom_id && capture?.status === "COMPLETED") {
        await fulfillPurchase({
          userId: unit.custom_id,
          provider: "paypal",
          providerPaymentId: capture.id,
          checkoutEmail: order.payer?.email_address,
          collectionIds: (unit.items || []).map((item) => item.sku).filter(Boolean),
          amount: capture.amount?.value,
          currency: capture.amount?.currency_code,
          purchasedAt: capture.create_time || event.create_time,
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return res.status(500).send(`Webhook error: ${error.message}`);
  }
}
