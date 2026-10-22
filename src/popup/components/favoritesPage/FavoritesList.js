import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import OpenInNewWindowIcon from "../../../icons/open-in-new-window.svg";

export function Favoriteslist({ favorites, loadFullArticle, language, onRemove, onSelect, openInNewWindowLabel, removeFromFavoritesLabel }) {
    return (
        <div className="favorites-list">
            {favorites.map(({ summary, wikipedia, title }) => (
                <div key={summary} className="favorite-item">
                    <div
                        className="favorite-info"
                        onClick={() => title ? loadFullArticle(language, title) : onSelect(summary)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                title ? loadFullArticle(language, title) : onSelect(summary);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        title={getLocaleMessage("readFullArticleLabel")}
                    >
                        <div className="favorite-text">
                            {wikipedia && <span className="favorite-wikipedia">{wikipedia}</span>}
                            {title && <span className="favorite-title">{title}</span>}
                            <span className="favorite-summary">{summary}</span>
                        </div>
                    </div>
                    <div className="favorite-actions">
                        <button
                            className="favorite-open"
                            onClick={() => onSelect(summary)}
                            title={openInNewWindowLabel + ": " + title}
                            type="button"
                            aria-label={openInNewWindowLabel + ": " + title}
                        >
                            <OpenInNewWindowIcon />
                        </button>
                        <button
                            className="favorite-remove"
                            onClick={() => onRemove(summary)}
                            title={removeFromFavoritesLabel}
                            type="button"
                            aria-label={removeFromFavoritesLabel}
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}