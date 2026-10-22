import React from "react";
import "../styles/Favorites.scss";
import { getLocaleMessage } from "../../common/i18n";
import { FavoritesHeader } from "./favoritesPage/FavoritesHeader";
import { FavoritesEmpty } from "./favoritesPage/FavoritesEmpty";
import { Favoriteslist } from "./favoritesPage/FavoritesList";

export default function FavoritesPage({ favorites, onSelect, onRemove, language, loadFullArticle }) {
  const openInNewWindowLabel = getLocaleMessage("openInNewWindowLabel");
  const removeFromFavoritesLabel = getLocaleMessage("removeFromFavoritesLabel");
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
          openInNewWindowLabel={openInNewWindowLabel}
          removeFromFavoritesLabel={removeFromFavoritesLabel}
        />
      )}
    </section>
  );
}
