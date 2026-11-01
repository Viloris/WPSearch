import React from "react"
import OpenInNewWindowIcon from "../../../icons/open-in-new-window.svg";
import { getLocaleMessage } from "../../../common/i18n";
import log from "loglevel";
import openUrl from "../../../common/openUrl";
import { getWikipediaArticleUrl, getWikipediaLanguageCode } from "../../../common/urlUtils";


export function FavoritesActionBar({ onRemove, summary, title, url, wikipedia }) {
    return (
        <div className="favorite-actions">
            <OpenInNewWindowButton
                title={title}
                url={url}
                wikipedia={wikipedia}
            />
            <RemoveFavoriteButton
                onRemove={onRemove}
                summary={summary}
            />
        </div>
    )
}

function OpenInNewWindowButton({ title, url, wikipedia }) {
    const openInNewWindowLabel = getLocaleMessage("openInNewWindowLabel");
    const language = getWikipediaLanguageCode(wikipedia);
    const articleUrl = url || (title && language
        ? `${getWikipediaArticleUrl(language)}${encodeURIComponent(title.replace(/ /g, "_"))}`
        : "");
    const handleOpen = async () => {
        if (!articleUrl) return;

        try {
            await openUrl(articleUrl);
        } catch (error) {
            log.error("Opening favorite in a new tab failed", error);
        }
    };

    return (
        <button
            className="favorite-open"
            onClick={handleOpen}
            title={openInNewWindowLabel + ": " + title}
            type="button"
            aria-label={openInNewWindowLabel + ": " + title}
            disabled={!articleUrl}
        >
            <OpenInNewWindowIcon />
        </button>
    )
}

function RemoveFavoriteButton({ onRemove, summary }) {
    const removeFromFavoritesLabel = getLocaleMessage("removeFromFavoritesLabel");

    return (
        <button
            className="favorite-remove"
            onClick={() => onRemove(summary)}
            title={removeFromFavoritesLabel}
            type="button"
            aria-label={removeFromFavoritesLabel}
        >
            ×
        </button>
    )
}