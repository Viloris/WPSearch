import React from "react";
import { BackButton } from "./BackButton";
import { CloseButton } from "./Closebutton";
import { AddToFavoritesButton } from "./AddToFavoritesButton";
import { ArticleTitle } from "./ArticleTitle";

export function ArticleHeader({
    addToFavorites,
    canGoBack,
    favorites,
    fullArticleState,
    language,
    onBack,
    onClose,
    removeFromFavorites,
    text,
    title,
    wikipedia,
    url
}) {
    const canSave = typeof text === "string" && text.trim().length > 0;
    const isSaved = favorites.some((favorite) => favorite.summary === text);
    const handleToggleFavorite = () => {
        if (!canSave) return;

        if (isSaved) {
            removeFromFavorites(text);
        } else {
            addToFavorites(text, wikipedia, title, url);
        }
    };
    return (

        <header className="fullArticleView-header">
            <BackButton
                canGoBack={canGoBack}
                onBack={onBack}
            />
            <ArticleTitle
                fullArticleState={fullArticleState}
                language={language}
                title={title}
            />
            {/* <div className="fullArticleView-header-text">
                <a href={fullArticleState?.url} target="_blank" rel="noopener noreferrer"
                    style={{
                        textDecoration: "none"
                    }}>
                    <h2>{title.replaceAll(/_/g, " ")}</h2>
                </a>
                <h5>{getWikipediaName(language)}</h5>
            </div> */}
            <AddToFavoritesButton
                handleToggleFavorite={handleToggleFavorite}
                isSaved={isSaved}
                disabled={!canSave}
            />
            <CloseButton
                onClose={onClose}
            />
        </header>
    )
}