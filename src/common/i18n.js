import browser from "webextension-polyfill";
import { getSettings } from "../settings/settings";

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
export function getLocaleMessage(key, substitutions) {
    return browser.i18n.getMessage(key, substitutions);
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

export function getUILanguage() {
    return browser.i18n.getUILanguage();
}
