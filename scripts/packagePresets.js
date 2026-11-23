import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { fileURLToPath } from "url";
import { createDropboxClient } from "./dropboxClient.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DROPBOX_COLLECTIONS_ROOT = "/josh-and-brad/photo-presets/collections";
const LOCAL_COLLECTIONS_ROOT = path.join(__dirname, "../content/collections");
const OUTPUT_ROOT = path.join(__dirname, "../preset-packages");
const REVISION_STORE_PATH = path.join(__dirname, "presetPackageRevisions.json");
const shouldUpload = process.argv.includes("--apply");

function readRevisionStore() {
  if (!fs.existsSync(REVISION_STORE_PATH)) return {};
  return JSON.parse(fs.readFileSync(REVISION_STORE_PATH, "utf8"));
}

function readCollectionText(collectionId, filename) {
  const filePath = path.join(LOCAL_COLLECTIONS_ROOT, collectionId, filename);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").trim() : "";
}

function displayName(collectionId) {
  return (
    readCollectionText(collectionId, "title.txt") ||
    collectionId
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function packagedFilename(filename) {
  const extension = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, path.extname(filename));
  return `${basename.trim().replace(/\s+/g, " ")}${extension}`;
}

function packageSignature(entries) {
  const source = entries
    .map((entry) => `${entry.path_lower}:${entry.rev}`)
    .sort()
    .join("\n");
  return crypto.createHash("sha256").update(source).digest("hex");
}

function readmeFor(collectionId, presetCount) {
  const title = displayName(collectionId);
  const description = readCollectionText(collectionId, "description.txt");

  return `${title}
${"=".repeat(title.length)}

${description ? `${description}\n\n` : ""}This collection contains ${presetCount} Adobe Lightroom presets in XMP format.

INSTALLATION
For illustrated installation instructions, visit:
https://photo-presets.netlify.app/manual

YOUR LIBRARY
You can return to your account and download this collection again at any time:
https://photo-presets.netlify.app/downloads

USAGE
These presets are licensed to the original purchaser for personal and commercial photographic work. Please do not redistribute or resell the preset files themselves.

Need assistance? Visit https://photo-presets.netlify.app/contact
`;
}

async function listAllEntries(dbx) {
  let { result } = await dbx.filesListFolder({
    path: DROPBOX_COLLECTIONS_ROOT,
    recursive: true,
  });
  const entries = [...result.entries];

  while (result.has_more) {
    ({ result } = await dbx.filesListFolderContinue({ cursor: result.cursor }));
    entries.push(...result.entries);
  }

  return entries;
}

async function downloadBuffer(dbx, dropboxPath) {
  const { result } = await dbx.filesDownload({ path: dropboxPath });
  return result.fileBinary || Buffer.from(await result.fileBlob.arrayBuffer());
}

async function packagePresets() {
  const dbx = createDropboxClient();
  const entries = await listAllEntries(dbx);
  const presetFiles = entries.filter(
    (entry) =>
      entry[".tag"] === "file" &&
      entry.path_lower.includes("/presets/") &&
      entry.name.toLowerCase().endsWith(".xmp"),
  );

  const byCollection = new Map();
  for (const entry of presetFiles) {
    const relativePath = entry.path_display.slice(
      `${DROPBOX_COLLECTIONS_ROOT}/`.length,
    );
    const collectionId = relativePath.split("/")[0];
    if (!byCollection.has(collectionId)) byCollection.set(collectionId, []);
    byCollection.get(collectionId).push(entry);
  }

  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  const revisionStore = readRevisionStore();

  console.log(
    shouldUpload
      ? "Packaging and uploading changed preset collections..."
      : "Packaging preset collections locally. Dropbox will not be changed.",
  );

  for (const [collectionId, collectionEntries] of [...byCollection].sort()) {
    collectionEntries.sort((a, b) => a.name.localeCompare(b.name));
    const signature = packageSignature(collectionEntries);
    const archiveName = `${collectionId}.zip`;
    const localArchivePath = path.join(OUTPUT_ROOT, archiveName);
    const dropboxArchivePath = `${DROPBOX_COLLECTIONS_ROOT}/${collectionId}/${archiveName}`;

    if (
      shouldUpload &&
      revisionStore[collectionId] === signature &&
      entries.some((entry) => entry.path_lower === dropboxArchivePath.toLowerCase())
    ) {
      console.log(`⏩ ${collectionId}: preset files are unchanged`);
      continue;
    }

    const zip = new AdmZip();
    const usedNames = new Set();

    for (const entry of collectionEntries) {
      const filename = packagedFilename(entry.name);
      const normalizedName = filename.toLowerCase();
      if (usedNames.has(normalizedName)) {
        throw new Error(`Duplicate packaged filename in ${collectionId}: ${filename}`);
      }
      usedNames.add(normalizedName);
      zip.addFile(filename, await downloadBuffer(dbx, entry.path_lower));
    }

    zip.addFile(
      "README.txt",
      Buffer.from(readmeFor(collectionId, collectionEntries.length), "utf8"),
    );
    zip.writeZip(localArchivePath);

    const archiveSize = fs.statSync(localArchivePath).size;
    console.log(
      `📦 ${collectionId}: ${collectionEntries.length} presets → ${localArchivePath} (${Math.ceil(archiveSize / 1024)} KB)`,
    );

    if (shouldUpload) {
      await dbx.filesUpload({
        path: dropboxArchivePath,
        contents: fs.readFileSync(localArchivePath),
        mode: { ".tag": "overwrite" },
        autorename: false,
        mute: true,
      });
      revisionStore[collectionId] = signature;
      fs.writeFileSync(
        REVISION_STORE_PATH,
        `${JSON.stringify(revisionStore, null, 2)}\n`,
      );
      console.log(`✅ Uploaded ${dropboxArchivePath}`);
    }
  }

  console.log(
    shouldUpload
      ? "🎉 Preset packages are up to date in Dropbox."
      : "Preview complete. Run `npm run package:presets -- --apply` to upload these archives.",
  );
}

packagePresets().catch((error) => {
  const message = error?.error?.error_summary || error?.message || error;
  console.error("❌ Preset packaging failed:", message);
  process.exitCode = 1;
});
