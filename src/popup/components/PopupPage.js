import React, { useEffect, useState, useCallback, useRef } from "react";
import log from "loglevel";
import browser from "webextension-polyfill";
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
import { getTabInfo, getWikipediaArticleUrl, getWikipediaName } from "../../common/urlUtils";
import { LoadingCaption } from "./LoadingCaption";
import { handleToggleEnabledOnPage } from "../handleToggleEnabledOnPage";
import { clearSearchHistory, getSearchHistory } from "../handleSearchHistory";
import { getFavorites, addFavorite, removeFavorite } from "../../common/favorites";
import { useWpSearch } from "../useWpSearch";
import { useDebouncedValue } from "../useDebouncedValue";
import FavoritesPage from "./FavoritesPage";
import MainNavigation from "./MainNavigation";
import FeaturedArticle from "./FeaturedArticle";
import { FullArticleView } from "./fullArticleView";
import SearchIcon from "../icons/search-solar.svg";
import { CONFIG } from "../../common/constans";
import { extractTextFromHtml } from "../../common/htmlUtils";
const logDir = "popup/PopupPage";
const { navigationMenu: { HOME, SEARCH, FAVORITES, HISTORY }, POPUP_REQUEST_STORAGE_KEY } = CONFIG;

const clearTimerRef = (timerRef) => {
  clearTimeout(timerRef.current);
  timerRef.current = null;
};

/* ---------------- utils ---------------- */


const UILanguage = getUILanguage();
const rtlLanguageClassName = ["he", "ar"].includes(UILanguage)
  ? "popup-page-rtl-language"
  : "";
