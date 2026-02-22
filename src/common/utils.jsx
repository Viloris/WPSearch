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
 * @returns {string}
 */
export function getTargetLang() {
    return getSettings("targetLang");
}

/**
 * 
 * @returns {string}
 */
export function getSecondTargetLang() {
    return getSettings("secondTargetLang");
}

/**
 * 
 * @returns {string}
 */
export function getMainLangText() {
    return browser.i18n.getMessage(`lang_${getTargetLang()}`);
}

/**
 * 
 * @returns {string}
 */
export function getSecondLangText() {
    return browser.i18n.getMessage(`lang_${getSecondTargetLang()}`);
}

export function tabsSendMessage(tab, message) {
    return browser.tabs.sendMessage(tab.id, { message });
}

/**
 * 
 * @param {string} langCode
 * @returns {string}
 */
export function getWikipediaName(langCode) {
    return WP_LANG[langCode];
}