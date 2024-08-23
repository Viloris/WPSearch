import browserInfo from "browser-info";

const browserName = browserInfo().name;
const suffix = browserName === "Chrome" ? "fc" : "";
export const email = `example@example.com`;
export const paypalLink = `http://example.com for ${browserName} - Donation`;
export const patreonLink = "http://example.com";
export const chromeExtensionUrl = `http://example.come`;
export const firefoxAddonUrl = `http://example.com`;
