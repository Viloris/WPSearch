import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function FavoritesEmpty() {
    const favoritesLabel = getLocaleMessage("favoritesLabel");
    const emptyFavoritesLabel = getLocaleMessage("emptyFavoritesLabel");

    return (
        <div className="favorites-empty">
            <span className="empty-icon" aria-hidden="true">
                ★
            </span>
            <h3>{favoritesLabel}</h3>
            <p>{emptyFavoritesLabel}</p>
        </div>
    )
}