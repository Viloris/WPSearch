import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import { getWikipediaName } from "../../../common/urlUtils";

export function ArticleHeader({ canGoBack, fullArticleState, language, onBack, onClose, title }) {
    return (

        <header className="fullArticleView-header">
            <button
                className="fullArticleView-back-button"
                type="button"
                onClick={onBack}
                disabled={!canGoBack}
                aria-label={getLocaleMessage("backFullArticleLabel")}
                title={getLocaleMessage("backFullArticleLabel")}
            >
                ←
            </button>
            <div className="fullArticleView-header-text">
                <a href={fullArticleState?.url} target="_blank" rel="noopener noreferrer"
                    style={{
                        textDecoration: "none"
                    }}>
                    <h2>{title.replaceAll(/_/g, " ")}</h2>
                </a>
                <h5>{getWikipediaName(language)}</h5>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label={getLocaleMessage("closeFullArticleLabel")}
                title={getLocaleMessage("closeFullArticleLabel")}
            >
                ×
            </button>
        </header>
    )
}