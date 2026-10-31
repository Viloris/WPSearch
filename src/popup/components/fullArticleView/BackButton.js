import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function BackButton({ canGoBack, onBack }) {
    const backCaption = getLocaleMessage("backFullArticleLabel");
    return (
        <button
            className="fullArticleView-back-button"
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label={backCaption}
            title={backCaption}
        >
            ←
        </button>
    )
}