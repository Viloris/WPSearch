import React, { useEffect, useState, useCallback, useRef } from "react";
import browser from "webextension-polyfill";
import log from "loglevel";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import { CONFIG } from "../../common/constans";
import Header from "./Header";
import InputArea from "./InputArea";
import SearchHistory from "./SearchHistory";
import "../styles/PopupPage.scss";
import {
  getLocaleMessage,
  getTargetLang,
  getUILanguage
} from "../../common/i18n";
import "../../components/styles/ResultArea.scss";
import ResultArea from "../../components/ResultArea";
import { getTabInfo, tabsSendMessage } from "../../common/urlUtils";

const {
  requestMessages: { ENABLE_EXTENSION, DISABLE_EXTENSION, WIKIPEDIA_SEARCH }
} = CONFIG;
const logDir = "popup/PopupPage";
const SEARCH_HISTORY_STORAGE_KEY = "SearchHistory";
const SEARCH_HISTORY_LIMIT = 20;
const SEARCH_LOADING_MIN_DURATION = 300;

/* ---------------- utils ---------------- */


const UILanguage = getUILanguage(); //browser.i18n.getUILanguage();
const rtlLanguageClassName = ["he", "ar"].includes(UILanguage)
  ? "popup-page-rtl-language"
  : "";

/* ---------------- component ---------------- */

/**
 *
 * @returns {JSX.Element} Popup page component managing state and handlers for input text, search results,
 * tab information and information label visibility, rendering header,
 * input area and result area components, and initializing settings and theme on mount
 */
