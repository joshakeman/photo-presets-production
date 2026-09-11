import { Dropbox } from "dropbox";
import fetch from "node-fetch";

export function createDropboxClient() {
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  const clientId = process.env.DROPBOX_APP_KEY;
  const clientSecret = process.env.DROPBOX_APP_SECRET;

  if (refreshToken && clientId && clientSecret) {
    return new Dropbox({
      refreshToken,
      clientId,
      clientSecret,
      fetch,
    });
  }

  if (process.env.DROPBOX_TOKEN) {
    return new Dropbox({
      accessToken: process.env.DROPBOX_TOKEN,
      fetch,
    });
  }

  throw new Error(
    "Dropbox credentials are missing. Add DROPBOX_REFRESH_TOKEN, DROPBOX_APP_KEY, and DROPBOX_APP_SECRET to .env.",
  );
}
