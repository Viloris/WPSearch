import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import BookmarkIcon from "../../../icons/full-article-bookmark-blank.svg";

export function FavoritesEmpty() {
    const favoritesLabel = getLocaleMessage("favoritesLabel");
    const emptyFavoritesLabel = getLocaleMessage("emptyFavoritesLabel");

    return (
        <div className="favorites-empty">
            <span className="empty-icon" aria-hidden="true">
                <BookmarkIcon />
            </span>
            <h3>{favoritesLabel}</h3>
            <p>{emptyFavoritesLabel}</p>
        </div>
    )
}