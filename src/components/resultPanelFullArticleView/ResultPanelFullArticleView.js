import React from "react";
import { ArticleBody } from "./ArticleBody";
import { ArticleHeader } from "./ArticleHeader";

export function ResultPanelFullArticleView({
    activeArticle,
    activeArticleText,
    handleArticleClick,
    handleToggleArticleFavorite,
    isActiveArticleSaved,
    setActiveArticle
}) {
    return (
        <section className="resultPanelArticle" aria-label={activeArticle.title}>
            <ArticleHeader
                activeArticle={activeArticle}
                activeArticleText={activeArticleText}
                handleToggleArticleFavorite={handleToggleArticleFavorite}
                isActiveArticleSaved={isActiveArticleSaved}
                setActiveArticle={setActiveArticle}
            />
            <ArticleBody
                activeArticle={activeArticle}
                activeArticleText={activeArticleText}
                handleArticleClick={handleArticleClick}
            />
        </section>
    )
}