const popupWidth = "348px";

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
  const [activeView, setActiveView] = useState(HOME);
  const [favorites, setFavorites] = useState([]);
  const [fullArticles, setFullArticles] = useState({});
  const fullArticlesRef = useRef({});
  const [fullArticleHistory, setFullArticleHistory] = useState([]);
  const activeFullArticle = fullArticleHistory.at(-1) || null;
  const activeFullArticleState = activeFullArticle
    ? fullArticles[activeFullArticle.key]
    : null;
  const isFullArticleOpen = Boolean(activeFullArticle);
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

  useEffect(() => {
    if (!isFullArticleOpen) return undefined;

    document.body.classList.add("popup-page-full-article");
    return () => document.body.classList.remove("popup-page-full-article");
  }, [isFullArticleOpen]);

  /* -------- handlers -------- */

  const dismissHint = () => {
    setSettings("hidePopupInformationLabel", true);
    setHideInformationLabel(true);
  };

  const handleInputText = useCallback((text, isHistorySearch = false) => {
    setInputText(text);
    setResults([]);
    setActiveView(SEARCH);
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
    setActiveView(SEARCH);
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

  const onToggleEnabledOnPage = useCallback((event) => {
    handleToggleEnabledOnPage(event, setTabInfo);
  }, [setTabInfo]);

  const onClearSearchHistory = useCallback(() => {
    clearSearchHistory(searchHistoryRef, setSearchHistory);
  }, []);

  const handleViewChange = useCallback((view) => {
    setActiveView(view);
    if (view === SEARCH) {
      inputRef.current?.focus();
    }
    /*     if (view === "favorites") {
          getFavorites(() => true, setFavorites);
        } */
  }, []);

  const handleFavoriteSelect = useCallback((favorite) => {
    setActiveView(SEARCH);
    handleInputText(favorite);
  }, [handleInputText]);

  const handleAddFavorite = useCallback((favorite, wikipedia, title, url) => {
    addFavorite(favorite, setFavorites, wikipedia, title, url);
  }, []);

  const handleRemoveFavorite = useCallback((favorite) => {
    removeFavorite(favorite, setFavorites);
  }, []);

  const handleLoadFullArticle = useCallback(async (language, title, currentScrollTop = 0) => {
    const key = JSON.stringify([language, title]);
    // ${HTTPS}${language}${WIKIPEDIA_DOMAIN}${ARTICLE_PATH}
    const url = `${getWikipediaArticleUrl(language)}${encodeURIComponent(
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

    if (fullArticlesRef.current[key]?.html || fullArticlesRef.current[key]?.isLoading) {
      return;
    }

    const loadingState = { isLoading: true, url };
    fullArticlesRef.current = {
      ...fullArticlesRef.current,
      [key]: loadingState
    };
    setFullArticles((current) => ({
      ...current,
      [key]: loadingState
    }));

    try {
      const html = await fetchWikiFullArticle(language, title);
      const articleState = { html, url };
      fullArticlesRef.current = {
        ...fullArticlesRef.current,
        [key]: articleState
      };
      setFullArticles((current) => ({
        ...current,
        [key]: articleState
      }));
    } catch (error) {
      log.error(logDir, `Failed to load full article "${title}" (${language})`, error);
      const articleState = { error: getLocaleMessage("unknownError"), url };
      fullArticlesRef.current = {
        ...fullArticlesRef.current,
        [key]: articleState
      };
      setFullArticles((current) => ({
        ...current,
        [key]: articleState
      }));
    }
  }, []);

  const handleBackFullArticle = useCallback(() => {
    setFullArticleHistory((current) => current.length > 1 ? current.slice(0, -1) : current);
  }, []);

  const handleCloseFullArticle = useCallback(() => {
    setFullArticleHistory([]);
  }, []);

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
      document.body.style.width = popupWidth;

      if (!mounted) return;

      await getSearchHistory(() => mounted, searchHistoryRef, setSearchHistory);
      await getFavorites(() => mounted, setFavorites);

      setTargetLang(getTargetLang());
      setHideInformationLabel(!!getSettings("hidePopupInformationLabel"));

      try {
        const stored = await browser.storage.local.get(POPUP_REQUEST_STORAGE_KEY);
        const popupRequest = stored[POPUP_REQUEST_STORAGE_KEY];
        if (popupRequest) {
          await browser.storage.local.remove(POPUP_REQUEST_STORAGE_KEY);
        }

        if (popupRequest?.expression) {
          handleInputText(popupRequest.expression);
        }
        if (popupRequest?.language && popupRequest?.title) {
          void handleLoadFullArticle(popupRequest.language, popupRequest.title);
        }

        const { isConnected, tabUrl, isEnabledOnPage, selectedText } = await getTabInfo();
        if (!mounted) return;

        setTabInfo({
          isConnected: isConnected,
          tabUrl: tabUrl,
          isEnabledOnPage: isEnabledOnPage
        });

        if (!popupRequest?.expression && selectedText) {
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
  }, [handleInputText, handleLoadFullArticle]);

  /* -------- render -------- */
  return (
    <div
      className={[
        rtlLanguageClassName,
        isFullArticleOpen && "popup-page-full-article"
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
      {!activeFullArticle && searchHistory.length > 0 && <div
        style={{ display: "flex", justifyContent: "flex-start", alignitems: "center", margin: "5px 10px 15px 10px", fontSize: "0.9em" }}
      >
        {getLocaleMessage("recentSearchTerms")}:&nbsp;&nbsp;
        {searchHistory.slice(0, 3).map((term, index) => (
          <span key={term}>
            {index > 0 && <span style={{ margin: "0 0.5em" }} aria-hidden="true">•</span>}
            <a
              onClick={() => handleHistorySelect(term)}
              type="button"
              style={{ cursor: "pointer", color: "#5276b4" }}
            >
              {term}
            </a>
          </span>
        ))}
      </div>}
      <MainNavigation activeView={activeView} onChange={handleViewChange} />
      <FeaturedArticle
        active={activeView === HOME}
        addToFavorites={handleAddFavorite}
        favorites={favorites}
        fullArticles={fullArticles}
        key={targetLang}
        language={targetLang}
        onOpenArticle={handleLoadFullArticle}
        removeFromFavorites={handleRemoveFavorite}
      />
      {activeView === FAVORITES && (
        <FavoritesPage
          favorites={favorites}
          onSelect={handleFavoriteSelect}
          onRemove={handleRemoveFavorite}
          onAdd={handleAddFavorite}
          language={targetLang}
          loadFullArticle={handleLoadFullArticle}
        />
      )}
      {activeView === HISTORY && (
        <SearchHistory
          history={searchHistory}
          onSelect={handleHistorySelect}
          onClear={onClearSearchHistory}
          defaultOpen
        />
      )}
      {activeView === SEARCH && (
        inputText.trim() === "" ? (
          <div className="search-empty">
            <span className="empty-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <h3>{getLocaleMessage("searchLabel")}</h3>
            <p>{getLocaleMessage("searchEmptyMessage")}</p>
          </div>
        ) :

          (results.length > 0 || isLoadingSearch) && (
            <>
              <hr />
              <div
                id="resultArea"
                className={isLoadingSearch && results.length > 0 ? "isRefreshing" : ""}
                aria-busy={isLoadingSearch}
              >
                {results.length > 0 && (
                  <ResultArea
                    dismissHint={dismissHint}
                    results={results}
                    hideInformationLabel={hideInformationLabel}
                    addToFavorites={handleAddFavorite}
                    removeFromFavorites={handleRemoveFavorite}
                    favorites={favorites}
                    loadFullArticle={handleLoadFullArticle}
                    fullArticles={fullArticles}
                  />
                )}
                {isLoadingSearch && <LoadingCaption />}
              </div>
            </>
          ))}
      {activeFullArticle && (
        <FullArticleView
          fullArticleState={activeFullArticleState}
          language={activeFullArticle.language}
          title={activeFullArticle.title}
          articleKey={activeFullArticle.key}
          scrollTop={activeFullArticle.scrollTop}
          canGoBack={fullArticleHistory.length > 1}
          onBack={handleBackFullArticle}
          onNavigateArticle={handleLoadFullArticle}
          onClose={handleCloseFullArticle}
          isSaved={favorites}
          addToFavorites={handleAddFavorite}
          removeFromFavorites={handleRemoveFavorite}
          wikipedia={getWikipediaName(activeFullArticle.language)}
          favorites={favorites}
          text={activeFullArticleState?.html
            ? extractTextFromHtml(activeFullArticleState.html, activeFullArticle.language.toLowerCase())
            : ""}
        />
      )}
    </div>
  );
}
