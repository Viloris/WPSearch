import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function TrendingArticleSection({ renderArticleCard, trendingArticle }) {
    const articleTitle = getLocaleMessage("dailyTrendingArticleLabel");

    return <section className="featuredArticleSupplement">
        <h3>{articleTitle}</h3>
        {renderArticleCard(trendingArticle)}
    </section>;
}