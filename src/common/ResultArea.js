import React from "react";
import { getSettings } from "../settings/settings";
import { ResultSection } from "./resultSection";
import InfoBar from "./infoBar";
import browser from "webextension-polyfill";
import { getWikipediaName } from "./utils.jsx";

/**
 *
 * @param {Object} result
 * @param {boolean} hideInformationLabel
 * @param {function()} dismissHint
 * @returns {JSX.Element}
 */
export default function ResultArea({
  results,
  hideInformationLabel,
  dismissHint
}) {
  const information = browser.i18n.getMessage("firstInformationText");
  const useSecondLang = getSettings("shouldUseSecondTargetLang");

  return (
    <>
      {results.map(
        ({ errorMessage, isError, lang, text, title, url }, index) => (
          <ResultSection
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
