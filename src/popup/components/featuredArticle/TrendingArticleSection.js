import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function TrendingArticleSection({ renderArticleCard, trendingArticle }) {
    return <section className="featuredArticleSupplement">
        <h3>{getLocaleMessage("dailyTrendingArticleLabel")}</h3>
        {renderArticleCard(trendingArticle)}
    </section>;
}