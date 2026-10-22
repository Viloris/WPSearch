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
    const titlePrefix = "/wiki/";
    if (
      articleUrl.protocol !== "https:" ||
      articleUrl.hostname !== `${languageCode}.wikipedia.org` ||
      !articleUrl.pathname.startsWith(titlePrefix)
    ) {
      return;
    }

    const encodedTitle = articleUrl.pathname.slice(titlePrefix.length);
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
  const trendingArticle = article?.trendingArticle?.articleUrl !== article?.articleUrl
    ? article?.trendingArticle
    : null;
  const mostReadArticles = Array.isArray(article?.mostReadArticles)
    ? article.mostReadArticles
    : [];
  const hasSupplementaryContent = Boolean(
    imageOfDay || trendingArticle || mostReadArticles.length ||
    didYouKnow.length || news.length || onThisDay.length
  );

  function createArticleCard() {
    return renderArticleCard(
      article,
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