export default function PopupPage() {
  const [targetLang, setTargetLang] = useState("");
  const [inputText, setInputText] = useState("");
  const [tabInfo, setTabInfo] = useState({
    isConnected: true,
    tabUrl: "",
    isEnabledOnPage: true
  });
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hideInformationLabel, setHideInformationLabel] = useState(false);

  const inputTimer = useRef(null);
  const loadingTimer = useRef(null);
  const themeClass = useRef(null);
  const searchHistoryRef = useRef([]);
  const historySearchId = useRef(0);
  const historySearchStartedAt = useRef(0);

  /* -------- handlers -------- */

  const recordSearch = useCallback(async (expression) => {
    const query = expression.replaceAll("\n", "").trim();
    if (!query) return;

    const nextHistory = [
      query,
      ...searchHistoryRef.current.filter((entry) => entry !== query)
    ].slice(0, SEARCH_HISTORY_LIMIT);
    searchHistoryRef.current = nextHistory;
    setSearchHistory(nextHistory);

    try {
      await browser.storage.local.set({
        [SEARCH_HISTORY_STORAGE_KEY]: nextHistory
      });
    } catch (error) {
      log.error(logDir, "saving search history failed", error);
    }
  }, []);

  const wpSearchText = useCallback(async (
    expression,
    isHistorySearch = false,
    searchId
  ) => {
    log.info(logDir, "wpSearchText()", expression);

    try {
      await recordSearch(expression);

      const res = await browser.runtime.sendMessage({
        message: WIKIPEDIA_SEARCH,
        expression: expression.replaceAll("\n", "")
      });
      if (historySearchId.current === searchId) {
        setResults(res);
      }
    } finally {
      if (historySearchId.current === searchId && isHistorySearch) {
        const remainingTime = Math.max(
          0,
          SEARCH_LOADING_MIN_DURATION -
          (Date.now() - historySearchStartedAt.current)
        );
        loadingTimer.current = setTimeout(() => {
          if (historySearchId.current === searchId) {
            setIsLoadingSearch(false);
          }
        }, remainingTime);
      } else if (historySearchId.current === searchId) {
        setIsLoadingSearch(false);
      }
    }
  }, [recordSearch]);

  const clearSearchHistory = async () => {
    try {
      await browser.storage.local.set({ [SEARCH_HISTORY_STORAGE_KEY]: [] });
      searchHistoryRef.current = [];
      setSearchHistory([]);
    } catch (error) {
      log.error(logDir, "clearing search history failed", error);
    }
  };

  const toggleEnabledOnPage = async (e) => {
    const isEnabled = e.target.checked;
    setTabInfo((prev) => ({ ...prev, isEnabledOnPage: isEnabled }));

    try {
      const [tab] = await browser.tabs.query({
        currentWindow: true,
        active: true
      });
      await tabsSendMessage(
        tab,
        isEnabled ? ENABLE_EXTENSION : DISABLE_EXTENSION
      );
    } catch (e) {
      log.error(logDir, "toggleEnabledOnPage failed", e);
    }
  };

  const dismissHint = () => {
    setSettings("hidePopupInformationLabel", true);
    setHideInformationLabel(true);
  };

  const handleInputText = useCallback((text, isHistorySearch = false) => {
    setInputText(text);
    clearTimeout(loadingTimer.current);
    clearTimeout(inputTimer.current);

    const searchId = ++historySearchId.current;
    setIsLoadingSearch(true);
    if (isHistorySearch) {
      setResults([]);
      historySearchStartedAt.current = Date.now();
    }
    const search = async () => {
      try {
        await wpSearchText(text, isHistorySearch, searchId);
      } catch (error) {
        log.error(logDir, "wpSearchText failed", error);
      }
    };

    if (isHistorySearch) {
      void search();
    } else {
      const waitTime = getSettings("waitTime");
      inputTimer.current = setTimeout(search, waitTime);
    }
  }, [wpSearchText]);

  const handleHistorySelect = useCallback((query) => {
    handleInputText(query, true);
  }, [handleInputText]);

  /* -------- init -------- */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await initSettings();
      overWriteLogLevel();
      updateLogLevel();

      themeClass.current = `${getSettings("theme")}-theme`;
      document.body.classList.add(themeClass.current);
      document.body.style.width = "348px";

      if (!mounted) return;

      try {
        const stored = await browser.storage.local.get(
          SEARCH_HISTORY_STORAGE_KEY
        );
        const savedHistory = stored[SEARCH_HISTORY_STORAGE_KEY];
        const history = Array.isArray(savedHistory)
          ? savedHistory
            .filter((query) => typeof query === "string" && query.trim())
            .slice(0, SEARCH_HISTORY_LIMIT)
          : [];
        if (!mounted) return;
        searchHistoryRef.current = history;
        setSearchHistory(history);
      } catch (error) {
        log.error(logDir, "loading search history failed", error);
      }

      setTargetLang(getTargetLang());
      setHideInformationLabel(!!getSettings("hidePopupInformationLabel"));

      try {
        const info = await getTabInfo();
        if (!mounted) return;

        setTabInfo({
          isConnected: info.isConnected,
          tabUrl: info.tabUrl,
          isEnabledOnPage: info.isEnabledOnPage
        });

        if (info.selectedText) {
          handleInputText(info.selectedText);
        }
      } catch (err) {
        log.warn(logDir, "getTabInfo failed", err);
      }
    };

    init();

    return () => {
      mounted = false;
      clearTimeout(inputTimer.current);
      clearTimeout(loadingTimer.current);
      if (themeClass.current) {
        document.body.classList.remove(themeClass.current);
      }
    };
  }, [handleInputText]);

  /* -------- render -------- */
  return (
    <div className={rtlLanguageClassName}>
      <Header
        toggleEnabledOnPage={toggleEnabledOnPage}
        isEnabledOnPage={tabInfo.isEnabledOnPage}
        isConnected={tabInfo.isConnected}
      />
      <InputArea inputText={inputText} handleInputText={handleInputText} />
      <SearchHistory
        history={searchHistory}
        onSelect={handleHistorySelect}
        onClear={clearSearchHistory}
      />
      {(results.length > 0 || isLoadingSearch) && (
        <>
          <hr />
          <div id="resultArea">
            {isLoadingSearch ? (
              <p aria-live="polite" className="loadingText">
                {getLocaleMessage("loadingSearchLabel")}
              </p>
            ) : (
              <ResultArea
                inputText={inputText}
                targetLang={targetLang}
                dismissHint={dismissHint}
                hideInformationLabel={hideInformationLabel}
                results={results}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
