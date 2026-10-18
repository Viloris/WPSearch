import React from "react";
import HeartIcon from "../icons/bookmark-solar-add.svg";
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
  isSaved = false
}) {
  const buttonClassName = [
    className,
    isSaved && "resultFooterButton--saved"
  ].filter(Boolean).join(" ");

  const handleToggleFavorite = () => {
    if (isSaved) {
      removeFromFavorites(text);
    } else {
      addToFavorites(text, wikipedia, title);
    }
  };

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleToggleFavorite}
    >
      <HeartIcon className="resultFooterButtonIcon" />
      {getLocaleMessage(isSaved ? "addedToFavoritesLabel" : "addToFavoritesLabel")}
    </button>
  );
}
