import React from "react";
import browser from "webextension-polyfill";
import { getSettings } from "../settings/settings";
import WP_LANG from "../settings/.json";

export function splitLine(text) {
    const regex = /(\n)/g;
    if (!text) return;
    return text
        .split(regex)
        .map((line, i) => (line.match(regex) ? <br key={i} /> : line));
}

export function getTargetLang() {
    return getSettings("targetLang");
}

export function getSecondTargetLang() {
    return getSettings("secondTargetLang");
}

export function getMainLangText() {
    return browser.i18n.getMessage(`lang_${getTargetLang()}`);
}

export function getSecondLangText() {
    return browser.i18n.getMessage(`lang_${getSecondTargetLang()}`);
}

export function tabsSendMessage(tab, message) {
    return browser.tabs.sendMessage(tab.id, {
        message
    });
}

export function getFirstWikipedia() {
    return WP_LANG[getTargetLang()];
}

export function getSecondWikipedia() {
    return WP_LANG[getSecondTargetLang()];
}

export function getWikipediaName(langCode) {
    return WP_LANG[langCode];
}
