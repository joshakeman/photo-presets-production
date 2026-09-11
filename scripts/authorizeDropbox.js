import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.join(__dirname, "../.env");

function readSecret(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      reject(new Error("This command must be run in an interactive terminal."));
      return;
    }

    let value = "";
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    function finish() {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
      process.stdout.write("\n");
    }

    function onData(character) {
      if (character === "\u0003") {
        finish();
        reject(new Error("Authorization cancelled."));
      } else if (character === "\r" || character === "\n") {
        finish();
        resolve(value.trim());
      } else if (character === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += character;
      }
    }

    process.stdin.on("data", onData);
  });
}

function saveRefreshToken(refreshToken) {
  const currentEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const line = `DROPBOX_REFRESH_TOKEN=${refreshToken}`;
  const updatedEnv = /^DROPBOX_REFRESH_TOKEN=.*$/m.test(currentEnv)
    ? currentEnv.replace(/^DROPBOX_REFRESH_TOKEN=.*$/m, line)
    : `${currentEnv.trimEnd()}\n${line}\n`;

  fs.writeFileSync(envPath, updatedEnv);
}

async function authorizeDropbox() {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;

  if (!appKey || !appSecret) {
    throw new Error("DROPBOX_APP_KEY and DROPBOX_APP_SECRET must be set in .env.");
  }

  const code = await readSecret("Paste the Dropbox authorization code: ");

  if (!code) {
    throw new Error("No authorization code was entered.");
  }

  const credentials = Buffer.from(`${appKey}:${appSecret}`).toString("base64");
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
    }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error_description || result.error || response.statusText);
  }

  if (!result.refresh_token) {
    throw new Error(
      "Dropbox did not return a refresh token. Generate a new code using token_access_type=offline.",
    );
  }

  saveRefreshToken(result.refresh_token);
  console.log("✅ Dropbox refresh token saved to .env.");
}

authorizeDropbox().catch((error) => {
  console.error("❌ Dropbox authorization failed:", error.message);
  process.exitCode = 1;
});
