import React, { useEffect, useState, useCallback, useRef } from "react";
import log from "loglevel";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import Header from "./Header";
import InputArea from "./InputArea";
import SearchHistory from "./SearchHistory";
import "../styles/PopupPage.scss";
import {
  getTargetLang,
  getUILanguage
} from "../../common/i18n";
import "../../components/styles/ResultArea.scss";
import ResultArea from "../../components/ResultArea";
import { getTabInfo } from "../../common/urlUtils";
import { LoadingCaption } from "./LoadingCaption";
import { handleToggleEnabledOnPage } from "../handleToggleEnabledOnPage";
import { clearSearchHistory, getSearchHistory } from "../handleSearchHistory";
import { getFavorites, addFavorite, removeFavorite } from "../handleFavorites";
import { useWpSearch } from "../useWpSearch";
import { useDebouncedValue } from "../useDebouncedValue";
import FavoritesPage from "./FavoritesPage";
const logDir = "popup/PopupPage";

const clearTimerRef = (timerRef) => {
  clearTimeout(timerRef.current);
  timerRef.current = null;
};


/* ---------------- utils ---------------- */


const UILanguage = getUILanguage();
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
  const [searchRequest, setSearchRequest] = useState(null);
  const [openFavorite, setOpenFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const loadingTimer = useRef(null);
  const themeClass = useRef(null);
  const searchHistoryRef = useRef([]);
  const historySearchId = useRef(0);
  const historySearchStartedAt = useRef(0);
  const wpSearchText = useWpSearch({
    searchHistoryRef,
    setSearchHistory,
    historySearchId,
    historySearchStartedAt,
    loadingTimer,
    setIsLoadingSearch,
    setResults
  });
  const debouncedSearchRequest = useDebouncedValue(
    searchRequest,
    searchRequest?.delay ?? 0
  );

  /* -------- handlers -------- */

  const dismissHint = () => {
    setSettings("hidePopupInformationLabel", true);
    setHideInformationLabel(true);
  };

  const handleInputText = useCallback((text, isHistorySearch = false) => {
    setInputText(text);
    clearTimeout(loadingTimer.current);

    const searchId = ++historySearchId.current;
    setIsLoadingSearch(true);
    if (isHistorySearch) {
      setResults([]);
      historySearchStartedAt.current = Date.now();
    }
    setSearchRequest({
      text,
      isHistorySearch,
      searchId,
      delay: isHistorySearch ? 0 : getSettings("waitTime")
    });
  }, []);

  const handleHistorySelect = useCallback((query) => {
    handleInputText(query, true);
  }, [handleInputText]);

  useEffect(() => {
    if (!debouncedSearchRequest) return;

    const { text, isHistorySearch, searchId } = debouncedSearchRequest;
    const search = async () => {
      try {
        await wpSearchText(text, isHistorySearch, searchId);
      } catch (error) {
        log.error(logDir, "wpSearchText failed", error);
      }
    };

    void search();
  }, [debouncedSearchRequest, wpSearchText]);

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

      await getSearchHistory(() => mounted, searchHistoryRef, setSearchHistory);
      await getFavorites(() => mounted, setFavorites);

      setTargetLang(getTargetLang());
      setHideInformationLabel(!!getSettings("hidePopupInformationLabel"));

      try {
        const { isConnected, tabUrl, isEnabledOnPage, selectedText } = await getTabInfo();
        if (!mounted) return;

        setTabInfo({
          isConnected: isConnected,
          tabUrl: tabUrl,
          isEnabledOnPage: isEnabledOnPage
        });

        if (selectedText) {
          handleInputText(selectedText);
        }
      } catch (err) {
        log.warn(logDir, "getTabInfo failed", err);
      }
    };

    init();

    return () => {
      mounted = false;
      clearTimerRef(loadingTimer);
      if (themeClass.current) {
        document.body.classList.remove(themeClass.current);
      }
    };
  }, [handleInputText]);

  const onToggleEnabledOnPage = useCallback((event) => {
    handleToggleEnabledOnPage(event, setTabInfo);
  }, [setTabInfo]);

  const onClearSearchHistory = useCallback(() => {
    clearSearchHistory(searchHistoryRef, setSearchHistory);
  }, []);

  const toggleFavoritePage = useCallback(() => {
    setOpenFavorite((prev) => !prev);
  }, []);

  const handleFavoriteSelect = useCallback((favorite) => {
    setOpenFavorite(false);
    handleInputText(favorite);
  }, [handleInputText]);

  const handleAddFavorite = useCallback((favorite, wikipedia, title) => {
    addFavorite(favorite, setFavorites, wikipedia, title);
  }, []);

  const handleRemoveFavorite = useCallback((favorite) => {
    removeFavorite(favorite, setFavorites);
  }, []);

  /* -------- render -------- */
  return (
    <div className={rtlLanguageClassName}>
      <Header
        isConnected={tabInfo.isConnected}
        isEnabledOnPage={tabInfo.isEnabledOnPage}
        toggleEnabledOnPage={onToggleEnabledOnPage}
        toggleFavoritePage={toggleFavoritePage}
        isFavoritePageOpen={openFavorite}
      />
      <InputArea inputText={inputText} handleInputText={handleInputText} />
      {openFavorite && (
        <FavoritesPage
          favorites={favorites}
          onSelect={handleFavoriteSelect}
          onRemove={handleRemoveFavorite}
          onAdd={handleAddFavorite}
        />
      )}
      <SearchHistory
        history={searchHistory}
        onSelect={handleHistorySelect}
        onClear={onClearSearchHistory}
      />
      {(results.length > 0 || isLoadingSearch) && (
        <>
          <hr />
          <div id="resultArea">
            {isLoadingSearch ? (
              <LoadingCaption />
            ) : (
              <ResultArea
                inputText={inputText}
                targetLang={targetLang}
                dismissHint={dismissHint}
                hideInformationLabel={hideInformationLabel}
                results={results}
                addToFavorites={handleAddFavorite}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
