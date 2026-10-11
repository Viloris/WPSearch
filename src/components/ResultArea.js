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
  addToFavorites
}) {
  const information = getLocaleMessage("firstInformationText");
  const useSecondLang = getSettings("shouldUseSecondTargetLang");

  return (
    <>
      {results.map(
        ({ errorMessage, isError, lang, text, title, url }, index) => (
          <ResultSection
            addToFavorites={addToFavorites}
            key={`${lang}-${index}`}
            errorMessage={errorMessage}
            isError={isError}
            text={text}
            title={title}
            url={url}
            wikipedia={getWikipediaName(lang)}
          />
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
