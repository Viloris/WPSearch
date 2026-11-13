import React from "react";
import AddIcon from "../icons/bookmark-filled.svg"
import BlankIcon from "../icons/bookmark-blank.svg"
import { getLocaleMessage } from "../common/i18n";

/**
 *
 * @description Component to display a button that adds the given text to favorites
 * @param {string} text
 * @param {Function} addToFavorites
 * @returns {JSX.Element} Button that adds the given text to favorites
 */
export default function AddToFavoritesButton({
  className,
  text,
  addToFavorites,
  removeFromFavorites,
  wikipedia,
  title,
  url,
  isSaved = false,
  getMessage = getLocaleMessage
}) {
  const buttonClassName = [
    className,
    isSaved && "resultFooterButton--saved"
  ].filter(Boolean).join(" ");

  const handleToggleFavorite = () => {
    if (isSaved) {
      removeFromFavorites(text);
    } else {
      addToFavorites(text, wikipedia, title, url);
    }
  };

  const favoriteButtonLabel = getMessage(isSaved ? "addedToFavoritesLabel" : "addToFavoritesLabel");
  const favoriteIcon = isSaved ?
    <AddIcon className="resultFooterButtonIcon" /> :
    <BlankIcon className="resultFooterButtonIcon" />;

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleToggleFavorite}
    >
      {favoriteIcon}
      {favoriteButtonLabel}
    </button>
  );
}
