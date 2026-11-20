import React from "react";
import { getSettings } from "../../settings/settings";
import { ResultSection } from "./resultSection/ResultSection";
import InfoBar from "./InfoBar";
import { getLocaleMessage } from "../../common/i18n";
import { getWikipediaName } from "../../common/urlUtils";
import { MoreResultButton } from "../actionButtons/MoreResultButton";

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
  showFirstResultPerLanguage = false,
  fetchNextResults,
  pageOffset = 0,
  pageLimit = 5
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
      {visibleResults.map((result, index) => {
        const { errorMessage, isError, lang, text, title, url } = result;
        const isLastResultForLanguage =
          index === visibleResults.length - 1 || visibleResults[index + 1]?.lang !== lang;
        const localizedWikipedia = getWikipediaName(lang);

        const isFirstResultInLanguage = visibleResults[index - 1]?.lang !== lang;
        return (
          <React.Fragment key={`${lang}-${index}`}>
            <div
              className={
                index > 0 && isFirstResultInLanguage
                  ? "result-language-separator"
                  : undefined
              }
            >
              {index > 0 && isFirstResultInLanguage && <hr />}
              <ResultSection
                addToFavorites={addToFavorites}
                removeFromFavorites={removeFromFavorites}
                favorites={favorites}
                showHeader={index === 0 || isFirstResultInLanguage}
                errorMessage={errorMessage}
                isError={isError}
                text={text}
                title={title}
                url={url}
                wikipedia={localizedWikipedia}
                fullArticleState={fullArticles[JSON.stringify([lang, title])]}
                loadFullArticle={loadFullArticle}
                lang={lang}
                searchExpression={searchExpression}
                openPopup={openPopup}
              />
            </div>
            {isLastResultForLanguage && fetchNextResults && (
              <div className="mediaButtons mediaButtons--more-results">
                <MoreResultButton
                  fetchNextResults={fetchNextResults}
                  lang={lang}
                  pageOffset={pageOffset}
                  pageLimit={pageLimit}
                  localizedWikipedia={localizedWikipedia}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
      {!hideInformationLabel && !useSecondLang && (
        <InfoBar
          message={information}
          onClick={dismissHint}
        />
      )}
    </>
  );
}
