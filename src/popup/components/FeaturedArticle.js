import React, { useEffect, useState } from "react";
import log from "loglevel";
import { fetchDailyFeaturedArticle } from "../../api/wikipediaApi";
import { getLocaleMessage } from "../../common/i18n";
import "../styles/FeaturedArticle.scss";
import { extractTextFromHtml, sanitizeExtractHtml } from "../../common/htmlUtils";
import { getWikipediaName } from "../../common/urlUtils";
import { ResultFooter } from "../../components/ResultFooter";
import WikipediaIcon from "../icons/wikipedia.svg";

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

  const renderArticleCard = (articleToRender) => (
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
  );

  if (!active) return null;

  return (
    <section className="featuredArticle">
      <h1><WikipediaIcon style={{ width: "1.2em", height: "1.2em" }} /> {getWikipediaName(language)}</h1>
      <h2>
        {isLoading || !hasFeaturedArticle
          ? getLocaleMessage("feedLabel")
          : getLocaleMessage(
            article.isFallback
              ? "dailyTrendingArticleLabel"
              : article.isLatestFeatured
                ? "dailyLatestFeaturedArticleLabel"
                : "dailyFeaturedArticleLabel"
          )}
      </h2>
      {isLoading && (
        <p className="featuredArticleStatus" role="status">
          {getLocaleMessage("feedLoadingLabel")}
        </p>
      )}
      {hasError && (
        <div className="featuredArticleStatus" role="alert">
          <p>{getLocaleMessage("dailyFeaturedArticleError")}</p>
          <button onClick={retry} type="button">
            {getLocaleMessage("dailyFeaturedArticleRetryLabel")}
          </button>
        </div>
      )}
      {article && !hasFeaturedArticle && !hasSupplementaryContent && (
        <div className="featuredArticleStatus" role="alert">
          <p>{getLocaleMessage("dailyFeaturedArticleError")}</p>
          <button onClick={retry} type="button">
            {getLocaleMessage("dailyFeaturedArticleRetryLabel")}
          </button>
        </div>
      )}
      {hasFeaturedArticle && renderArticleCard(article)}
      {didYouKnow.length > 0 && (
        <section className="featuredArticleSupplement">
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
                    }}
                  />
                ) : (
                  <p>{item.text}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {news.length > 0 && (
        <section className="featuredArticleSupplement">
          <h3>{getLocaleMessage("dailyNewsLabel")}</h3>
          <ul className="featuredArticleEntries">
            {news.map((item, index) => (
              <li key={`${item.story}-${index}`}>
                <div
                  className="featuredArticleFeedHtml"
                  onClick={handleArticleLinkClick}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeExtractHtml(item.story, language.toLowerCase())
                  }}
                />
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
        </section>
      )}
      {onThisDay.length > 0 && (
        <section className="featuredArticleSupplement">
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
        </section>
      )}
      {trendingArticle && (
        <section className="featuredArticleSupplement">
          <h3>{getLocaleMessage("dailyTrendingArticleLabel")}</h3>
          {renderArticleCard(trendingArticle)}
        </section>
      )}
      {imageOfDay && (
        <section className="featuredArticleSupplement">
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
                  }))}
                />
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
        </section>
      )}
      {mostReadArticles.length > 0 && (
        <section className="featuredArticleSupplement">
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
        </section>
      )}
    </section>
  );
}
