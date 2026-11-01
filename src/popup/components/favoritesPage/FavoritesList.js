import React from "react";
import { FavoritesActionBar } from "./favoritesActions";
import { FavoriteItem } from "./FavoriteItem";

export function Favoriteslist({ favorites, loadFullArticle, language, onRemove, onSelect }) {
    return (
        <div className="favorites-list">
            {favorites.map(({ summary, wikipedia, title, url }) => (
                <div key={summary} className="favorite-item">
                    <FavoriteItem
                        language={language}
                        loadFullArticle={loadFullArticle}
                        onSelect={onSelect}
                        summary={summary}
                        title={title}
                        wikipedia={wikipedia}
                    />
                    <FavoritesActionBar
                        onRemove={onRemove}
                        summary={summary}
                        title={title}
                        url={url}
                        wikipedia={wikipedia}
                    />
                </div>
            ))}
        </div>
    )
}