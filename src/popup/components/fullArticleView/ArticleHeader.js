import React from "react";
import { getWikipediaName } from "../../../common/urlUtils";
import { BackButton } from "./BackButton";
import { CloseButton } from "./Closebutton";
import { AddToFavoritesButton } from "./AddToFavoritesButton";

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
    wikipedia
}) {
    const isSaved = favorites.some((favorite) => favorite.summary === text);
    const handleToggleFavorite = () => {
        if (isSaved) {
            removeFromFavorites(text);
        } else {
            addToFavorites(text, wikipedia, title);
        }
    };
    return (

        <header className="fullArticleView-header">
            <BackButton
                canGoBack={canGoBack}
                onBack={onBack}
            />
            <div className="fullArticleView-header-text">
                <a href={fullArticleState?.url} target="_blank" rel="noopener noreferrer"
                    style={{
                        textDecoration: "none"
                    }}>
                    <h2>{title.replaceAll(/_/g, " ")}</h2>
                </a>
                <h5>{getWikipediaName(language)}</h5>
            </div>
            <AddToFavoritesButton
                handleToggleFavorite={handleToggleFavorite}
                isSaved={isSaved}
            />
            <CloseButton
                onClose={onClose}
            />
        </header>
    )
}