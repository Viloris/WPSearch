import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function FavoritesHeader() {
    const favoritesLabel = getLocaleMessage("favoritesLabel");
    return (
        <div className="favorites-header">
            <h2>{favoritesLabel}</h2>
        </div>
    )
}