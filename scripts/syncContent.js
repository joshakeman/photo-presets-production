// scripts/syncContent.js
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { Dropbox } from "dropbox";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN, fetch });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DROPBOX_SOURCE_FOLDER = "/josh-and-brad/photo-presets/collections";
const LOCAL_OUTPUT_DIR = path.join(__dirname, "../public/images/collections");
const PNG_TRANSFORM_VERSION = 1;

const revStorePath = path.join(__dirname, "imageRevisions.json");
let revStore = {};

if (fs.existsSync(revStorePath)) {
  revStore = JSON.parse(fs.readFileSync(revStorePath, "utf-8"));
}

async function syncContent() {
  const { result } = await dbx.filesListFolder({
    path: DROPBOX_SOURCE_FOLDER,
    recursive: true,
  });

  if (!fs.existsSync(LOCAL_OUTPUT_DIR)) {
    fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
  }

  const imageEntries = result.entries.filter(
    (entry) => entry[".tag"] === "file" && /\.(jpe?g|png)$/i.test(entry.name),
  );

  for (const entry of imageEntries) {
    const dropboxPath = entry.path_lower;
    const rev = entry.rev;
    const sourceExtension = path.extname(entry.name).toLowerCase();
    const revisionKey =
      sourceExtension === ".png"
        ? `${rev}:png-lossless-v${PNG_TRANSFORM_VERSION}`
        : rev;

    // Step 3: Skip unchanged files
    if (revStore[dropboxPath] === revisionKey) {
      console.log(`⏩ Skipping unchanged file: ${dropboxPath}`);
      continue;
    }

    const relativePath = entry.path_display.replace(DROPBOX_SOURCE_FOLDER, "");
    const localPath = path.join(
      LOCAL_OUTPUT_DIR,
      relativePath.replace(/\.[^/.]+$/, ".webp"), // convert extension
    );

    // Ensure subfolder exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const { result: fileResult } = await dbx.filesDownload({
      path: entry.path_lower,
    });
    const buffer =
      fileResult.fileBinary ||
      Buffer.from(await fileResult.fileBlob.arrayBuffer());

    const image = sharp(buffer).resize({
      width: 1600,
      withoutEnlargement: true,
    });

    if (sourceExtension === ".png") {
      await image.webp({ lossless: true }).toFile(localPath);
    } else {
      await image.webp({ quality: 80 }).toFile(localPath);
    }

    // ✅ Step 3: Store the new rev after conversion
    revStore[dropboxPath] = revisionKey;
    fs.writeFileSync(revStorePath, JSON.stringify(revStore, null, 2));

    console.log(`✅ ${entry.name} → ${localPath}`);
  }

  // ✅ Step 4: Save revStore to file
  fs.writeFileSync(revStorePath, JSON.stringify(revStore, null, 2));
  console.log("💾 Saved revision map");
  console.log("🎉 Sync complete!");
}

syncContent().catch((err) => {
  console.error("❌ Error syncing content:", err);
});
