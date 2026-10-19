import React, { useEffect, useState } from "react";
import log from "loglevel";
import { fetchDailyFeaturedArticle } from "../../api/wikipediaApi";
import { getLocaleMessage } from "../../common/i18n";
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

const loadingStatusMessage = <p className="featuredArticleStatus" role="status">
  {getLocaleMessage("feedLoadingLabel")}
</p>;

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

  /*   const renderArticleCard = (articleToRender) => (
      <article className="featuredArticleCard">
        {articleToRender.thumbnailUrl && !failedImages[articleToRender.articleUrl] && (
          <img
            className="featuredArticleImage"
            src={articleToRender.thumbnailUrl}
            alt=""
            onError={() => setFailedImages((current) => ({
              ...current,
              [articleToRender.articleUrl]: true
            }))}
          />
        )}
        {failedImages[articleToRender.articleUrl] && (
          <p className="featuredArticleStatus" role="alert">
            {getLocaleMessage("dailyArticleImageError")}
          </p>
        )}
        <h3>
          {articleToRender.title.replace(/_/g, " ")}
        </h3>
        {articleToRender.description && (
          <p className="featuredArticleDescription">
            {articleToRender.description}
          </p>
        )}
        <div
          className="featuredArticleExtract"
          onClick={handleArticleLinkClick}
          dangerouslySetInnerHTML={{
            __html: sanitizeExtractHtml(articleToRender.extractHtml, language.toLowerCase())
          }}
        />
        <ResultFooter
          text={
            articleToRender.extractText ||
            extractTextFromHtml(articleToRender.extractHtml, language.toLowerCase())
          }
          addToFavorites={addToFavorites}
          removeFromFavorites={removeFromFavorites}
          favorites={favorites}
          wikipedia={getWikipediaName(language)}
          title={articleToRender.title}
          language={language}
          loadFullArticle={onOpenArticle}
          fullArticleState={fullArticles[JSON.stringify([
            language,
            articleToRender.title
          ])]}
          url={articleToRender.articleUrl}
        />
      </article>
    ); */

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
      <ArticleLabel
        isLoading={isLoading}
        hasFeaturedArticle={hasFeaturedArticle}
        article={article}
      />
      {isLoading && (
        loadingStatusMessage
      )}
      {hasError && (
        <ErrorMessage retry={retry} />
      )}
      {article && !hasFeaturedArticle && !hasSupplementaryContent && (
        <ErrorMessage retry={retry} />
        /* <RetryAlert retry={retry} /> */
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
/* function MostReadArticleSection(article, handleArticleLinkClick, mostReadArticles) {
  return <section className="featuredArticleSupplement">
    <h3>
      {getLocaleMessage("dailyMostReadLabel")}
      {article.mostReadDate && ` (${article.mostReadDate})`}
    </h3>
    <ol
      className="featuredArticleMostRead"
      onClick={handleArticleLinkClick}
    >
      {mostReadArticles.map((mostReadArticle) => (
        <li key={mostReadArticle.articleUrl}>
          <a
            href={mostReadArticle.articleUrl}
            rel="noopener noreferrer"
            target="_blank"
            style={{ textDecoration: "none", color: "blue" }}
          >
            {mostReadArticle.title.replace(/_/g, " ")}
          </a>
          {mostReadArticle.description && (
            <p>{mostReadArticle.description}</p>
          )}
        </li>
      ))}
    </ol>
  </section>;
} */

/* function PictureOfTheDaySection(imageOfDay, failedImages, setFailedImages, retry) {
  return <section className="featuredArticleSupplement">
    <h3>{getLocaleMessage("dailyImageOfDayLabel")}</h3>
    <figure className="featuredArticleImageOfDay">
      {imageOfDay.thumbnailUrl && !failedImages.imageOfDay && (
        <a
          href={imageOfDay.filePageUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            src={imageOfDay.thumbnailUrl}
            alt={imageOfDay.description}
            onError={() => setFailedImages((current) => ({
              ...current,
              imageOfDay: true
            }))} />
        </a>
      )}
      {failedImages.imageOfDay && (
        <p className="featuredArticleStatus" role="alert">
          {getLocaleMessage("dailyImageOfDayError")}
          <button onClick={retry} type="button">
            {getLocaleMessage("dailyFeaturedArticleRetryLabel")}
          </button>
        </p>
      )}
      {imageOfDay.description && (
        <figcaption>{imageOfDay.description}</figcaption>
      )}
      {(imageOfDay.artist || imageOfDay.licenseName) && (
        <p className="featuredArticleImageCredit">
          {imageOfDay.artist && (
            <>
              {getLocaleMessage("dailyImageArtistLabel")}: {imageOfDay.artist}
            </>
          )}
          {imageOfDay.artist && imageOfDay.licenseName && " · "}
          {imageOfDay.licenseName && (
            <>
              {getLocaleMessage("dailyImageLicenseLabel")}:{" "}
              {imageOfDay.licenseUrl ? (
                <a
                  href={imageOfDay.licenseUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none", color: "blue" }}
                >
                  {imageOfDay.licenseName}
                </a>
              ) : (
                imageOfDay.licenseName
              )}
            </>
          )}
        </p>
      )}
    </figure>
  </section>;
} */

/* function TrendingArticleSection(renderArticleCard, trendingArticle) {
  return <section className="featuredArticleSupplement">
    <h3>{getLocaleMessage("dailyTrendingArticleLabel")}</h3>
    {renderArticleCard(trendingArticle)}
  </section>;
} */

/* function OnThisDaySection(onThisDay, handleArticleLinkClick) {
  return <section className="featuredArticleSupplement">
    <h3>{getLocaleMessage("dailyOnThisDayLabel")}</h3>
    <ul className="featuredArticleEntries">
      {onThisDay.map((item, index) => (
        <li key={`${item.year}-${item.text}-${index}`}>
          {item.year && <strong>{item.year}: </strong>}
          {item.text}
          {item.articles.length > 0 && (
            <ul className="featuredArticleFeedLinks" onClick={handleArticleLinkClick}>
              {item.articles.map((linkedArticle) => (
                <li key={linkedArticle.articleUrl}>
                  <a
                    href={linkedArticle.articleUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {linkedArticle.title.replace(/_/g, " ")}
                  </a>
                  {linkedArticle.description && ` — ${linkedArticle.description}`}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </section>;
} */

/* function NewsSection(news, handleArticleLinkClick, language) {
  return <section className="featuredArticleSupplement">
    <h3>{getLocaleMessage("dailyNewsLabel")}</h3>
    <ul className="featuredArticleEntries">
      {news.map((item, index) => (
        <li key={`${item.story}-${index}`}>
          <div
            className="featuredArticleFeedHtml"
            onClick={handleArticleLinkClick}
            dangerouslySetInnerHTML={{
              __html: sanitizeExtractHtml(item.story, language.toLowerCase())
            }} />
          {item.links.length > 0 && (
            <ul className="featuredArticleFeedLinks" onClick={handleArticleLinkClick}>
              {item.links.map((link) => (
                <li key={link.articleUrl}>
                  <a href={link.articleUrl} rel="noopener noreferrer" target="_blank">
                    {link.title.replace(/_/g, " ")}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </section>;
} */

/* function DidYouKnowSection(didYouKnow, handleArticleLinkClick, language) {
  return <section className="featuredArticleSupplement">
    <h3>{getLocaleMessage("dailyDidYouKnowLabel")}</h3>
    <ul className="featuredArticleEntries">
      {didYouKnow.map((item, index) => (
        <li key={`${item.text}-${index}`}>
          {item.html ? (
            <div
              className="featuredArticleFeedHtml"
              onClick={handleArticleLinkClick}
              dangerouslySetInnerHTML={{
                __html: sanitizeExtractHtml(item.html, language.toLowerCase())
              }} />
          ) : (
            <p>{item.text}</p>
          )}
        </li>
      ))}
    </ul>
  </section>;
} */

/* function RetryAlert(retry) {
  return <div className="featuredArticleStatus" role="alert">
    <p>{getLocaleMessage("dailyFeaturedArticleError")}</p>
    <button onClick={retry} type="button">
      {getLocaleMessage("dailyFeaturedArticleRetryLabel")}
    </button>
  </div>;
}

function ErrorMessage(retry) {
  return <div className="featuredArticleStatus" role="alert">
    <p>{getLocaleMessage("dailyFeaturedArticleError")}</p>
    <button onClick={retry} type="button">
      {getLocaleMessage("dailyFeaturedArticleRetryLabel")}
    </button>
  </div>;
} */

/* function ArticleLabel(isLoading, hasFeaturedArticle, article) {
  return <h2>
    {isLoading || !hasFeaturedArticle
      ? getLocaleMessage("feedLabel")
      : getLocaleMessage(
        article.isFallback
          ? "dailyTrendingArticleLabel"
          : article.isLatestFeatured
            ? "dailyLatestFeaturedArticleLabel"
            : "dailyFeaturedArticleLabel"
      )}
  </h2>;
} */

