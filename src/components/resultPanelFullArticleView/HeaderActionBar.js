import React from "react";
import { DownloadButton, ShareButton } from "../actionButtons/MediaButtons";
import { FullArticleFavoriteButton } from "../actionButtons/FullArticleFavoriteButton";
import { CloseButton } from "../actionButtons/CloseButton";
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
            <FullArticleFavoriteButton
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

