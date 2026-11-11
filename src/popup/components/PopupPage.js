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
import NextResults from "./NextResults";
import SearchIcon from "../icons/search-solar.svg";
import { CONFIG } from "../../common/constans";
import { extractTextFromHtml } from "../../common/htmlUtils";
const logDir = "popup/PopupPage";
const { navigationMenu: { HOME, SEARCH, FAVORITES, HISTORY }, POPUP_REQUEST_STORAGE_KEY } = CONFIG;
const POPUP_VIEW_STATE_KEY = "popupViewState";

const getStoredFullArticleHistory = () => {
  const storedHistory = localStorage.getItem("fullArticleHistory");
  if (!storedHistory) return [];

  try {
    const history = JSON.parse(storedHistory);
    if (Array.isArray(history)) {
      return history.filter((article) =>
        article &&
        typeof article.key === "string" &&
        typeof article.language === "string" &&
        typeof article.title === "string"
      );
    }
    log.warn(logDir, "Stored full article history is not an array");
  } catch (error) {
    log.warn(logDir, "Failed to parse stored full article history", error);
  }

  return [];
};

const getStoredPopupViewState = () => {
  try {
    const storedState = JSON.parse(localStorage.getItem(POPUP_VIEW_STATE_KEY) || "null");
    if (!storedState || typeof storedState !== "object") return null;

    const resultPages = Array.isArray(storedState.resultPages)
      ? storedState.resultPages.filter((page) =>
        page &&
        ["number", "string"].includes(typeof page.id) &&
        typeof page.offset === "number" &&
        Array.isArray(page.results)
      )
      : [];
    const activeNextResultsId = storedState.activeNextResultsId;
    const hasActiveNextResults = resultPages.some((page) => page.id === activeNextResultsId);

    return {
      inputText: typeof storedState.inputText === "string" ? storedState.inputText : "",
      activeView: [HOME, SEARCH, FAVORITES, HISTORY].includes(storedState.activeView)
        ? storedState.activeView
        : localStorage.getItem("navigationView") || HOME,
      resultPages,
      activeNextResultsId: hasActiveNextResults ? activeNextResultsId : null,
      searchRequest: storedState.searchRequest &&
        typeof storedState.searchRequest === "object" &&
        typeof storedState.searchRequest.text === "string"
        ? storedState.searchRequest
        : null
    };
  } catch (error) {
    log.warn(logDir, "Failed to restore popup view state", error);
    return null;
  }
};

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
  const [storedPopupViewState] = useState(getStoredPopupViewState);
  const [targetLang, setTargetLang] = useState("");
  const [feedLang, setFeedLang] = useState("");
  const [inputText, setInputText] = useState(storedPopupViewState?.inputText || "");
  const [tabInfo, setTabInfo] = useState({
    isConnected: true,
    tabUrl: "",
    isEnabledOnPage: true
  });
  const [resultPages, setResultPages] = useState(storedPopupViewState?.resultPages || []);
  const [activeNextResultsId, setActiveNextResultsId] = useState(
    storedPopupViewState?.activeNextResultsId ?? null
  );
  const initialResultPage = resultPages.find((page) => page.offset === 0 && !page.language);
  const activeNextResultPage = resultPages.find((page) => page.id === activeNextResultsId);
  const results = initialResultPage?.results || [];
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hideInformationLabel, setHideInformationLabel] = useState(false);
  const [searchRequest, setSearchRequest] = useState(storedPopupViewState?.searchRequest || null);
  const [activeView, setActiveView] = useState(
    storedPopupViewState?.activeView || localStorage.getItem("navigationView") || HOME
  );
  const [popupViewStateReady, setPopupViewStateReady] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [fullArticles, setFullArticles] = useState({});
  const fullArticlesRef = useRef({});
  const [fullArticleHistory, setFullArticleHistory] = useState(getStoredFullArticleHistory);
  const activeFullArticle = fullArticleHistory.at(-1) || null;
  const fullArticleToRestore = useRef(activeFullArticle);
  const activeFullArticleState = activeFullArticle
    ? fullArticles[activeFullArticle.key]
    : null;
  const isFullArticleOpen = popupViewStateReady && Boolean(activeFullArticle);
  const isNextResultsOpen = popupViewStateReady && activeNextResultsId !== null;
  const isNextResultsVisible = isNextResultsOpen && !isFullArticleOpen;
  const inputRef = useRef(null);

  const loadingTimer = useRef(null);
  const themeClass = useRef(null);
  const searchHistoryRef = useRef([]);
  const historySearchId = useRef(Math.max(
    0,
    Number(storedPopupViewState?.searchRequest?.searchId) || 0,
    ...(storedPopupViewState?.resultPages || [])
      .map((page) => typeof page.id === "number" ? page.id : 0)
  ));
  const restoredSearchRequestId = useRef(storedPopupViewState?.searchRequest?.searchId ?? null);
  const historySearchStartedAt = useRef(0);
  const wpSearchText = useWpSearch({
    searchHistoryRef,
    setSearchHistory,
    historySearchId,
    historySearchStartedAt,
    loadingTimer,
    setIsLoadingSearch,
    setResults: setResultPages
  });
  const debouncedSearchRequest = useDebouncedValue(
    searchRequest,
    searchRequest?.delay ?? 0
  );

  useEffect(() => {
    localStorage.setItem("fullArticleHistory", JSON.stringify(fullArticleHistory));
  }, [fullArticleHistory]);

  useEffect(() => {
    localStorage.setItem("navigationView", activeView);
  }, [activeView]);

  useEffect(() => {
    if (!popupViewStateReady) return;

    try {
      localStorage.setItem(POPUP_VIEW_STATE_KEY, JSON.stringify({
        inputText,
        activeView,
        resultPages,
        activeNextResultsId,
        searchRequest
      }));
    } catch (error) {
      log.warn(logDir, "Failed to save popup view state", error);
    }
  }, [popupViewStateReady, inputText, activeView, resultPages, activeNextResultsId, searchRequest]);

  useEffect(() => {
    if (!isFullArticleOpen) return undefined;

    document.body.classList.add("popup-page-full-article");
    return () => document.body.classList.remove("popup-page-full-article");
  }, [isFullArticleOpen]);

  useEffect(() => {
    if (!isNextResultsVisible) return undefined;

    document.body.classList.add("popup-page-next-results");
    return () => document.body.classList.remove("popup-page-next-results");
  }, [isNextResultsVisible]);

  /* -------- handlers -------- */

  const dismissHint = () => {
    setSettings("hidePopupInformationLabel", true);
    setHideInformationLabel(true);
  };

  const handleInputText = useCallback((text, isHistorySearch = false) => {
    setInputText(text);
    setResultPages([]);
    setActiveNextResultsId(null);
    setActiveView(SEARCH);
    setFullArticleHistory([]);
    clearTimeout(loadingTimer.current);

    const searchId = ++historySearchId.current;
    setIsLoadingSearch(true);
    if (isHistorySearch) {
      setResultPages([]);
      historySearchStartedAt.current = Date.now();
    }
    setSearchRequest({
      text,
      isHistorySearch,
      searchId,
      offset: 0,
      limit: 5,
      initialLimit: 5,
      languageOffsets: {},
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

  const handleFetchNextResults = useCallback((language, nextLimit, pageOffset, pageLimit) => {
    if (!searchRequest || isLoadingSearch) return;

    const offset = pageOffset !== undefined
      ? pageOffset + pageLimit
      : searchRequest.languageOffsets?.[language] ?? searchRequest.initialLimit ?? 5;
    const cachedPage = resultPages.find((page) =>
      page.language === language && page.offset === offset
    );
    if (cachedPage) {
      setActiveNextResultsId(cachedPage.id);
      return;
    }

    clearTimerRef(loadingTimer);
    const languageOffsets = {
      ...searchRequest.languageOffsets,
      [language]: Math.max(searchRequest.languageOffsets?.[language] ?? 0, offset + nextLimit)
    };
    const searchId = ++historySearchId.current;
    setActiveNextResultsId(searchId);
    setIsLoadingSearch(true);
    setSearchRequest({
      ...searchRequest,
      isHistorySearch: false,
      searchId,
      offset,
      limit: nextLimit,
      language,
      languageOffsets,
      delay: 0
    });
  }, [isLoadingSearch, resultPages, searchRequest]);

  const handlePreviousResults = useCallback((page) => {
    if (!page || page.offset === 0) return;

    const previousOffset = Math.max(0, page.offset - page.limit);
    const cachedPage = resultPages.find((resultPage) =>
      resultPage.language === page.language && resultPage.offset === previousOffset
    );
    if (cachedPage) {
      setActiveNextResultsId(cachedPage.id);
      return;
    }

    if (previousOffset === 0) {
      const initialPage = resultPages.find((resultPage) =>
        resultPage.offset === 0 && !resultPage.language
      );
      if (!initialPage) return;

      const firstLanguagePage = {
        id: `${initialPage.id}:${page.language}:0`,
        offset: 0,
        limit: searchRequest?.initialLimit ?? 5,
        language: page.language,
        results: initialPage.results.filter((result) => result.lang === page.language)
      };
      setResultPages((current) => [...current, firstLanguagePage]);
      setActiveNextResultsId(firstLanguagePage.id);
      return;
    }

    clearTimerRef(loadingTimer);
    const searchId = ++historySearchId.current;
    setActiveNextResultsId(searchId);
    setIsLoadingSearch(true);
    setSearchRequest((current) => current ? {
      ...current,
      isHistorySearch: false,
      searchId,
      offset: previousOffset,
      limit: page.limit,
      language: page.language,
      delay: 0
    } : current);
  }, [resultPages, searchRequest]);

  const handleCloseNextResults = useCallback(() => {
    if (activeNextResultsId === null) return;
    if (historySearchId.current === activeNextResultsId) {
      historySearchId.current += 1;
    }
    setResultPages((current) =>
      current.filter((page) => page.offset === 0 && !page.language)
    );
    setActiveNextResultsId(null);
    setIsLoadingSearch(false);
  }, [activeNextResultsId]);

  useEffect(() => {
    if (!debouncedSearchRequest) return;

    const {
      text,
      isHistorySearch,
      searchId,
      offset = 0,
      limit = 5,
      language
    } = debouncedSearchRequest;
    if (restoredSearchRequestId.current === searchId) {
      restoredSearchRequestId.current = null;
      return;
    }
    const search = async () => {
      try {
        await wpSearchText(text, isHistorySearch, searchId, offset, limit, language);
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
    localStorage.removeItem("fullArticleHistory");
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
      setFeedLang(getSettings("feedLang"));
      setHideInformationLabel(!!getSettings("hidePopupInformationLabel"));

      try {
        const stored = await browser.storage.local.get(POPUP_REQUEST_STORAGE_KEY);
        const popupRequest = stored[POPUP_REQUEST_STORAGE_KEY];
        if (popupRequest) {
          await browser.storage.local.remove(POPUP_REQUEST_STORAGE_KEY);
        }

        const { isConnected, tabUrl, isEnabledOnPage, selectedText } = await getTabInfo();
        if (!mounted) return;

        setTabInfo({
          isConnected: isConnected,
          tabUrl: tabUrl,
          isEnabledOnPage: isEnabledOnPage
        });

        if (popupRequest?.expression) {
          handleInputText(popupRequest.expression);
        }
        if (popupRequest?.language && popupRequest?.title) {
          void handleLoadFullArticle(popupRequest.language, popupRequest.title);
        } else if (!popupRequest?.expression && selectedText) {
          handleInputText(selectedText);
        } else if (!popupRequest?.expression && fullArticleToRestore.current) {
          const article = fullArticleToRestore.current;
          fullArticleToRestore.current = null;
          void handleLoadFullArticle(article.language, article.title, article.scrollTop);
        }
      } catch (err) {
        log.warn(logDir, "getTabInfo failed", err);
      } finally {
        if (mounted) setPopupViewStateReady(true);
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
        isFullArticleOpen && "popup-page-full-article",
        isNextResultsVisible && "popup-page-next-results"
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
      {!activeFullArticle && !isNextResultsOpen && searchHistory.length > 0 && <div
        style={{ display: "flex", justifyContent: "flex-start", alignitems: "center", margin: "5px 10px 15px 10px", fontSize: "0.9em" }}
      >
        {getLocaleMessage("recentSearchTerms")}:&nbsp;&nbsp;
        {searchHistory.slice(0, 3).map((term, index) => (
          <span key={term}>
            {index > 0 && <span style={{ margin: "0 0.5em" }} aria-hidden="true">•</span>}
            <a
              onClick={() => handleHistorySelect(term)}
              type="button"
              style={{ cursor: "pointer", color: "var(--highlight)" }}
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
        key={feedLang}
        language={feedLang}
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

          (resultPages.length > 0 || isLoadingSearch) && (
            <>
              <div
                id="resultArea"
                className={isLoadingSearch && resultPages.length > 0 ? "isRefreshing" : ""}
                aria-busy={isLoadingSearch}
              >
                {initialResultPage && (
                  <ResultArea
                    dismissHint={dismissHint}
                    results={initialResultPage.results}
                    hideInformationLabel={hideInformationLabel}
                    addToFavorites={handleAddFavorite}
                    removeFromFavorites={handleRemoveFavorite}
                    favorites={favorites}
                    loadFullArticle={handleLoadFullArticle}
                    fullArticles={fullArticles}
                    fetchNextResults={handleFetchNextResults}
                    pageOffset={0}
                    pageLimit={searchRequest?.initialLimit ?? 5}
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
      {isNextResultsOpen && (
        <NextResults
          isLoading={isLoadingSearch}
          pageId={activeNextResultsId}
          rangeStart={(activeNextResultPage?.offset ?? searchRequest?.offset ?? 0) + 1}
          rangeEnd={activeNextResultPage
            ? activeNextResultPage.offset + activeNextResultPage.results.length
            : (searchRequest?.offset ?? 0) + (searchRequest?.limit ?? 0)}
          canGoPrevious={(activeNextResultPage?.offset ?? searchRequest?.offset ?? 0) > 0}
          canGoNext={Boolean(activeNextResultPage)}
          onPrevious={() => handlePreviousResults(activeNextResultPage)}
          onNext={() => activeNextResultPage && handleFetchNextResults(
            activeNextResultPage.language,
            10,
            activeNextResultPage.offset,
            activeNextResultPage.limit
          )}
          onClose={handleCloseNextResults}
        >
          {activeNextResultPage ? (
            <ResultArea
              dismissHint={dismissHint}
              results={activeNextResultPage.results}
              hideInformationLabel
              addToFavorites={handleAddFavorite}
              removeFromFavorites={handleRemoveFavorite}
              favorites={favorites}
              loadFullArticle={handleLoadFullArticle}
              fullArticles={fullArticles}
              pageOffset={activeNextResultPage.offset}
              pageLimit={activeNextResultPage.limit}
            />
          ) : (
            <LoadingCaption />
          )}
        </NextResults>
      )}
    </div>
  );
}
