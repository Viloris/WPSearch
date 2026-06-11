import React from "react";
import log from "loglevel";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import {
    initSettings,
    getSettings,
    addSettingsChangeListener,
    removeSettingsChangeListener
} from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import SearchContainer from "./components/SearchContainer";
import { CONFIG } from "../common/constans";

const { ESC, SHIFT, CTRL, ALT, CMD, INPUT,
    TEXTAREA,
    CODE,
    password,
    requestMessages: {
        GET_TAB_URL,
        GET_SELECTED_TEXT,
        GET_ENABLED,
        ENABLE_EXTENSION,
        DISABLE_EXTENSION,
        WP_SEARCH_SELECTED_TEXT
    }
} = CONFIG;
/* const INPUT = "INPUT";
const TEXTAREA = "TEXTAREA";
const CODE = "CODE";
const password = "password"; */

const DEFAULT_POSITION = { x: 0, y: 0 };

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

const getPageUrl = () => {
    const fallbackUrl = document.referrer || "";
    try {
        return top.location.href;
    } catch (error) {
        log.warn("Unable to read top.location.href, falling back to window.location.href", error);
    }

    try {
        return window.location.href;
    } catch (error) {
        log.warn("Unable to read window.location.href, falling back to document.referrer", error);
    }

    return fallbackUrl;
};

const disableExtensionByUrlList = () => {
    const disableUrls = getSettings("disableUrlList").split("\n");
    const pageUrl = getPageUrl();

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

function isInputElement(element) {
    if (!element || !element.tagName) return false;
    return element.tagName === INPUT || element.tagName === TEXTAREA;
}

const getSelectedText = () => {
    const element = document.activeElement;
    if (!element) return "";

    const isInTextField = isInputElement(element);
    if (isInTextField) {
        const selectionStart = element.selectionStart ?? 0;
        const selectionEnd = element.selectionEnd ?? 0;
        return (element.value || "").substring(selectionStart, selectionEnd);
    }

    return window.getSelection()?.toString() ?? "";
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
    if (!element) return false;
    if (isInputElement(element))
        return true;
    if (element.contentEditable === "true") return true;
    return false;
};

const getSelectedPosition = () => {
    const element = document.activeElement;
    if (!element) return DEFAULT_POSITION;

    const isInTextField = isInputElement(element);
    let selectedRect = { left: 0, top: 0, bottom: 0, width: 0 };

    if (isInTextField) {
        selectedRect = element.getBoundingClientRect();
    } else {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            selectedRect = selection.getRangeAt(0).getBoundingClientRect();
        }
    }

    let selectedPosition;
    const panelReferencePoint = getSettings("panelReferencePoint");
    const centerXOfSelectedText = selectedRect.left + selectedRect.width / 2;
    switch (panelReferencePoint) {
        case "topSelectedText":
            selectedPosition = {
                x: centerXOfSelectedText,
                y: selectedRect.top
            };
            break;
        case "bottomSelectedText":
        default:
            selectedPosition = {
                x: centerXOfSelectedText,
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

const onSettingsChanged = (changes) => {
    // placeholder for content script to react to settings changes if needed
    // settings module already updates the in-memory `currentSettings`
    log.debug("content: settings changed", changes);
};

const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
        removeSettingsChangeListener(onSettingsChanged);
    } else {
        addSettingsChangeListener(onSettingsChanged);
    }
};

const handleMessage = async (request) => {
    const empty = new Promise((resolve) => {
        setTimeout(() => {
            return resolve("");
        }, 100);
    });

    switch (request.message) {
        case GET_TAB_URL:
            if (!isEnabled) return empty;
            if (window === window.parent) return location.href;
            else return empty;
        case GET_SELECTED_TEXT:
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
        case GET_ENABLED:
            return isEnabled;
        case ENABLE_EXTENSION:
            isEnabled = true;
            break;
        case DISABLE_EXTENSION:
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

    const searchContainer = document.querySelector("#simple-wikipedia-search");
    const isInThisElement = searchContainer && searchContainer.contains(e.target);
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
    addSettingsChangeListener(onSettingsChanged);
    browser.runtime.onMessage.addListener(handleMessage);
    overWriteLogLevel();
    updateLogLevel();
    disableExtensionByUrlList();
};
init();
