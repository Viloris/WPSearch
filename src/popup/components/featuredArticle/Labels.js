import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import { getWikipediaName } from "../../../common/urlUtils";

export function ArticleHeader({ language }) {
    return (
        <h1>{getWikipediaName(language)}</h1>
    )
}
export function ArticleLabel({ isLoading, hasFeaturedArticle, article }) {
    return (
        <h2>
            {isLoading || !hasFeaturedArticle
                ? getLocaleMessage("feedLoadingLabel")
                : getLocaleMessage(
                    article.isFallback
                        ? "dailyTrendingArticleLabel"
                        : article.isLatestFeatured
                            ? "dailyLatestFeaturedArticleLabel"
                            : "featuredArticleLabel"
                )}
        </h2>
    );
}