import React from "react";
import AddIcon from "../../icons/full-article-bookmark-filled.svg";
import BlankIcon from "../../icons/full-article-bookmark-blank.svg";
import { getLocaleMessage } from "../../../common/i18n";

export function AddToFavoritesButton({ handleToggleFavorite, isSaved, disabled }) {
    const addToFavoritesLabel = getLocaleMessage("addToFavoritesLabel")
    return (
        <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={disabled}
            aria-label={addToFavoritesLabel}
            title={addToFavoritesLabel}
        >
            {isSaved ?
                <AddIcon style={{ width: "16px", height: "16px" }} /> :
                <BlankIcon style={{ width: "16px", height: "16px" }} />}
        </button>
    )
}