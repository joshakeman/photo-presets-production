import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createDropboxClient } from "./dropboxClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOCAL_CONTENT_ROOT = path.join(
  __dirname,
  "../dropbox-content/collections",
);
const DROPBOX_CONTENT_ROOT = "/josh-and-brad/photo-presets/collections";
const shouldUpload = process.argv.includes("--apply");

function textFilesIn(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Local content folder not found: ${directory}`);
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return textFilesIn(entryPath);
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".txt")) {
      return [entryPath];
    }

    return [];
  });
}

function dropboxPathFor(localPath) {
  const relativePath = path.relative(LOCAL_CONTENT_ROOT, localPath);
  return `${DROPBOX_CONTENT_ROOT}/${relativePath.split(path.sep).join("/")}`;
}

async function uploadContent() {
  const files = textFilesIn(LOCAL_CONTENT_ROOT).sort();

  console.log(
    shouldUpload
      ? `Uploading ${files.length} text files to Dropbox...`
      : `Previewing ${files.length} text files. Nothing will be uploaded.`,
  );

  if (!shouldUpload) {
    for (const localPath of files) {
      console.log(`• ${dropboxPathFor(localPath)}`);
    }
    console.log("\nRun `npm run upload:content -- --apply` to upload these files.");
    return;
  }

  const dbx = createDropboxClient();

  let uploaded = 0;

  for (const localPath of files) {
    const dropboxPath = dropboxPathFor(localPath);

    await dbx.filesUpload({
      path: dropboxPath,
      contents: fs.readFileSync(localPath),
      mode: { ".tag": "overwrite" },
      autorename: false,
      mute: true,
    });

    uploaded += 1;
    console.log(`✅ ${uploaded}/${files.length} ${dropboxPath}`);
  }

  console.log(`🎉 Uploaded ${uploaded} text files to Dropbox.`);
}

uploadContent().catch((error) => {
  const message = error?.error?.error_summary || error?.message || error;
  console.error("❌ Content upload failed:", message);
  process.exitCode = 1;
});
