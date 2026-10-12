import browser from "webextension-polyfill";
import log from "loglevel";
import { CONFIG } from "src/common/constans";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { initShortcuts } from "./keyboardShortcuts";
import {
  RESULT_FONT_COLOR_LIGHT,
  RESULT_FONT_COLOR_DARK,
  CANDIDATE_FONT_COLOR_LIGHT,
  CANDIDATE_FONT_COLOR_DARK,
  BG_COLOR_LIGHT,
  BG_COLOR_DARK
} from "src/settings/defaultColors";
const { OPTIONS_PAGE_URL } = CONFIG;
const logDir = "background/onInstalledListener";

const openOptionsPage = (active) => {
  browser.tabs.create({
    url: browser.runtime.getURL(
      `${OPTIONS_PAGE_URL}#/information?action=updated`
    ),
    active: active
  });
};

/**
 * 
 * @description Handles the onInstalled event for the extension
 * @param {Object} details
 * @returns {Promise} --- IGNORE ---
 */
export default async (details) => {
  if (details.reason != "install" && details.reason != "update") return;
  log.info(logDir, "onInstalledListener()", details);

  await initSettings();
  initShortcuts();

  const isShowOptionsPage = getSettings("isShowOptionsPageWhenUpdated");
  if (isShowOptionsPage) openOptionsPage(false);

  // Version 2.8.0以前からのアップデート
  if (
    details.reason == "update" &&
    details.previousVersion.replaceAll(".", "") < 280
  ) {
    //ユーザーが独自の色を設定していた場合、色の置き換えを有効にする
    const isSetUserColor =
      (getSettings("resultFontColor") !== RESULT_FONT_COLOR_LIGHT &&
        getSettings("resultFontColor") !== RESULT_FONT_COLOR_DARK) ||
      (getSettings("candidateFontColor") !== CANDIDATE_FONT_COLOR_LIGHT &&
        getSettings("candidateFontColor") !== CANDIDATE_FONT_COLOR_DARK) ||
      (getSettings("bgColor") !== BG_COLOR_LIGHT &&
        getSettings("bgColor") !== BG_COLOR_DARK);

    if (isSetUserColor) {
      setSettings("isOverrideColors", true);
    }
  }
};
