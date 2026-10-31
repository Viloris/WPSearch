import React from "react";
import AddIcon from "../../icons/bookmark-filled.svg";
import BlankIcon from "../../icons/bookmark-blank.svg";
import { getLocaleMessage } from "../../../common/i18n";

export function AddToFavoritesButton({ handleToggleFavorite, isSaved }) {
    const addToFavoritesLabel = getLocaleMessage("addToFavoritesLabel")
    return (
        <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={addToFavoritesLabel}
            title={addToFavoritesLabel}
        >
            {isSaved ?
                <AddIcon style={{ width: "16px", height: "16px" }} /> :
                <BlankIcon style={{ width: "16px", height: "16px" }} />}
        </button>
    )
}