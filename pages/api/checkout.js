import Stripe from "stripe";
import { getUser } from "@netlify/identity";
import products from "../../lib/products.generated.json";

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.URL) return process.env.URL.replace(/\/$/, "");
  const protocol = req.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${req.headers.host}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe is not configured" });
  }

  try {
    const user = await getUser();
    if (!user?.id || !user?.email) {
      return res.status(401).json({ error: "Please log in before checking out" });
    }

    const requestedIds = Array.isArray(req.body?.items) ? req.body.items : [];
    const uniqueIds = [...new Set(requestedIds)];
    const catalog = Object.entries(products).map(([slug, product]) => ({
      slug,
      ...product,
    }));
    const selectedProducts = uniqueIds.map((id) =>
      catalog.find((product) => product.slug === id || product.href === id),
    );

    if (
      selectedProducts.length === 0 ||
      selectedProducts.some((product) => !product || !Number.isFinite(product.price))
    ) {
      return res.status(400).json({ error: "The cart contains an invalid collection" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = siteUrl(req);
    const collectionIds = selectedProducts.map((product) => product.slug);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: selectedProducts.map((product) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            description: product.description,
            metadata: { collection_id: product.slug },
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      })),
      metadata: {
        user_id: user.id,
        checkout_email: user.email,
        collection_ids: collectionIds.join(","),
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "Unable to start checkout" });
  }
}
