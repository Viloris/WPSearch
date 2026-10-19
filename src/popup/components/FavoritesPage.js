import React from "react";
import "../styles/Favorites.scss";
import { getLocaleMessage } from "../../common/i18n";
import OpenInNewWindowIcon from "../icons/open-in-new-window.svg";


export default function FavoritesPage({ favorites, onSelect, onRemove, language, loadFullArticle }) {
  const favoritesLabel = getLocaleMessage("favoritesLabel");
  const emptyFavoritesLabel = getLocaleMessage("emptyFavoritesLabel");
  const openInNewWindowLabel = getLocaleMessage("openInNewWindowLabel");
  const removeFromFavoritesLabel = getLocaleMessage("removeFromFavoritesLabel");
  const hasFavorites = favorites.length > 0;

  return (
    <section className={`favorites-page${hasFavorites ? "" : " favorites-page-empty"}`}>
      {hasFavorites && (
        <div className="favorites-header">
          <h2>{favoritesLabel}</h2>
        </div>
      )}

      {!hasFavorites ? (
        <div className="favorites-empty">
          <span className="empty-icon" aria-hidden="true">
            ★
          </span>
          <h3>{favoritesLabel}</h3>
          <p>{emptyFavoritesLabel}</p>
        </div>
      ) : (
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
      )}
    </section>
  );
}
