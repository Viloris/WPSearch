import React from "react";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";

export function MostReadArticleSection({ article, handleArticleLinkClick, mostReadArticles, language }) {
    return (
        <section className="featuredArticleSupplement">
            <h3 lang={getFeedSectionLanguage(language)}>
                {getFeedSectionMessage(language, "dailyMostReadLabel")}
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
                            style={{ textDecoration: "none" }}
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
    )
}