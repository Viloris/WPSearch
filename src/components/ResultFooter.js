import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";
import AddToFavoritesButton from "./AddToFavoritesButton";

/**
 *
 * @description Component to display a copy button for the given text if it exists, otherwise returns null
 * @param {string} text
 * @returns {JSX.Element} Component to display a copy button for the given text if it exists, otherwise returns null
 */
export function ResultFooter({ text, addToFavorites, wikipedia, title }) {
  if (text) {
    return (
      <div className={"mediaButtons"}>
        <AddToFavoritesButton text={text} addToFavorites={addToFavorites} wikipedia={wikipedia} title={title} />
        <CopyButton text={text} />
      </div>
    );
  }
  return null;
}
