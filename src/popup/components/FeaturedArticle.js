import React, { useEffect, useState } from "react";
import log from "loglevel";
import { fetchDailyFeaturedArticle } from "../../api/wikipediaApi";
import "../styles/FeaturedArticle.scss";
import { MostReadArticleSection } from "./featuredArticle/mostReadArticleSection";
import { PictureOfTheDaySection } from "./featuredArticle/PictureOfTheDaySection";
import { TrendingArticleSection } from "./featuredArticle/TrendingArticleSection";
import { OnThisDaySection } from "./featuredArticle/OnThisDaySection";
import { NewsSection } from "./featuredArticle/NewsSection";
import { DidYouKnowSection } from "./featuredArticle/DidYouKnowSection";
import { ErrorMessage } from "./featuredArticle/Alerts";
import { ArticleHeader, ArticleLabel } from "./featuredArticle/Labels";
import { renderArticleCard } from "./featuredArticle/ArticleCard";
import CONFIG from "../../config.json"
import { normalizeString } from "../../common/textUtils";
import { getLocaleMessage } from "../../common/i18n";

const { ARTICLE_PATH, protocolHttps, WIKIPEDIA_DOMAIN } = CONFIG;

const logDir = "popup/FeaturedArticle";

export default function FeaturedArticle({
  active,
  language,
  onOpenArticle,
  addToFavorites,
  removeFromFavorites,
  favorites,
  fullArticles
}) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    if (!active || !language || article || hasError) return undefined;

    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);

    const loadArticle = async () => {
      try {
        const featuredArticle = await fetchDailyFeaturedArticle(language, controller.signal);
        if (!controller.signal.aborted) {
          setArticle(featuredArticle);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          log.error(logDir, "Failed to load daily featured article", error);
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadArticle();
    return () => controller.abort();
  }, [active, article, hasError, language]);

  const retry = () => {
    setArticle(null);
    setHasError(false);
    setFailedImages({});
  };

  const handleArticleLinkClick = (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor) return;

    const articleUrl = new URL(anchor.href);
    const languageCode = language.toLowerCase();

    if (
      articleUrl.protocol !== protocolHttps ||
      articleUrl.hostname !== `${languageCode}${WIKIPEDIA_DOMAIN}` ||
      !articleUrl.pathname.startsWith(ARTICLE_PATH)
    ) {
      return;
    }

    const encodedTitle = articleUrl.pathname.slice(ARTICLE_PATH.length);
    let title;
    try {
      title = decodeURIComponent(encodedTitle).replace(/_/g, " ");
    } catch (error) {
      log.warn(logDir, "Ignored invalid article link in featured article", error);
      return;
    }

    if (!title) return;
    event.preventDefault();
    onOpenArticle(languageCode, title);
  };

  const imageOfDay = article?.imageOfDay;
  const hasFeaturedArticle = Boolean(article?.articleUrl);
  const didYouKnow = Array.isArray(article?.didYouKnow) ? article.didYouKnow : [];
  const news = Array.isArray(article?.news) ? article.news : [];
  const onThisDay = Array.isArray(article?.onThisDay) ? article.onThisDay : [];
  const trendingArticleData = article?.trendingArticle;
  const sameTrendingArticle = Boolean(
    (article?.articleUrl && trendingArticleData?.articleUrl === article.articleUrl) ||
    (article?.title && trendingArticleData?.title &&
      normalizeString(article.title) ===
      normalizeString(trendingArticleData.title))
  );
  const trendingArticle = sameTrendingArticle ? null : trendingArticleData;
  const mostReadArticles = Array.isArray(article?.mostReadArticles)
    ? article.mostReadArticles
    : [];
  const hasSupplementaryContent = Boolean(
    imageOfDay || trendingArticle || mostReadArticles.length ||
    didYouKnow.length || news.length || onThisDay.length
  );

  function createArticleCard(articleToRender = article) {
    return renderArticleCard(
      articleToRender,
      failedImages,
      setFailedImages,
      handleArticleLinkClick,
      addToFavorites,
      removeFromFavorites,
      favorites,
      onOpenArticle,
      fullArticles,
      language
    );
  }

  if (!active) return null;

  const featuredArticleLabel = getLocaleMessage("featuredArticleLabel");
  return (
    <section className="featuredArticle">
      <ArticleHeader
        language={language}
      />
      {isLoading && <ArticleLabel
        hasFeaturedArticle={hasFeaturedArticle}
        article={article}
      />}
      {hasError && (
        <ErrorMessage retry={retry} />
      )}
      {article && !hasFeaturedArticle && !hasSupplementaryContent && (
        <ErrorMessage retry={retry} />
      )}
      {hasFeaturedArticle && <h3>{featuredArticleLabel}</h3>}
      {hasFeaturedArticle && createArticleCard()}
      {didYouKnow.length > 0 && (
        <DidYouKnowSection
          didYouKnow={didYouKnow}
          handleArticleLinkClick={handleArticleLinkClick}
          language={language}
        />
      )}
      {news.length > 0 && (
        <NewsSection
          news={news}
          handleArticleLinkClick={handleArticleLinkClick}
          language={language}
        />
      )}
      {onThisDay.length > 0 && (
        <OnThisDaySection
          onThisDay={onThisDay}
          handleArticleLinkClick={handleArticleLinkClick}
        />
      )}
      {trendingArticle && (
        <TrendingArticleSection
          renderArticleCard={createArticleCard}
          trendingArticle={trendingArticle}
        />
      )}
      {imageOfDay && (
        <PictureOfTheDaySection
          imageOfDay={imageOfDay}
          failedImages={failedImages}
          setFailedImages={setFailedImages}
          retry={retry}
        />
      )}
      {mostReadArticles.length > 0 && (
        <MostReadArticleSection
          article={article}
          handleArticleLinkClick={handleArticleLinkClick}
          mostReadArticles={mostReadArticles}
        />
      )}
    </section>
  );
}
