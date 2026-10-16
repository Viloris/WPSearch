import React, { useEffect, useState } from "react";
import log from "loglevel";
import { fetchDailyFeaturedArticle } from "../../api/wikipediaApi";
import { getLocaleMessage } from "../../common/i18n";
import "../styles/FeaturedArticle.scss";
import { sanitizeExtractHtml } from "../../common/htmlUtils";

const logDir = "popup/FeaturedArticle";
/* const allowedTags = new Set([
  "A", "B", "BR", "EM", "I", "LI", "OL", "P", "SPAN", "STRONG", "SUB", "SUP", "UL"
]);
const blockedTags = new Set(["IFRAME", "MATH", "OBJECT", "SCRIPT", "STYLE", "SVG", "TEMPLATE"]);
 */
/* function sanitizeExtractHtml(html, language) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const baseUrl = `https://${language}.wikipedia.org`;

  const copyNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || "");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const sourceElement = node;
    if (blockedTags.has(sourceElement.tagName)) {
      return null;
    }

    const safeTag = allowedTags.has(sourceElement.tagName)
      ? sourceElement.tagName.toLowerCase()
      : "span";
    const safeElement = document.createElement(safeTag);

    if (sourceElement.tagName === "A") {
      const href = sourceElement.getAttribute("href");
      if (href) {
        try {
          const articleUrl = new URL(href, baseUrl);
          if (
            articleUrl.protocol === "https:" &&
            articleUrl.hostname === `${language}.wikipedia.org`
          ) {
            safeElement.setAttribute("href", articleUrl.href);
            safeElement.setAttribute("target", "_blank");
            safeElement.setAttribute("rel", "noopener noreferrer");
          }
        } catch (error) {
          log.warn(logDir, "Ignored invalid link in featured article extract", error);
        }
      }
    }

    for (const child of sourceElement.childNodes) {
      const safeChild = copyNode(child);
      if (safeChild) safeElement.appendChild(safeChild);
    }
    return safeElement;
  };

  const container = document.createElement("div");
  for (const child of parsed.body.childNodes) {
    const safeChild = copyNode(child);
    if (safeChild) container.appendChild(safeChild);
  }
  return container.innerHTML;
} */

export default function FeaturedArticle({ active, language, onOpenArticle }) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  if (!active) return null;

  return (
    <section className="featuredArticle">
      <h2>{getLocaleMessage("dailyFeaturedArticleLabel")}</h2>
      {isLoading && (
        <p className="featuredArticleStatus" role="status">
          {getLocaleMessage("dailyFeaturedArticleLoading")}
        </p>
      )}
      {article?.isFallback && (
        <p className="featuredArticleStatus" role="status">
          {getLocaleMessage("dailyFeaturedArticleFallback")}
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
      {article && (
        <article className="featuredArticleCard">
          {article.thumbnailUrl && (
            <img
              className="featuredArticleImage"
              src={article.thumbnailUrl}
              alt=""
            />
          )}
          <h3>
            <a
              href={article.articleUrl}
              onClick={(event) => {
                event.preventDefault();
                onOpenArticle(language, article.title);
              }}
              rel="noopener noreferrer"
              target="_blank"
            >
              {article.title.replace(/_/g, " ")}
            </a>
          </h3>
          {article.description && (
            <p className="featuredArticleDescription">
              {article.description}
            </p>
          )}
          <div
            className="featuredArticleExtract"
            onClick={handleArticleLinkClick}
            dangerouslySetInnerHTML={{
              __html: sanitizeExtractHtml(article.extractHtml, language.toLowerCase())
            }}
          />
        </article>
      )}
      {article?.imageOfDay && (
        <section className="featuredArticleSupplement">
          <h3>{getLocaleMessage("dailyImageOfDayLabel")}</h3>
          <figure className="featuredArticleImageOfDay">
            {article.imageOfDay.thumbnailUrl && (
              <a
                href={article.imageOfDay.filePageUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  src={article.imageOfDay.thumbnailUrl}
                  alt={article.imageOfDay.description}
                />
              </a>
            )}
            {article.imageOfDay.description && (
              <figcaption>{article.imageOfDay.description}</figcaption>
            )}
            {(article.imageOfDay.artist || article.imageOfDay.licenseName) && (
              <p className="featuredArticleImageCredit">
                {article.imageOfDay.artist && (
                  <>
                    {getLocaleMessage("dailyImageArtistLabel")}: {article.imageOfDay.artist}
                  </>
                )}
                {article.imageOfDay.artist && article.imageOfDay.licenseName && " · "}
                {article.imageOfDay.licenseName && (
                  <>
                    {getLocaleMessage("dailyImageLicenseLabel")}:{" "}
                    {article.imageOfDay.licenseUrl ? (
                      <a
                        href={article.imageOfDay.licenseUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                        style={{ textDecoration: "none", color: "blue" }}
                      >
                        {article.imageOfDay.licenseName}
                      </a>
                    ) : (
                      article.imageOfDay.licenseName
                    )}
                  </>
                )}
              </p>
            )}
          </figure>
        </section>
      )}
      {article?.mostReadArticles.length > 0 && (
        <section className="featuredArticleSupplement">
          <h3>{getLocaleMessage("dailyMostReadLabel")}</h3>
          <ol
            className="featuredArticleMostRead"
            onClick={handleArticleLinkClick}
          >
            {article.mostReadArticles.map((mostReadArticle) => (
              <li key={mostReadArticle.articleUrl}>
                <a
                  href={mostReadArticle.articleUrl}
                  rel="noopener noreferrer"
                  target="_blank"
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
