import React, { useCallback, useEffect, useRef, useState } from "react";
import { getSettings, setSettings } from "src/settings/settings";
import log from "loglevel";
import "../styles/ResultPanel.scss";
import { getBackgroundColor } from "../../settings/defaultColors";
import ResultArea from "../../components/ResultArea"
import { extractTextFromHtml, sanitizeExtractHtml } from "../../common/htmlUtils";
import { getLocaleMessage } from "../../common/i18n";
import { getWikipediaArticleUrl, getWikipediaName } from "../../common/urlUtils";
import { CONFIG } from "../../common/constans";
import browser from "webextension-polyfill";
import { AddToFavoritesButton as ArticleFavoriteButton } from "../../popup/components/fullArticleView/AddToFavoritesButton";
import { DownloadButton, ShareButton } from "../../components/MediaButtons";
import "../../styles/articleReaderActions.scss";

const { ARTICLE_PATH, requestMessages: { WIKIPEDIA_FULL_ARTICLE } } = CONFIG;

/**
 *
 * @param {boolean} shouldShow
 * @param {number} position
 * @param {Array} results
 * @returns {JSX.Element} Component to display a draggable panel with search results, 
 * which positions itself based on the provided coordinates and adjusts its layout according to the content and settings
 */
export default function ResultPanel({
  shouldShow,
  position,
  results,
  selectedText,
  openPopup,
  favorites,
  addToFavorites,
  removeFromFavorites
}) {
  const panelRef = useRef(null);
  const wrapperRef = useRef(null);

  const [layout, setLayout] = useState({
    x: 0,
    y: 0,
    width: parseInt(getSettings("width")),
    height: parseInt(getSettings("height")),
    isOverflow: false
  });

  const [hideInfoLabel, setHideInfoLabel] = useState(
    getSettings("hideInformationLabel")
  );
  const [activeArticle, setActiveArticle] = useState(null);
  const activeArticleText = activeArticle?.html
    ? extractTextFromHtml(activeArticle.html, activeArticle.language.toLowerCase())
    : "";
  const isActiveArticleSaved = Boolean(activeArticleText) &&
    favorites.some((favorite) => favorite.summary === activeArticleText);

  const handleToggleArticleFavorite = () => {
    if (!activeArticleText || !activeArticle) return;

    if (isActiveArticleSaved) {
      removeFromFavorites(activeArticleText);
    } else {
      addToFavorites(
        activeArticleText,
        getWikipediaName(activeArticle.language),
        activeArticle.title,
        activeArticle.url
      );
    }
  };

  const loadFullArticle = useCallback(async (language, title) => {
    const key = JSON.stringify([language, title]);
    const url = `${getWikipediaArticleUrl(language)}${encodeURIComponent(title.replace(/ /g, "_"))}`;
    setActiveArticle({ key, language, title, url, isLoading: true });

    try {
      const html = await browser.runtime.sendMessage({
        message: WIKIPEDIA_FULL_ARTICLE,
        language,
        title
      });
      if (typeof html !== "string" || !html) {
        throw new Error(`Full article response is missing content for "${title}"`);
      }
      setActiveArticle((current) =>
        current?.key === key ? { ...current, html, isLoading: false } : current
      );
    } catch (error) {
      log.error("ResultPanel.loadFullArticle failed", { language, title, error });
      setActiveArticle((current) =>
        current?.key === key
          ? { ...current, isLoading: false, error: getLocaleMessage("unknownError") }
          : current
      );
    }
  }, []);

  const handleArticleClick = (event) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!anchor || !activeArticle) return;

    let articleUrl;
    try {
      articleUrl = new URL(anchor.href);
    } catch {
      return;
    }

    const wikipediaOrigin = new URL(getWikipediaArticleUrl(activeArticle.language)).origin;
    if (
      articleUrl.origin !== wikipediaOrigin ||
      !articleUrl.pathname.startsWith(ARTICLE_PATH)
    ) {
      return;
    }

    let linkedTitle;
    try {
      linkedTitle = decodeURIComponent(articleUrl.pathname.slice(ARTICLE_PATH.length))
        .replaceAll("_", " ");
    } catch {
      return;
    }
    if (!linkedTitle) return;

    event.preventDefault();
    void loadFullArticle(activeArticle.language, linkedTitle);
  };

  /* ---------------- DRAG ---------------- */

  useEffect(() => {
    let dragging = false;
    let offset = { x: 0, y: 0 };

    const start = (e) => {
      if (e.target.className !== "simple-wikipedia-search-move") return;
      dragging = true;
      const rect = panelRef.current.getBoundingClientRect();
      offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      e.dataTransfer.setData("text/plain", "");
    };

    const move = (e) => {
      if (!dragging) return;
      e.preventDefault();
      panelRef.current.style.top = `${e.clientY - offset.y}px`;
      panelRef.current.style.left = `${e.clientX - offset.x}px`;
    };

    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      e.preventDefault();
    };

    document.addEventListener("dragstart", start);
    document.addEventListener("dragover", move);
    document.addEventListener("drop", end);

    return () => {
      document.removeEventListener("dragstart", start);
      document.removeEventListener("dragover", move);
      document.removeEventListener("drop", end);
    };
  }, []);

  /* ---------------- MEASURE + POSITION ---------------- */

  useEffect(() => {
    if (!shouldShow) return;

    requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const configuredWidth = parseInt(getSettings("width"), 10);
      const configuredHeight = parseInt(getSettings("height"), 10);
      const offset = parseInt(getSettings("panelOffset"), 10);
      const winW = document.documentElement.clientWidth;
      const winH = document.documentElement.clientHeight;

      if (activeArticle) {
        const width = Math.min(
          Math.max(configuredWidth, 380),
          Math.max(1, winW - offset * 2)
        );
        const height = Math.min(
          Math.max(configuredHeight, 600),
          Math.max(1, winH - offset * 2)
        );
        const x = Math.max(offset, Math.min(position.x - width / 2, winW - width - offset));
        const y = Math.max(offset, Math.min(position.y + offset, winH - height - offset));

        setLayout({ x, y, width, height, isOverflow: true });
        return;
      }

      const maxWidth = configuredWidth;
      const maxHeight = configuredHeight;

      const width = Math.min(wrapper.clientWidth, maxWidth);
      const height = Math.min(wrapper.clientHeight, maxHeight);

      const isOverflow = wrapper.clientHeight >= maxHeight;

      let x = position.x - width / 2;
      let y = position.y + offset;

      x = Math.max(offset, Math.min(x, winW - width - offset));
      y = Math.max(offset, Math.min(y, winH - height - offset));

      setLayout({ x, y, width, height, isOverflow });
    });
  }, [shouldShow, position, results, activeArticle]);

  /* ---------------- UI ---------------- */

  const dismissHint = () => {
    setSettings("hideInformationLabel", true);
    setHideInfoLabel(true);
  };

  const panelStyles = {
    width: layout.width,
    height: layout.height,
    top: layout.y,
    left: layout.x,
    fontSize: parseInt(getSettings("fontSize")),
    ...(getBackgroundColor() || {})
  };

  const wrapperStyles = {
    overflow: activeArticle ? "hidden" : layout.isOverflow ? "auto" : "hidden"
  };

  return (
    <div
      className={[
        "simple-wikipedia-search-panel",
        shouldShow && "isShow",
        activeArticle && "isReadingArticle"
      ].filter(Boolean).join(" ")}
      ref={panelRef}
      style={panelStyles}
    >
      <div
        className="simple-wikipedia-search-result-wrapper"
        ref={wrapperRef}
        style={wrapperStyles}
      >
        <div className="simple-wikipedia-search-move" draggable />
        <div className="simple-wikipedia-search-result-contents">
          {activeArticle ? (
            <section className="resultPanelArticle" aria-label={activeArticle.title}>
              <header className="resultPanelArticle-header">
                <div className="resultPanelArticle-header-text">
                  <a
                    className="resultPanelArticle-title"
                    href={activeArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <h2>{activeArticle.title.replaceAll("_", " ")}</h2>
                  </a>
                  <span>{getWikipediaName(activeArticle.language)}</span>
                </div>
                <div className="articleReaderActions">
                  <DownloadButton title={activeArticle.title} summary={activeArticleText} url={activeArticle.url} iconOnly disabled={!activeArticleText} />
                  <ShareButton title={activeArticle.title} summary={activeArticleText} url={activeArticle.url} iconOnly />
                  <ArticleFavoriteButton
                    handleToggleFavorite={handleToggleArticleFavorite}
                    isSaved={isActiveArticleSaved}
                    disabled={!activeArticleText}
                  />
                </div>
                <button
                  className="resultPanelArticle-close"
                  type="button"
                  aria-label={getLocaleMessage("closeFullArticleLabel")}
                  title={getLocaleMessage("closeFullArticleLabel")}
                  onClick={() => setActiveArticle(null)}
                >
                  ×
                </button>
              </header>
              <div className="resultPanelArticle-content" onClick={handleArticleClick}>
                {activeArticle.isLoading ? (
                  <p>{getLocaleMessage("loadingFullArticleLabel")}</p>
                ) : activeArticle.html ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitizeExtractHtml(
                        activeArticle.html,
                        activeArticle.language.toLowerCase(),
                        true
                      )
                    }}
                  />
                ) : (
                  <p role="alert">{activeArticle.error || getLocaleMessage("unknownError")}</p>
                )}
              </div>
            </section>
          ) : (
            <ResultArea
              results={results}
              favorites={favorites}
              addToFavorites={addToFavorites}
              removeFromFavorites={removeFromFavorites}
              searchExpression={selectedText}
              openPopup={openPopup}
              loadFullArticle={loadFullArticle}
              showFirstResultPerLanguage
              hideInformationLabel={hideInfoLabel}
              dismissHint={dismissHint}
            />
          )}
        </div>
      </div>
    </div>
  );
}
