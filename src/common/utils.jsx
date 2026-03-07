import React from "react";
import browser from "webextension-polyfill";
import { getSettings } from "../settings/settings";
import WP_LANG from "../settings/wikipedia.json";

/**
 * 
 * @param {*} text 
 * @returns {Array}
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
 * @returns {string}
 */
export function getTargetLang() {
    return getSettings("targetLang");
}

/**
 * 
 * @description get the second target language from the locale message.json
 * @returns {string}
 */
export function getSecondTargetLang() {
    return getSettings("secondTargetLang");
}

/**
 * 
 * @param {string} key
 * @returns {string} get message from the locale message.json
 */
export function getLocaleMessage(key) {
    return browser.i18n.getMessage(key);
}

/**
 * 
 * @description get the main language code from the locale message.json
 * @returns {string}
 */
export function getMainLangText() {
    return getLocaleMessage(`lang_${getTargetLang()}`);
}

/**
 * 
 * @description get the second language code from the locale message.json
 * @returns {string}
 */
export function getSecondLangText() {
    return getLocaleMessage(`lang_${getSecondTargetLang()}`);
}

/**
 * 
 * @param {*} tab 
 * @param {string} message 
 * @returns {string}
 */
export function tabsSendMessage(tab, message) {
    return browser.tabs.sendMessage(tab.id, { message });
}

/**
 * 
 * @description get the wikipedia name based on language
 * @param {string} langCode
 * @returns {string}
 */
export function getWikipediaName(langCode) {
    return WP_LANG[langCode];
}
