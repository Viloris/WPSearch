import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";
import AddToFavoritesButton from "./AddToFavoritesButton";
import NewWindowIcon from "../icons/open-in-new-window.svg";
import BookIcon from "../icons/book-solar.svg";
import { getLocaleMessage } from "../common/i18n";

/**
 *
 * @description Component to display a copy button for the given text if it exists, otherwise returns null
 * @param {string} text
 * @returns {JSX.Element} Component to display a copy button for the given text if it exists, otherwise returns null
 */
export function ResultFooter({
  text,
  addToFavorites,
  removeFromFavorites,
  wikipedia,
  title,
  language,
  loadFullArticle,
  fullArticleState,
  url,
  favorites = [],
  searchExpression,
  openPopup
}) {
  const openWikipediaLink = () => {
    window.open(url, "_blank");
  }
  const isSaved = favorites.some((favorite) => favorite.summary === text);
  const hasMatchingArticle = Boolean(url);
  const readMoreLabel = fullArticleState?.isLoading ? "Loading…" : getLocaleMessage("readmoreLabel");
  const wikipediaLabel = getLocaleMessage("wikipediaLabel");
  const moreResultsLabel = getLocaleMessage("moreResultsLabel");
  const openInPopup = (article = null) => {
    openPopup({
      expression: searchExpression,
      ...article
    });
  };

  if (text) {
    return (
      <div className={"mediaButtons"}>
        {openPopup && searchExpression && (
          <button
            type="button"
            className="resultFooterButton"
            onClick={() => openInPopup()}
          >
            {moreResultsLabel}
          </button>
        )}
        {hasMatchingArticle && (
          <>
            <button
              type="button"
              className="resultFooterButton"
              onClick={() => openPopup
                ? openInPopup({ language, title })
                : loadFullArticle(language, title)}
              disabled={fullArticleState?.isLoading}
            >
              <BookIcon className="resultFooterButtonIcon" />
              {readMoreLabel}
            </button>
            <button
              type="button"
              className="resultFooterButton"
              onClick={() => openWikipediaLink()}
            >
              <NewWindowIcon className="resultFooterButtonIcon" />
              {wikipediaLabel}
            </button>
            <AddToFavoritesButton
              className="resultFooterButton"
              text={text}
              addToFavorites={addToFavorites}
              removeFromFavorites={removeFromFavorites}
              wikipedia={wikipedia}
              title={title}
              isSaved={isSaved}
            />
          </>
        )}
        <CopyButton
          className="resultFooterButton"
          text={text}
        />
      </div>
    );
  }
  return null;
}
