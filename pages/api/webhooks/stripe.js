import Stripe from "stripe";
import { recordPurchase } from "../../../lib/purchaseLedger";
import { readRawBody } from "../../../lib/rawBody";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method not allowed");
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).end("Stripe webhook is not configured");
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.metadata?.user_id) {
        await recordPurchase({
          userId: session.metadata.user_id,
          provider: "stripe",
          providerPaymentId: session.payment_intent || session.id,
          checkoutEmail: session.customer_details?.email || session.metadata.checkout_email,
          collectionIds: (session.metadata.collection_ids || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean),
          amount: session.amount_total != null ? (session.amount_total / 100).toFixed(2) : null,
          currency: session.currency?.toUpperCase(),
          purchasedAt: new Date(event.created * 1000).toISOString(),
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
}
