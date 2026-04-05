import React from "react";
import browser from "webextension-polyfill";
import { getSettings } from "../settings/settings";
import WP_LANG from "../settings/wikipedia.json";

/**
 * 
 * @description Splits the input text into lines based on newline characters and returns an array of text and <br> elements for display in the search result summary
 * @param {*} text 
 * @returns {Array} Array of text and <br> elements to split the input text into lines for display in the search result summary
 */
export function splitLine(text) {
    const regex = /(\n)/g;
    if (!text) return;
    return text
        .split(regex)
        .map((line, i) => (line.match(regex) ? React.createElement("br", { key: i }) : line));
}

/**
 * 
 * @description get the first target language from the locale message.json
 * @returns {string} first target language code from the settings, used for determining the main language for Wikipedia search
 */
export function getTargetLang() {
    return getSettings("targetLang");
}

/**
 * 
 * @description get the second target language from the locale message.json
 * @returns {string} second target language code from the settings, or null if not set, used for determining if a second language search should be performed
 */
export function getSecondTargetLang() {
    return getSettings("secondTargetLang");
}

/**
 * 
 * @description get a localized message string from the browser's i18n system based on the provided key, used for displaying messages in the user's language
 * @param {string} key
 * @returns {string} get message from the locale message.json
 */
export function getLocaleMessage(key) {
    return browser.i18n.getMessage(key);
}

/**
 * 
 * @description get the main language code from the locale message.json
 * @returns {string} main language code from the locale message.json based on the target language setting
 */
export function getMainLangText() {
    return getLocaleMessage(`lang_${getTargetLang()}`);
}

/**
 * 
 * @description get the second language code from the locale message.json
 * @returns {string} second language code from the locale message.json based on the second target language setting
 */
export function getSecondLangText() {
    return getLocaleMessage(`lang_${getSecondTargetLang()}`);
}

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
