import React from "react";
import { BackButton } from "./BackButton";
import { ArticleTitle } from "./ArticleTitle";
import { DownloadButton, ShareButton } from "../../../components/actionButtons/MediaButtons";
import { FullArticleFavoriteButton } from "../../../components/actionButtons/FullArticleFavoriteButton";
import { CloseButton } from "../../../components/actionButtons/CloseButton";
import "../../../styles/articleReaderActions.scss";
import { findFavorite } from "../../../common/favorites";

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
    const savedFavorite = findFavorite(favorites, { summary: text, wikipedia, title, url });
    const handleToggleFavorite = () => {
        if (!canSave) return;

        if (savedFavorite) {
            removeFromFavorites(savedFavorite.summary);
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
            <div className="articleReaderActions">
                <DownloadButton
                    iconOnly
                    disabled={!canSave}
                    summary={text}
                    title={title}
                    url={url}
                />
                <ShareButton
                    iconOnly
                    summary={text}
                    title={title}
                    url={url}
                />
                <FullArticleFavoriteButton
                    disabled={!canSave}
                    handleToggleFavorite={handleToggleFavorite}
                    isSaved={Boolean(savedFavorite)}
                />
            </div>
            <CloseButton
                onClose={onClose}
            />
        </header>
    )
}