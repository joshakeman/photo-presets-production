import { getUser } from "@netlify/identity";
import products from "../../../lib/products.generated.json";
import { purchasesForUser } from "../../../lib/purchaseLedger";
import { createDropboxClient } from "../../../scripts/dropboxClient";

const DROPBOX_COLLECTIONS_ROOT = "/josh-and-brad/photo-presets/collections";
const DEV_AUTH_BYPASS_ENABLED =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

async function currentUser() {
  if (DEV_AUTH_BYPASS_ENABLED) {
    return { id: "local-preview-user" };
  }
  return getUser();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const collectionId = Array.isArray(req.query.collection)
    ? req.query.collection[0]
    : req.query.collection;

  if (!collectionId || !products[collectionId]) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  try {
    const user = await currentUser();
    if (!user?.id) {
      res.status(401).json({ error: "Please log in to download this collection." });
      return;
    }

    if (!DEV_AUTH_BYPASS_ENABLED) {
      const purchases = await purchasesForUser(user.id);
      const ownsCollection = purchases.some(
        (purchase) =>
          purchase.status === "paid" &&
          purchase.collectionIds?.includes(collectionId),
      );

      if (!ownsCollection) {
        res.status(403).json({ error: "This collection is not in your library." });
        return;
      }
    }

    const archivePath = `${DROPBOX_COLLECTIONS_ROOT}/${collectionId}/${collectionId}.zip`;
    const dbx = createDropboxClient();
    const { result } = await dbx.filesGetTemporaryLink({ path: archivePath });

    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.redirect(302, result.link);
    return;
  } catch (error) {
    const dropboxSummary = error?.error?.error_summary || "";
    if (dropboxSummary.startsWith("path/not_found")) {
      res.status(404).json({ error: "The collection archive is still being prepared." });
      return;
    }

    console.error("Protected download error:", error);
    res.status(500).json({ error: "We couldn't prepare this download just now." });
  }
}
