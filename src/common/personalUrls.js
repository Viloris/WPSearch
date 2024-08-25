import browserInfo from "browser-info";

const browserName = browserInfo().name;
const suffix = browserName === "Chrome" ? "fc" : "";
export const email = `viloris.developer@gmail.com`;
export const paypalLink = `http://example.com for ${browserName} - Donation`;
export const patreonLink = "http://example.com";
export const chromeExtensionUrl = `http://example.come`;
export const firefoxAddonUrl = `https://addons.mozilla.org/hu/firefox/addon/simple-wikipedia-search/`;
