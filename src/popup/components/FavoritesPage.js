import React from "react";
import "../styles/Favorites.scss";
import { getLocaleMessage } from "../../common/i18n";

export default function FavoritesPage({ favorites, onSelect, onRemove }) {
  const favoritesLabel = getLocaleMessage("favoritesLabel");
  const emptyFavoritesLabel = getLocaleMessage("emptyFavoritesLabel");
  const openInNewWindowLabel = getLocaleMessage("openInNewWindowLabel");
  const removeFromFavoritesLabel = getLocaleMessage("removeFromFavoritesLabel");

  return (
    <section className="favorites-page">
      <div className="favorites-header">
        <h2>{favoritesLabel}</h2>
      </div>

      {favorites.length === 0 ? (
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
              <div className="favorite-info">
                {/* <div className="favorite-icon" aria-hidden="true">
                  ★
                </div> */}
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
                  ↗
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
