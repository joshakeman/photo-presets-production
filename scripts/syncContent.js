// scripts/syncContent.js
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { generateProducts } from "./generateProducts.js";
import { createDropboxClient } from "./dropboxClient.js";

const dbx = createDropboxClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DROPBOX_SOURCE_FOLDER = "/josh-and-brad/photo-presets/collections";
const LOCAL_OUTPUT_DIR = path.join(__dirname, "../public/images/collections");
const LOCAL_METADATA_DIR = path.join(__dirname, "../content/collections");
const PNG_TRANSFORM_VERSION = 1;

const revStorePath = path.join(__dirname, "imageRevisions.json");
let revStore = {};

if (fs.existsSync(revStorePath)) {
  revStore = JSON.parse(fs.readFileSync(revStorePath, "utf-8"));
}

function localPathForEntry(entry) {
  const relativePath = entry.path_display.replace(DROPBOX_SOURCE_FOLDER, "");
  const isTextFile = path.extname(entry.name).toLowerCase() === ".txt";

  return isTextFile
    ? path.join(LOCAL_METADATA_DIR, relativePath)
    : path.join(
        LOCAL_OUTPUT_DIR,
        relativePath.replace(/\.[^/.]+$/, ".webp"),
      );
}

function removeStaleFiles(directory, acceptedExtension, expectedPaths) {
  if (!fs.existsSync(directory)) return 0;

  let removed = 0;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      removed += removeStaleFiles(
        entryPath,
        acceptedExtension,
        expectedPaths,
      );

      if (fs.readdirSync(entryPath).length === 0) {
        fs.rmdirSync(entryPath);
      }
    } else if (
      entry.isFile() &&
      path.extname(entry.name).toLowerCase() === acceptedExtension &&
      !expectedPaths.has(path.resolve(entryPath))
    ) {
      fs.unlinkSync(entryPath);
      removed += 1;
      console.log(`🗑️ Removed stale file: ${entryPath}`);
    }
  }

  return removed;
}

async function syncContent() {
  let { result } = await dbx.filesListFolder({
    path: DROPBOX_SOURCE_FOLDER,
    recursive: true,
  });
  const entries = [...result.entries];

  while (result.has_more) {
    ({ result } = await dbx.filesListFolderContinue({ cursor: result.cursor }));
    entries.push(...result.entries);
  }

  if (!fs.existsSync(LOCAL_OUTPUT_DIR)) {
    fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
  }

  const contentEntries = entries.filter(
    (entry) =>
      entry[".tag"] === "file" && /\.(jpe?g|png|txt)$/i.test(entry.name),
  );
  const expectedImagePaths = new Set(
    contentEntries
      .filter((entry) => path.extname(entry.name).toLowerCase() !== ".txt")
      .map((entry) => path.resolve(localPathForEntry(entry))),
  );
  const expectedMetadataPaths = new Set(
    contentEntries
      .filter((entry) => path.extname(entry.name).toLowerCase() === ".txt")
      .map((entry) => path.resolve(localPathForEntry(entry))),
  );
  const currentDropboxPaths = new Set(
    contentEntries.map((entry) => entry.path_lower),
  );

  for (const entry of contentEntries) {
    const dropboxPath = entry.path_lower;
    const rev = entry.rev;
    const sourceExtension = path.extname(entry.name).toLowerCase();
    const isTextFile = sourceExtension === ".txt";
    const revisionKey =
      sourceExtension === ".png"
        ? `${rev}:png-lossless-v${PNG_TRANSFORM_VERSION}`
        : rev;
    const cachedRevision = revStore[dropboxPath];
    const hasCurrentDropboxRevision =
      cachedRevision === rev || cachedRevision?.startsWith(`${rev}:`);
    const localPath = localPathForEntry(entry);

    // Step 3: Skip unchanged files
    if (hasCurrentDropboxRevision && fs.existsSync(localPath)) {
      console.log(`⏩ Skipping unchanged file: ${dropboxPath}`);
      continue;
    }

    // Ensure subfolder exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const { result: fileResult } = await dbx.filesDownload({
      path: entry.path_lower,
    });
    const buffer =
      fileResult.fileBinary ||
      Buffer.from(await fileResult.fileBlob.arrayBuffer());

    if (isTextFile) {
      fs.writeFileSync(localPath, buffer);
    } else {
      const image = sharp(buffer).resize({
        width: 1600,
        withoutEnlargement: true,
      });

      if (sourceExtension === ".png") {
        await image.webp({ lossless: true }).toFile(localPath);
      } else {
        await image.webp({ quality: 80 }).toFile(localPath);
      }
    }

    // ✅ Step 3: Store the new rev after conversion
    revStore[dropboxPath] = revisionKey;
    fs.writeFileSync(revStorePath, JSON.stringify(revStore, null, 2));

    console.log(`✅ ${entry.name} → ${localPath}`);
  }

  const removedImages = removeStaleFiles(
    LOCAL_OUTPUT_DIR,
    ".webp",
    expectedImagePaths,
  );
  const removedMetadata = removeStaleFiles(
    LOCAL_METADATA_DIR,
    ".txt",
    expectedMetadataPaths,
  );

  for (const dropboxPath of Object.keys(revStore)) {
    if (
      dropboxPath.startsWith(`${DROPBOX_SOURCE_FOLDER.toLowerCase()}/`) &&
      !currentDropboxPaths.has(dropboxPath)
    ) {
      delete revStore[dropboxPath];
    }
  }

  console.log(
    `🧹 Removed ${removedImages} stale images and ${removedMetadata} stale metadata files`,
  );

  // ✅ Step 4: Save revStore to file
  fs.writeFileSync(revStorePath, JSON.stringify(revStore, null, 2));
  console.log("💾 Saved revision map");
  const { collectionCount, setCount, presetCount, outputPath } =
    generateProducts();
  console.log(
    `📦 Generated ${collectionCount} collections, ${setCount} sets, and ${presetCount} presets → ${outputPath}`,
  );
  console.log("🎉 Sync complete!");
}

syncContent().catch((err) => {
  console.error("❌ Error syncing content:", err);
});
