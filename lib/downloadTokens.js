import crypto from "crypto";

const LINK_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.DOWNLOAD_LINK_SECRET;
  if (!value) throw new Error("DOWNLOAD_LINK_SECRET is not configured");
  return value;
}

function signature(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createDownloadToken(purchase, collectionId) {
  const payload = Buffer.from(
    JSON.stringify({
      userId: purchase.userId,
      provider: purchase.provider,
      providerPaymentId: purchase.providerPaymentId,
      collectionId,
      exp: Math.floor(Date.now() / 1000) + LINK_LIFETIME_SECONDS,
    }),
  ).toString("base64url");

  return `${payload}.${signature(payload)}`;
}

export function verifyDownloadToken(token, collectionId) {
  if (typeof token !== "string") return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;

  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      claims.collectionId !== collectionId ||
      !claims.userId ||
      !claims.provider ||
      !claims.providerPaymentId ||
      !Number.isFinite(claims.exp) ||
      claims.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}
