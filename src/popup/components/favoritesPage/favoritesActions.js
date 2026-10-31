import React from "react"
import OpenInNewWindowIcon from "../../../icons/open-in-new-window.svg";
import { getLocaleMessage } from "../../../common/i18n";


export function FavoritesActionBar({ onSelect, onRemove, summary, title }) {
    return (
        <div className="favorite-actions">
            <OpenInNewWindowButton
                onSelect={onSelect}
                summary={summary}
                title={title}
            />
            <RemoveFavoriteButton
                onRemove={onRemove}
                summary={summary}
            />
        </div>
    )
}

function OpenInNewWindowButton({ onSelect, summary, title }) {
    const openInNewWindowLabel = getLocaleMessage("openInNewWindowLabel");
    return (
        <button
            className="favorite-open"
            onClick={() => onSelect(summary)}
            title={openInNewWindowLabel + ": " + title}
            type="button"
            aria-label={openInNewWindowLabel + ": " + title}
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