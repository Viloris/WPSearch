import browser from "webextension-polyfill";
import { initSettings } from "../settings/settings";
import wikisearch from "../common/wikisearch";
import { CONFIG } from "../common/constans";

/**
 * 
 * @description Handles messages sent to the background script
 * @param {Object} data
 * @returns {Promise} --- IGNORE ---
 */
const {
  requestMessages: { WIKIPEDIA_SEARCH, OPEN_OPTIONS_PAGE },
  OPTIONS_PAGE_URL
} = CONFIG;

export default async (data) => {
  await initSettings();

  switch (data.message) {
    case WIKIPEDIA_SEARCH: {
      return await wikisearch(data.expression);
    }

    case OPEN_OPTIONS_PAGE: {
      const hash = data.hash || "";
      const url = browser.runtime.getURL(`${OPTIONS_PAGE_URL}${hash}`);
      browser.tabs.create({ url, active: true });
      break;
    }
  }
};
