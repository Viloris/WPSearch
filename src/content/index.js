import React from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import {
    initSettings,
    getSettings,
    handleSettingsChange
} from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import SearchContainer from "./components/SearchContainer";
import config from "../config.json"

const { ESC, WP_SEARCH_SELECTED_TEXT, SHIFT, CTRL, ALT, CMD } = config;
const INPUT = "INPUT";
const TEXTAREA = "TEXTAREA";
const CODE = "CODE";
const password = "password";

let isEnabled = true;
let prevSelectedText = "";
let searchRoot = null; // React 18 root instance

const removeSearchContainer = () => {
    const element = document.getElementById("simple-wikipedia-search");
    if (!element) return;

    if (searchRoot) {
        searchRoot.unmount();
        searchRoot = null;
    }

    element.remove();
};

const waitTime = (time) => {
    return new Promise((resolve) => setTimeout(() => resolve(), time));
};

const disableExtensionByUrlList = () => {
    const disableUrls = getSettings("disableUrlList").split("\n");
    let pageUrl;
    try {
        pageUrl = top.location.href;
    } catch (e) {
        console.error(e)
        pageUrl = document.referrer;
    }

    const matchesPageUrl = (urlPattern) => {
        const pattern = urlPattern
            .trim()
            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (match) =>
                match === "*" ? ".*" : "\\" + match
            );
        if (pattern === "") return false;
        return RegExp("^" + pattern + "$").test(pageUrl);
    };

    const isMatched = disableUrls.some(matchesPageUrl);
    if (isMatched) isEnabled = false;
};

const getSelectedText = () => {
    const element = document.activeElement;
    const isInTextField =
        element.tagName === INPUT || element.tagName === TEXTAREA;
    const selectedText = isInTextField
        ? element.value.substring(element.selectionStart, element.selectionEnd)
        : window.getSelection()?.toString() ?? "";
    return selectedText;
};

const showSearchContainer = (
    selectedText,
    selectedPosition,
    clickedPosition = null,
    shouldWPSearch = false
) => {
    if (!isEnabled) return;

    const existing = document.getElementById("simple-wikipedia-search");
    if (existing) return;

    const themeClass =
        "simple-wikipedia-search-" + getSettings("theme") + "-theme";

    document.body.insertAdjacentHTML(
        "beforeend",
        `<div id="simple-wikipedia-search" class="${themeClass}"></div>`
    );

    const container = document.getElementById("simple-wikipedia-search");

    searchRoot = createRoot(container);

    searchRoot.render(
        <SearchContainer
            removeContainer={removeSearchContainer}
            selectedText={selectedText}
            selectedPosition={selectedPosition}
            clickedPosition={clickedPosition}
            shouldWPSearch={shouldWPSearch}
        />
    );
};

const isInContentEditable = () => {
    const element = document.activeElement;
    if (element.tagName === INPUT || element.tagName === TEXTAREA)
        return true;
    if (element.contentEditable === "true") return true;
    return false;
};

const getSelectedPosition = () => {
    const element = document.activeElement;
    const isInTextField =
        element.tagName === INPUT || element.tagName === TEXTAREA;
    const selectedRect = isInTextField
        ? element.getBoundingClientRect()
        : window.getSelection().getRangeAt(0).getBoundingClientRect();

    let selectedPosition;
    const panelReferencePoint = getSettings("panelReferencePoint");
    switch (panelReferencePoint) {
        case "topSelectedText":
            selectedPosition = {
                x: selectedRect.left + selectedRect.width / 2,
                y: selectedRect.top
            };
            break;
        case "bottomSelectedText":
        default:
            selectedPosition = {
                x: selectedRect.left + selectedRect.width / 2,
                y: selectedRect.bottom
            };
            break;
    }
    return selectedPosition;
};

const handleKeyDown = (e) => {
    if (e.key === ESC) {
        removeSearchContainer();
    }
};

const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
        browser.storage.local.onChanged.removeListener(handleSettingsChange);
    } else {
        browser.storage.local.onChanged.addListener(handleSettingsChange);
    }
};

const handleMessage = async (request) => {
    const empty = new Promise((resolve) => {
        setTimeout(() => {
            return resolve("");
        }, 100);
    });

    switch (request.message) {
        case "getTabUrl":
            if (!isEnabled) return empty;
            if (window == window.parent) return location.href;
            else return empty;
        case "getSelectedText":
            if (!isEnabled) return empty;
            if (prevSelectedText.length === 0) return empty;
            else return prevSelectedText;
        case WP_SEARCH_SELECTED_TEXT: {
            if (!isEnabled) return empty;
            const selectedText = getSelectedText();
            if (selectedText.length === 0) return;
            const selectedPosition = getSelectedPosition();
            removeSearchContainer();
            showSearchContainer(selectedText, selectedPosition, null, true);
            break;
        }
        case "getEnabled":
            return isEnabled;
        case "enableExtension":
            isEnabled = true;
            break;
        case "disableExtension":
            removeSearchContainer();
            isEnabled = false;
            break;
        default:
            return empty;
    }
};

const handleMouseUp = async (e) => {
    await waitTime(10);

    const isLeftClick = e.button === 0;
    if (!isLeftClick) return;

    const isInPasswordField =
        e.target.tagName === INPUT && e.target.type === password;
    if (isInPasswordField) return;

    const inCodeElement =
        e.target.tagName === CODE ||
        (!!e.target.closest && !!e.target.closest("code"));
    if (inCodeElement && getSettings("isDisabledInCodeElement")) return;

    const isInThisElement =
        document.querySelector("#simple-wikipedia-search") &&
        document.querySelector("#simple-wikipedia-search").contains(e.target);
    if (isInThisElement) return;

    removeSearchContainer();

    const ignoredDocumentLang = getSettings("ignoredDocumentLang")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => !!s);
    if (ignoredDocumentLang.length) {
        const ignoredLangSelector = ignoredDocumentLang
            .map((lang) => `[lang="${lang}"]`)
            .join(",");
        if (!!e.target.closest && !!e.target.closest(ignoredLangSelector))
            return;
    }

    const selectedText = getSelectedText();
    prevSelectedText = selectedText;
    if (selectedText.length === 0) return;

    if (getSettings("isDisabledInTextFields")) {
        if (isInContentEditable()) return;
    }

    if (getSettings("ifOnlySearchWhenModifierKeyPressed")) {
        const modifierKey = getSettings("modifierKey");
        switch (modifierKey) {
            case SHIFT:
                if (!e.shiftKey) return;
                break;
            case ALT:
                if (!e.altKey) return;
                break;
            case CTRL:
                if (!e.ctrlKey) return;
                break;
            case CMD:
                if (!e.metaKey) return;
                break;
            default:
                break;
        }
    }

    const clickedPosition = { x: e.clientX, y: e.clientY };
    const selectedPosition = getSelectedPosition();
    showSearchContainer(selectedText, selectedPosition, clickedPosition);
};

const init = async () => {
    await initSettings();
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    browser.storage.local.onChanged.addListener(handleSettingsChange);
    browser.runtime.onMessage.addListener(handleMessage);
    overWriteLogLevel();
    updateLogLevel();
    disableExtensionByUrlList();
};
init();
