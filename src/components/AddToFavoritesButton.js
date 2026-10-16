import React, { useState } from "react";
import HeartIcon from "../icons/bookmark-solar-add.svg";
import "../styles/CopyButton.scss";
import { getLocaleMessage } from "../common/i18n";

const buttonCaption = getLocaleMessage("addToFavoritesLabel");

/**
 *
 * @description Component to display a button that adds the given text to favorites
 * @param {string} text
 * @param {Function} addToFavorites
 * @returns {JSX.Element} Button that adds the given text to favorites
 */
export default function AddToFavoritesButton({ text, addToFavorites, wikipedia, title }) {
  const labelAdded = getLocaleMessage("addedToFavoritesLabel");
  const [added, setAdded] = useState(false);

  const handleAddToFavorites = () => {
    addToFavorites(text, wikipedia, title);
    setAdded(true);
  };

  React.useEffect(() => {
    if (added) {
      const timeoutId = setTimeout(() => setAdded(false), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [added]);

  return (
    <div className="copy">
      <button
        className="copyButton"
        title={buttonCaption}
        onClick={handleAddToFavorites}
        type="button"
      >
        <HeartIcon /> Save
      </button>
      {added && (
        <span className="copiedText">{labelAdded}</span>
      )}
    </div>
  );
}
