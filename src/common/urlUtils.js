import browser from "webextension-polyfill";
import log from "loglevel";
import WP_LANG from "../settings/wikipedia.json";

/**
 * 
 * @description Sends a message to the specified browser tab and returns the response, used for communication between background and content scripts
 * @param {*} tab 
 * @param {string} message 
 * @returns {string} Sends a message to the specified browser tab and returns the response, used for communication between background and content scripts
 */
export function tabsSendMessage(tab, message) {
    return browser.tabs.sendMessage(tab.id, { message });
}

/**
 * 
 * @description get the wikipedia name based on language
 * @param {string} langCode
 * @returns {string} Wikipedia name for the given language code from the wikipedia.json settings file
 */
export function getWikipediaName(langCode) {
    return WP_LANG[langCode];
}

/**
 *
 * @returns {Object<{ isConnected: true, url, selectedText, isEnabledOnPage }>} Tab information including connection status, url,
 * selected text and enabled status on page,  or default values if error occurs
 */
export const getTabInfo = async () => {
    try {
        const [tab] = await browser.tabs.query({
            currentWindow: true,
            active: true
        });

        const [url, selectedText, isEnabledOnPage] = await Promise.all([
            tabsSendMessage(tab, "getTabUrl"),
            tabsSendMessage(tab, "getSelectedText"),
            tabsSendMessage(tab, "getEnabled")
        ]);

        return { isConnected: true, url, selectedText, isEnabledOnPage };
    } catch (e) {
        log.error("urlUtils.getTabInfo failed", e);
        return {
            isConnected: false,
            tabUrl: "",
            selectedText: "",
            isEnabledOnPage: false
        };
    }
};