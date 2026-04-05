import browser from "webextension-polyfill";
import { initSettings } from "src/settings/settings";
import wikisearch from "src/common/wikisearch";

/**
 * 
 * @description Handles messages sent to the background script
 * @param {Object} data
 * @returns {Promise} --- IGNORE ---
 */
export default async (data) => {
  await initSettings();

  switch (data.message) {
    case "wikipediaSearch": {
      return await wikisearch(data.expression);
    }

    case "openOptionsPage": {
      const hash = data.hash || "";
      const url = browser.runtime.getURL(`options/index.html${hash}`);
      browser.tabs.create({ url, active: true });
      break;
    }
  }
};
