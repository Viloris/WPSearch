import browser from "webextension-polyfill";
import log from "loglevel";
import { getSettings } from "src/settings/settings";
import { getLocaleMessage } from "../common/i18n";
import { tabsSendMessage } from "../common/urlUtils";
import { CONFIG } from "../common/constans";

const { WP_SEARCH_SELECTED_TEXT } = CONFIG;

const logDir = "background/menus";
const SEARCH_TEXT = "searchText";

function createMenus() {
  browser.contextMenus.create({
    id: SEARCH_TEXT,
    title: getLocaleMessage("wikipediaSearchTextMenu"),
    contexts: ["selection"]
  });
}

export const onMenusShownListener = () => {
  browser.contextMenus.refresh();
};

function removeMenus() {
  browser.contextMenus.removeAll();
}

function searchText(tab) {
  tabsSendMessage(tab, WP_SEARCH_SELECTED_TEXT);
}

export const showMenus = () => {
  if (getSettings("ifShowMenu")) {
    removeMenus();
    createMenus();
  } else removeMenus();
};

export const onMenusClickedListener = (info, tab) => {
  log.log(logDir, "onMenusClickedListener()", info, tab);
  switch (info.menuItemId) {
    case SEARCH_TEXT:
      searchText(tab);
      break;
  }
};
