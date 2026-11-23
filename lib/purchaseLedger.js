import { getStore } from "@netlify/blobs";

const STORE_NAME = "purchases";

function safeSegment(value) {
  return encodeURIComponent(String(value));
}

function userPrefix(userId) {
  return `users/${safeSegment(userId)}/purchases/`;
}

export async function recordPurchase(purchase) {
  if (!purchase.userId || !purchase.provider || !purchase.providerPaymentId) {
    throw new Error("A purchase requires a user, provider, and provider payment ID");
  }

  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const key = `${userPrefix(purchase.userId)}${safeSegment(purchase.provider)}-${safeSegment(purchase.providerPaymentId)}`;
  const record = {
    ...purchase,
    collectionIds: [...new Set(purchase.collectionIds || [])],
    status: "paid",
    recordedAt: new Date().toISOString(),
  };

  await store.setJSON(key, record);
  return record;
}

export async function purchasesForUser(userId) {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const { blobs } = await store.list({ prefix: userPrefix(userId) });
  const records = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
  );

  return records
    .filter((record) => record?.status === "paid")
    .sort((a, b) => String(b.purchasedAt).localeCompare(String(a.purchasedAt)));
}
