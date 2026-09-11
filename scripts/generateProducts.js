import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_ROOT = path.join(__dirname, "../public/images/collections");
const METADATA_ROOT = path.join(__dirname, "../content/collections");
const OUTPUT_PATH = path.join(__dirname, "../lib/products.generated.json");

function directoriesIn(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

function humanizeFolderName(folderName) {
  return folderName
    .replace(/^\d+[\s_-]*/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[\s_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readText(...pathParts) {
  const filePath = path.join(METADATA_ROOT, ...pathParts);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8").trim();
}

function displayName(pathParts, folderName) {
  return readText(...pathParts, "title.txt") || humanizeFolderName(folderName);
}

function publicImagePath(...pathParts) {
  return `/images/collections/${pathParts.join("/")}`;
}

function findFile(directory, acceptedNames) {
  const accepted = new Set(acceptedNames.map((name) => name.toLowerCase()));
  return filesIn(directory).find((name) => accepted.has(name.toLowerCase()));
}

function automaticHref(collectionFolder) {
  const match = collectionFolder.match(/^(.*?)[_-](\d+)$/);
  if (!match) return collectionFolder.replaceAll("_", "-");
  return `${match[1].replaceAll("_", "-")}/${match[2]}`;
}

function numericText(value) {
  if (!value) return null;
  const number = Number(value.replace(/[$,]/g, "").trim());
  return Number.isFinite(number) ? number : null;
}

export function generateProducts() {
  const products = {};
  let setCount = 0;
  let presetCount = 0;

  for (const collectionFolder of directoriesIn(IMAGE_ROOT)) {
    const collectionImageDir = path.join(IMAGE_ROOT, collectionFolder);
    const assetsDir = path.join(collectionImageDir, "assets");
    const menuImageFile = findFile(assetsDir, [
      "menu-card.webp",
      "menu_card.webp",
    ]);
    const buttonImageFile = findFile(assetsDir, ["button.webp"]);
    const collectionName = displayName([collectionFolder], collectionFolder);
    const sets = [];

    for (const setFolder of directoriesIn(collectionImageDir)) {
      if (setFolder.toLowerCase() === "assets") continue;

      const setImageDir = path.join(collectionImageDir, setFolder);
      const titleCardFile = findFile(setImageDir, [
        "title-card.webp",
        "title_card.webp",
      ]);
      const setName = displayName(
        [collectionFolder, setFolder],
        setFolder,
      );
      const presets = [];

      for (const presetFolder of directoriesIn(setImageDir)) {
        const presetImageDir = path.join(setImageDir, presetFolder);
        const beforeFile = findFile(presetImageDir, ["before.webp"]);
        const afterFile = findFile(presetImageDir, ["after.webp"]);

        if (!beforeFile || !afterFile) continue;

        presets.push({
          title: displayName(
            [collectionFolder, setFolder, presetFolder],
            presetFolder,
          ),
          author: setName,
          before: {
            imageUrl: publicImagePath(
              collectionFolder,
              setFolder,
              presetFolder,
              beforeFile,
            ),
          },
          after: {
            imageUrl: publicImagePath(
              collectionFolder,
              setFolder,
              presetFolder,
              afterFile,
            ),
          },
          quote: readText(
            collectionFolder,
            setFolder,
            presetFolder,
            "quote.txt",
          ),
          quotefrom: readText(
            collectionFolder,
            setFolder,
            presetFolder,
            "source.txt",
          ),
          alt: readText(
            collectionFolder,
            setFolder,
            presetFolder,
            "alt.txt",
          ),
        });
      }

      if (presets.length === 0) continue;

      sets.push({
        title: setName,
        titleCard: titleCardFile
          ? publicImagePath(collectionFolder, setFolder, titleCardFile)
          : null,
        presets,
      });
      setCount += 1;
      presetCount += presets.length;
    }

    products[collectionFolder] = {
      title: collectionName,
      description: readText(collectionFolder, "description.txt"),
      menuImage: menuImageFile
        ? publicImagePath(collectionFolder, "assets", menuImageFile)
        : null,
      menuImageAlt:
        readText(collectionFolder, "menu-image-alt.txt") || collectionName,
      buttonImage: buttonImageFile
        ? publicImagePath(collectionFolder, "assets", buttonImageFile)
        : null,
      href: automaticHref(collectionFolder),
      price: numericText(readText(collectionFolder, "price.txt")),
      sets,
    };
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(products, null, 2)}\n`);

  return {
    collectionCount: Object.keys(products).length,
    setCount,
    presetCount,
    outputPath: OUTPUT_PATH,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const result = generateProducts();
  console.log(
    `Generated ${result.collectionCount} collections, ${result.setCount} sets, and ${result.presetCount} presets → ${result.outputPath}`,
  );
}
