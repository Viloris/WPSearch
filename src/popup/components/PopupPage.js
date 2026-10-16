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
  getLocaleMessage,
  getUILanguage
} from "../../common/i18n";
import { fetchWikiFullArticle } from "../../api/wikipediaApi";
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
import MainNavigation from "./MainNavigation";
import FeaturedArticle from "./FeaturedArticle";
import { FullArticleView } from "./fullArticleView";
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
  const [activeView, setActiveView] = useState("home");
  const [favorites, setFavorites] = useState([]);
  const [fullArticles, setFullArticles] = useState({});
  const [fullArticleHistory, setFullArticleHistory] = useState([]);
  const activeFullArticle = fullArticleHistory.at(-1) || null;
  const inputRef = useRef(null);

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
    setActiveView("search");
    setFullArticleHistory([]);
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
    setActiveView("search");
    const currentQuery = inputText.replaceAll("\n", "").trim();
    if (query === currentQuery && results.length > 0 && !isLoadingSearch) {
      return;
    }
    handleInputText(query, true);
  }, [handleInputText, inputText, isLoadingSearch, results.length]);

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
      document.documentElement.classList.add(themeClass.current);
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
        document.documentElement.classList.remove(themeClass.current);
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

  const handleViewChange = useCallback((view) => {
    setActiveView(view);
    if (view === "search") {
      inputRef.current?.focus();
    }
  }, []);

  const handleFavoriteSelect = useCallback((favorite) => {
    setActiveView("search");
    handleInputText(favorite);
  }, [handleInputText]);

  const handleAddFavorite = useCallback((favorite, wikipedia, title) => {
    addFavorite(favorite, setFavorites, wikipedia, title);
  }, []);

  const handleRemoveFavorite = useCallback((favorite) => {
    removeFavorite(favorite, setFavorites);
  }, []);

  const handleLoadFullArticle = useCallback(async (language, title, currentScrollTop = 0) => {
    const key = JSON.stringify([language, title]);
    const url = `https://${language}.wikipedia.org/wiki/${encodeURIComponent(
      title.replace(/ /g, "_")
    )}`;
    setFullArticleHistory((current) => {
      if (current.at(-1)?.key === key) {
        return current;
      }

      const previous = current.map((article, index) =>
        index === current.length - 1
          ? { ...article, scrollTop: currentScrollTop }
          : article
      );
      return [...previous, { key, language, title, scrollTop: 0 }];
    });

    if (fullArticles[key]?.html || fullArticles[key]?.isLoading) {
      return;
    }

    setFullArticles((current) => ({
      ...current,
      [key]: { isLoading: true, url }
    }));

    try {
      const html = await fetchWikiFullArticle(language, title);
      setFullArticles((current) => ({
        ...current,
        [key]: { html, url }
      }));
    } catch (error) {
      log.error(logDir, `Failed to load full article "${title}" (${language})`, error);
      setFullArticles((current) => ({
        ...current,
        [key]: { error: getLocaleMessage("unknownError"), url }
      }));
    }
  }, [fullArticles]);

  const handleBackFullArticle = useCallback(() => {
    setFullArticleHistory((current) => current.length > 1 ? current.slice(0, -1) : current);
  }, []);

  const handleCloseFullArticle = useCallback(() => {
    setFullArticleHistory([]);
  }, []);

  /* -------- render -------- */
  return (
    <div
      className={[
        rtlLanguageClassName,
        activeFullArticle && "popup-page-full-article"
      ].filter(Boolean).join(" ")}
    >
      <Header
        isConnected={tabInfo.isConnected}
        isEnabledOnPage={tabInfo.isEnabledOnPage}
        toggleEnabledOnPage={onToggleEnabledOnPage}
      />
      <InputArea
        inputText={inputText}
        handleInputText={handleInputText}
        inputRef={inputRef}
      />
      <MainNavigation activeView={activeView} onChange={handleViewChange} />
      <FeaturedArticle
        active={activeView === "home"}
        language={targetLang}
        onOpenArticle={handleLoadFullArticle}
      />
      {activeView === "favorites" && (
        <FavoritesPage
          favorites={favorites}
          onSelect={handleFavoriteSelect}
          onRemove={handleRemoveFavorite}
          onAdd={handleAddFavorite}
        />
      )}
      {activeView === "history" && (
        <SearchHistory
          history={searchHistory}
          onSelect={handleHistorySelect}
          onClear={onClearSearchHistory}
          defaultOpen
        />
      )}
      {activeView === "search" && (results.length > 0 || isLoadingSearch) && (
        <>
          <hr />
          <div id="resultArea">
            {isLoadingSearch ? (
              <LoadingCaption />
            ) : (
              <ResultArea
                dismissHint={dismissHint}
                results={results}
                hideInformationLabel={hideInformationLabel}
                addToFavorites={handleAddFavorite}
                loadFullArticle={handleLoadFullArticle}
                fullArticles={fullArticles}
              />
            )}
          </div>
        </>
      )}
      {activeFullArticle && (
        <FullArticleView
          fullArticleState={fullArticles[activeFullArticle.key]}
          language={activeFullArticle.language}
          title={activeFullArticle.title}
          articleKey={activeFullArticle.key}
          scrollTop={activeFullArticle.scrollTop}
          canGoBack={fullArticleHistory.length > 1}
          onBack={handleBackFullArticle}
          onNavigateArticle={handleLoadFullArticle}
          onClose={handleCloseFullArticle}
        />
      )}
    </div>
  );
}
