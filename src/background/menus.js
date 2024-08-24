import browser from "webextension-polyfill";
import log from "loglevel";
import { getSettings } from "src/settings/settings";
import { tabsSendMessage } from "../common/utils";

const logDir = "background/menus";

export const showMenus = () => {
    if (getSettings("ifShowMenu")) {
        removeMenus();
        createMenus();
    } else removeMenus();
};

export const onMenusShownListener = (info, tab) => {
    browser.contextMenus.refresh();
};

export const onMenusClickedListener = (info, tab) => {
    log.log(logDir, "onMenusClickedListener()", info, tab);
    switch (info.menuItemId) {
        case "searchText":
            searchText(tab);
            break;
    }
};

function createMenus() {
    browser.contextMenus.create({
        id: "searchText",
        title: browser.i18n.getMessage("wikipediaSearchTextMenu"),
        contexts: ["selection"]
    });
}

function removeMenus() {
    browser.contextMenus.removeAll();
}

function searchText(tab) {
    tabsSendMessage(tab, "wpSearchSelectedText");
}
