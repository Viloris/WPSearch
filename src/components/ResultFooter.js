import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";
import AddToFavoritesButton from "./AddToFavoritesButton";
import NewWindowIcon from "../icons/open-in-new-window.svg";
import BookIcon from "../icons/book-solar.svg";

/**
 *
 * @description Component to display a copy button for the given text if it exists, otherwise returns null
 * @param {string} text
 * @returns {JSX.Element} Component to display a copy button for the given text if it exists, otherwise returns null
 */
export function ResultFooter({
  text,
  addToFavorites,
  wikipedia,
  title,
  language,
  loadFullArticle,
  fullArticleState,
  url
}) {
  const openWikipediaLink = () => {
    window.open(url, "_blank");
  }
  if (text) {
    return (
      <div className={"mediaButtons"}>
        <button
          type="button"
          className="resultFooterButton"
          onClick={() => loadFullArticle(language, title)}
          disabled={fullArticleState?.isLoading}
        >
          <BookIcon className="resultFooterButtonIcon" />
          {fullArticleState?.isLoading ? "Loading…" : "Read more"}
        </button>
        <button
          type="button"
          className="resultFooterButton"
          onClick={() => openWikipediaLink()}
        >
          <NewWindowIcon className="resultFooterButtonIcon" />
          Wikipedia
        </button>
        <AddToFavoritesButton text={text} addToFavorites={addToFavorites} wikipedia={wikipedia} title={title} />
        <CopyButton text={text} />
      </div>
    );
  }
  return null;
}
