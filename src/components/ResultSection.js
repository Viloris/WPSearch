import React from "react";
import { ErrorSection } from "./ErrorSection";
import { ResultContent } from "./ResultContent";
import { ResultFooter } from "./ResultFooter";
import { ResultHeader } from "./ResultHeader";

/**
 *
 * @description Component to display a search result section with error handling, content display, and footer based on the provided props
 * @param {string} errorMessage
 * @param {boolean} isError
 * @param {string} text
 * @param {string} title
 * @param {string} url
 * @param {string} wikipedia
 * @returns {JSX.Element} Component to display a search result section with error handling, content display, and footer based on the provided props
 */
export function ResultSection({
  addToFavorites,
  removeFromFavorites,
  errorMessage,
  isError,
  text,
  title,
  url,
  wikipedia,
  fullArticleState,
  loadFullArticle,
  lang,
  favorites,
  showHeader = true,
  searchExpression,
  openPopup
}) {
  return (
    <>
      {showHeader && <ResultHeader wikipedia={wikipedia} />}
      {isError ? (
        <ErrorSection message={errorMessage} />
      ) : (
        <>
          <ResultContent
            text={text}
            title={title}
            url={url}
          />
          <ResultFooter
            text={text}
            addToFavorites={addToFavorites}
            removeFromFavorites={removeFromFavorites}
            wikipedia={wikipedia}
            title={title}
            language={lang}
            loadFullArticle={loadFullArticle}
            fullArticleState={fullArticleState}
            url={url}
            favorites={favorites}
            searchExpression={searchExpression}
            openPopup={openPopup}
          />
        </>
      )}
    </>
  );
}
