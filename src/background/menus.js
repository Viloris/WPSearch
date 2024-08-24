import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import log from "loglevel";
import { getSettings } from "src/settings/settings";
import { getTargetLang, tabsSendMessage } from "../common/utils";

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
        case "translateText":
            translateText(tab);
            break;
        /* case "translateLink":
            translateLink(info, tab);
            break; */
    }
};

function createMenus() {
    /*  const isValidContextsTypeTab =
        browserInfo().name === "Firefox" && browserInfo().version >= 53; */
    browser.contextMenus.create({
        id: "translateText",
        title: browser.i18n.getMessage("translateTextMenu"),
        contexts: ["selection"]
    });

    /* browser.contextMenus.create({
        id: "translateLink",
        title: browser.i18n.getMessage("translateLinkMenu"),
        contexts: ["link"]
    }); */
}

function removeMenus() {
    browser.contextMenus.removeAll();
}

function translateText(tab) {
    tabsSendMessage(tab, "translateSelectedText");
}

/* function translateLink(info, tab) {
    const targetLang = getTargetLang();
    const encodedLinkUrl = encodeURIComponent(info.linkUrl);
    const translationUrl = `https://translate.google.com/translate?hl=${targetLang}&tl=${targetLang}&sl=auto&u=${encodedLinkUrl}`;

    browser.tabs.create({
        url: translationUrl,
        active: true,
        index: tab.index + 1
    });
} */
