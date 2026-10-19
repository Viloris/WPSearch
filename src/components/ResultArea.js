import React from "react";
import { getSettings } from "../settings/settings";
import { ResultSection } from "./ResultSection";
import InfoBar from "./InfoBar";
import { getLocaleMessage } from "../common/i18n";
import { getWikipediaName } from "../common/urlUtils";

/**
 *
 * @description Component to display search results with optional information label and dismiss hint functionality
 * @param {Object} result
 * @param {boolean} hideInformationLabel
 * @param {function()} dismissHint
 * @returns {JSX.Element} Component to display search results with optional information label and dismiss hint functionality
 */
export default function ResultArea({
  results = [],
  hideInformationLabel,
  dismissHint,
  addToFavorites,
  removeFromFavorites,
  favorites,
  loadFullArticle,
  fullArticles = {},
  searchExpression,
  openPopup,
  showFirstResultPerLanguage = false
}) {
  const information = getLocaleMessage("firstInformationText");
  const useSecondLang = getSettings("shouldUseSecondTargetLang");
  const seenLanguages = new Set();
  const visibleResults = showFirstResultPerLanguage
    ? results.filter(({ lang }) => {
      if (seenLanguages.has(lang)) return false;
      seenLanguages.add(lang);
      return true;
    })
    : results;

  return (
    <>
      {visibleResults.map(
        ({ errorMessage, isError, lang, text, title, url }, index) => (
          <div
            className={
              index > 0 && visibleResults[index - 1]?.lang !== lang
                ? "result-language-separator"
                : undefined
            }
            key={`${lang}-${index}`}
          >
            {index > 0 && visibleResults[index - 1]?.lang !== lang && <hr />}
            <ResultSection
              addToFavorites={addToFavorites}
              removeFromFavorites={removeFromFavorites}
              favorites={favorites}
              showHeader={index === 0 || visibleResults[index - 1]?.lang !== lang}
              errorMessage={errorMessage}
              isError={isError}
              text={text}
              title={title}
              url={url}
              wikipedia={getWikipediaName(lang)}
              fullArticleState={fullArticles[JSON.stringify([lang, title])]}
              loadFullArticle={loadFullArticle}
              lang={lang}
              searchExpression={searchExpression}
              openPopup={openPopup}
            />
          </div>
        )
      )}
      {!hideInformationLabel && !useSecondLang && (
        <div className="infoBar">
          <InfoBar message={information} onClick={dismissHint} />
        </div>
      )}
    </>
  );
}
