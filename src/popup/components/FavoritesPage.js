import React from "react";
import "../styles/Favorites.scss";
import { FavoritesHeader } from "./favoritesPage/FavoritesHeader";
import { FavoritesEmpty } from "./favoritesPage/FavoritesEmpty";
import { Favoriteslist } from "./favoritesPage/FavoritesList";

export default function FavoritesPage({ favorites, onSelect, onRemove, language, loadFullArticle }) {
  const hasFavorites = favorites.length > 0;

  return (
    <section className={`favorites-page${hasFavorites ? "" : " favorites-page-empty"}`}>
      {hasFavorites && (
        <FavoritesHeader />
      )}

      {!hasFavorites ? (
        <FavoritesEmpty />
      ) : (
        <Favoriteslist
          favorites={favorites}
          loadFullArticle={loadFullArticle}
          language={language}
          onRemove={onRemove}
          onSelect={onSelect}
        />
      )}
    </section>
  );
}
