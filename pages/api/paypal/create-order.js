import { getUser } from "@netlify/identity";
import products from "../../../lib/products.generated.json";
import { paypalRequest } from "../../../lib/paypal";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await getUser();
    if (!user?.id || !user?.email) {
      return res.status(401).json({ error: "Please log in before checking out" });
    }

    const requestedIds = [...new Set(Array.isArray(req.body?.items) ? req.body.items : [])];
    const catalog = Object.entries(products).map(([id, product]) => ({ id, ...product }));
    const selected = requestedIds.map((requestedId) =>
      catalog.find((product) => product.id === requestedId || product.href === requestedId),
    );

    if (!selected.length || selected.some((product) => !product || !Number.isFinite(product.price))) {
      return res.status(400).json({ error: "The portmanteau contains an invalid collection" });
    }

    const total = selected.reduce((sum, product) => sum + product.price, 0).toFixed(2);
    const order = await paypalRequest("/v2/checkout/orders", {
      method: "POST",
      headers: { "PayPal-Request-Id": `create-${user.id}-${Date.now()}` },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: user.id,
            description: "Photo Presets digital collections",
            amount: {
              currency_code: "USD",
              value: total,
              breakdown: { item_total: { currency_code: "USD", value: total } },
            },
            items: selected.map((product) => ({
              name: product.title,
              sku: product.id,
              quantity: "1",
              category: "DIGITAL_GOODS",
              unit_amount: { currency_code: "USD", value: product.price.toFixed(2) },
            })),
          },
        ],
      }),
    });

    return res.status(200).json({ id: order.id });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return res.status(500).json({ error: "Unable to start PayPal checkout" });
  }
}
