import React from "react";
import "../styles/resultFooter.scss";
import { getLocaleMessage } from "../common/i18n";
import { FooterActionBar } from "./FooterActionBar";

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
  openPopup,
  getMessage = getLocaleMessage,
  messageLanguage
}) {
  const isSaved = favorites.some((favorite) => favorite.summary === text);
  const hasMatchingArticle = Boolean(url);
  const openInPopup = (article = null) => {
    openPopup({
      expression: searchExpression,
      ...article
    });
  };

  if (text) {
    return (
      <FooterActionBar
        addToFavorites={addToFavorites}
        fullArticleState={fullArticleState}
        getMessage={getMessage}
        hasMatchingArticle={hasMatchingArticle}
        isSaved={isSaved}
        language={language}
        loadFullArticle={loadFullArticle}
        messageLanguage={messageLanguage}
        openInPopup={openInPopup}
        openPopup={openPopup}
        removeFromFavorites={removeFromFavorites}
        searchExpression={searchExpression}
        title={title}
        text={text}
        url={url}
        wikipedia={wikipedia}
      />
    );
  }
  return null;
}
