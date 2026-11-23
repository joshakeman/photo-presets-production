import Stripe from "stripe";
import { getUser } from "@netlify/identity";
import products from "../../lib/products.generated.json";
import { purchasesForUser, recordPurchase } from "../../lib/purchaseLedger";

async function importStripeHistory(user) {
  if (!process.env.STRIPE_SECRET_KEY) return [];

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sessions = await stripe.checkout.sessions.search({
    query: `metadata['user_id']:'${user.id.replaceAll("'", "")}'`,
    limit: 100,
  });
  const paidSessions = sessions.data.filter(
    (session) => session.payment_status === "paid",
  );

  await Promise.all(
    paidSessions.map((session) =>
      recordPurchase({
        userId: user.id,
        provider: "stripe",
        providerPaymentId: session.payment_intent || session.id,
        checkoutEmail: session.customer_details?.email || session.metadata?.checkout_email || user.email,
        collectionIds: (session.metadata?.collection_ids || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
        amount: session.amount_total != null ? (session.amount_total / 100).toFixed(2) : null,
        currency: session.currency?.toUpperCase(),
        purchasedAt: new Date(session.created * 1000).toISOString(),
      }),
    ),
  );

  return paidSessions.length ? purchasesForUser(user.id) : [];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const user = await getUser();
    if (!user?.id) {
      return res.status(401).json({ error: "Please log in to open your library." });
    }

    let purchases = await purchasesForUser(user.id);
    if (purchases.length === 0) {
      purchases = await importStripeHistory(user);
    }
    const purchasedIds = new Set(
      purchases.flatMap((purchase) => purchase.collectionIds || []),
    );

    const collections = [...purchasedIds]
      .map((id) => (products[id] ? { id, ...products[id] } : null))
      .filter(Boolean);

    return res.status(200).json({ collections, purchases });
  } catch (error) {
    console.error("Purchase lookup error:", error);
    return res.status(500).json({ error: "We couldn't open your library just now." });
  }
}
