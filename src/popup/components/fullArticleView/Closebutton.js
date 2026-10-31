import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function CloseButton({ onClose }) {
    const closeCaption = getLocaleMessage("closeFullArticleLabel");
    return (
        <button
            type="button"
            onClick={onClose}
            aria-label={closeCaption}
            title={closeCaption}
        >
            ×
        </button>
    )
}