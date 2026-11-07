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
  requestMessages: { WIKIPEDIA_SEARCH, OPEN_OPTIONS_PAGE, OPEN_POPUP_PAGE },
  OPTIONS_PAGE_URL,
  POPUP_REQUEST_STORAGE_KEY
} = CONFIG;

export default async (data) => {
  await initSettings();

  switch (data.message) {
    case WIKIPEDIA_SEARCH: {
      return await wikisearch(data.expression, data.offset, data.limit, data.language);
    }

    case OPEN_OPTIONS_PAGE: {
      const hash = data.hash || "";
      const url = browser.runtime.getURL(`${OPTIONS_PAGE_URL}${hash}`);
      browser.tabs.create({ url, active: true });
      break;
    }

    case OPEN_POPUP_PAGE: {
      if (typeof browser.action?.openPopup !== "function") {
        throw new Error("Opening the extension popup programmatically is not supported");
      }

      await browser.storage.local.set({
        [POPUP_REQUEST_STORAGE_KEY]: {
          expression: data.expression,
          language: data.language,
          title: data.title
        }
      });

      try {
        await browser.action.openPopup();
      } catch (error) {
        await browser.storage.local.remove(POPUP_REQUEST_STORAGE_KEY);
        throw error;
      }
      break;
    }
  }
};
