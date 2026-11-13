import React from "react";
import { BackButton } from "./BackButton";
import { CloseButton } from "./Closebutton";
import { AddToFavoritesButton } from "./AddToFavoritesButton";
import { ArticleTitle } from "./ArticleTitle";
import { DownloadButton, ShareButton } from "../../../components/MediaButtons";
import "../../../styles/articleReaderActions.scss";

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
            <div className="articleReaderActions">
                <DownloadButton title={title} summary={text} url={url} iconOnly disabled={!canSave} />
                <ShareButton title={title} summary={text} url={url} iconOnly />
                <AddToFavoritesButton
                    handleToggleFavorite={handleToggleFavorite}
                    isSaved={isSaved}
                    disabled={!canSave}
                />
            </div>
            <CloseButton
                onClose={onClose}
            />
        </header>
    )
}