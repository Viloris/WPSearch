import React from "react";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";

export function TrendingArticleSection({ renderArticleCard, trendingArticle, language }) {
    const articleTitle = getFeedSectionMessage(language, "dailyTrendingArticleLabel");

    return <section className="featuredArticleSupplement">
        <h3 lang={getFeedSectionLanguage(language)}>{articleTitle}</h3>
        {renderArticleCard(trendingArticle)}
    </section>;
}