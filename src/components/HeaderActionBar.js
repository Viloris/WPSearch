import React from "react";
import { DownloadButton, ShareButton } from "./MediaButtons";
import { AddToFavoritesButton } from "../popup/components/fullArticleView/AddToFavoritesButton";
import { CloseButton } from "../popup/components/fullArticleView/Closebutton";

export function HeaderActionBar({
    activeArticle,
    activeArticleText,
    handleToggleArticleFavorite,
    isActiveArticleSaved,
    setActiveArticle
}) {
    const createCloseHandler = () => setActiveArticle(null);

    return (
        <div className="articleReaderActions">
            <DownloadButton
                title={activeArticle.title}
                summary={activeArticleText}
                url={activeArticle.url}
                iconOnly
                disabled={!activeArticleText}
            />
            <ShareButton
                title={activeArticle.title}
                summary={activeArticleText}
                url={activeArticle.url}
                iconOnly
            />
            <AddToFavoritesButton
                handleToggleFavorite={handleToggleArticleFavorite}
                isSaved={isActiveArticleSaved}
                disabled={!activeArticleText}
            />
            <CloseButton
                onClose={createCloseHandler}
            />
        </div>
    )
}

