import browser from "webextension-polyfill";
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