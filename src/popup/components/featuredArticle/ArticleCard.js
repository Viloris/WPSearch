import React from "react";
import { extractTextFromHtml, sanitizeExtractHtml } from "../../../common/htmlUtils";
import { getWikipediaName } from "../../../common/urlUtils";
import { ResultFooter } from "../../../components/ResultFooter";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";

export const renderArticleCard = (
    articleToRender,
    failedImages,
    setFailedImages,
    handleArticleLinkClick,
    addToFavorites, removeFromFavorites,
    favorites,
    onOpenArticle,
    fullArticles,
    language
) => (
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
            <p className="featuredArticleStatus" lang={getFeedSectionLanguage(language)} role="alert">
                {getFeedSectionMessage(language, "dailyArticleImageError")}
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
            getMessage={(key) => getFeedSectionMessage(language, key)}
            messageLanguage={getFeedSectionLanguage(language)}
        />
    </article>
);