import React from "react";
import { HeaderActionBar } from "./HeaderActionBar";
import { HeaderTitle } from "./HeaderTitle";

export function ArticleHeader({
    activeArticle,
    activeArticleText,
    handleToggleArticleFavorite,
    isActiveArticleSaved,
    setActiveArticle
}) {
    return (
        <header className="resultPanelArticle-header">
            <HeaderTitle
                activeArticle={activeArticle}
            />
            <HeaderActionBar
                activeArticle={activeArticle}
                activeArticleText={activeArticleText}
                handleToggleArticleFavorite={handleToggleArticleFavorite}
                isActiveArticleSaved={isActiveArticleSaved}
                setActiveArticle={setActiveArticle}
            />
        </header>
    )
}