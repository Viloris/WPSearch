import React from "react";
import "../styles/Favorites.scss";
import { getLocaleMessage } from "../../common/i18n";

export default function FavoritesPage({ favorites, onSelect, onRemove }) {
  const favoritesLabel = getLocaleMessage("favoritesLabel");
  const emptyFavoritesLabel = getLocaleMessage("emptyFavoritesLabel");
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
          {favorites.map((query) => (
            <div key={query} className="favorite-item">
              <div className="favorite-info">
                <div className="favorite-icon" aria-hidden="true">
                  ★
                </div>
                <div className="favorite-text">
                  <span className="favorite-title">{query}</span>
                </div>
              </div>

              <div className="favorite-actions">
                <button
                  className="favorite-open"
                  onClick={() => onSelect(query)}
                  title={query}
                  type="button"
                  aria-label={query}
                >
                  ↗
                </button>
                <button
                  className="favorite-remove"
                  onClick={() => onRemove(query)}
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
