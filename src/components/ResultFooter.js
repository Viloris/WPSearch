import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";
import AddToFavoritesButton from "./AddToFavoritesButton";
import { getLocaleMessage } from "../common/i18n";
// import NewWindowIcon from "../icons/open-in-new-window.svg";
// import BookIcon from "../icons/book-solar.svg";
// import { getLocaleMessage } from "../common/i18n";
import {
  DownloadButton,
  MoreResultButton,
  OpenInWikipediaButton,
  ReadFullArticleButton,
  ShareButton
} from "./MediaButtons";

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
      <div className={"mediaButtons"} lang={messageLanguage}>
        {openPopup && searchExpression && (
          <MoreResultButton
            openInPopup={openInPopup}
            getMessage={getMessage}
          />
        )}
        {hasMatchingArticle && (
          <>
            <ReadFullArticleButton
              fullArticleState={fullArticleState}
              openPopup={openPopup}
              language={language}
              loadFullArticle={loadFullArticle}
              title={title}
              getMessage={getMessage}
            />
            <OpenInWikipediaButton
              title={title}
              url={url}
              getMessage={getMessage}
            />
            <AddToFavoritesButton
              className="resultFooterButton"
              text={text}
              addToFavorites={addToFavorites}
              removeFromFavorites={removeFromFavorites}
              wikipedia={wikipedia}
              title={title}
              url={url}
              isSaved={isSaved}
              getMessage={getMessage}
            />
          </>
        )}
        <CopyButton
          className="resultFooterButton"
          text={text}
          getMessage={getMessage}
        />
        <DownloadButton
          title={title}
          summary={text}
          url={url}
          getMessage={getMessage}
        />
        <ShareButton
          title={title}
          summary={text}
          url={url}
          getMessage={getMessage}
        />
      </div>
    );
  }
  return null;
}
