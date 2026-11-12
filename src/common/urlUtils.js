import browser from "webextension-polyfill";
import log from "loglevel";
import WP_LANG from "../settings/wikipedia.json";
import { CONFIG } from "./constans";

const {
    ARTICLE_PATH,
    FACEBOOK_BASE_URL,
    HTTPS,
    TWITTER_BASE_URL,
    WIKIPEDIA_API_URL,
    WIKIPEDIA_DOMAIN,
    requestMessages: {
        GET_TAB_URL,
        GET_SELECTED_TEXT,
        GET_ENABLED
    }
} = CONFIG;

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

export function getWikipediaLanguageCode(wikipediaName) {
    return Object.entries(WP_LANG).find(([, name]) => name === wikipediaName)?.[0] || "";
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

        const tabUrlMessages = [
            GET_TAB_URL,
            GET_SELECTED_TEXT,
            GET_ENABLED
        ];
        const [tabUrl, selectedText, isEnabledOnPage] = await Promise.all(
            tabUrlMessages.map((message) => tabsSendMessage(tab, message))
        );

        return {
            isConnected: true,
            tabUrl,
            selectedText,
            isEnabledOnPage
        };
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

/**
 * 
 * @param {*} language 
 * @returns 
 */
export function buildWikipediaUrl(language) {
    return `${HTTPS}${language}${WIKIPEDIA_DOMAIN}`;
}

/**
 * 
 * @param {*} language 
 * @returns 
 */
export function getWikipediaArticleUrl(language) {
    return `${buildWikipediaUrl(language)}${ARTICLE_PATH}`;
}

/**
 * 
 * @param {*} language 
 * @param {*} params 
 * @returns 
 */
export function buildWikipediaAPIUrl(language, params) {
    return `${HTTPS}${language}${WIKIPEDIA_API_URL}${params}`;
}

export function createTwitterShareLink(tweetText, tweetUrl) {
    return `${TWITTER_BASE_URL}${new URLSearchParams({
        ...(tweetText && { text: tweetText }),
        ...(tweetUrl && { url: tweetUrl })
    })}`;
}

export function createFacebookShareLink(url) {
    return `${FACEBOOK_BASE_URL}${new URLSearchParams({ u: url })}`;
}