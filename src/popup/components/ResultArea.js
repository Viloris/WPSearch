import React from "react";
import { getSettings } from "../../settings/settings";
import { ResultSection } from "../../common/resultSection";
import InfoBar from "../../common/infoBar";
import browser from "webextension-polyfill";
import { getWikipediaName } from "../../common/utils";

export default function ResultArea(props) {
    const {
        results,
        hideInformationLabel,
        dismissHint
    } = props;
    const information = browser.i18n.getMessage("firstInformationText");
    const useSecondLang = getSettings("shouldUseSecondTargetLang");

    return (
        <>
            {results.map((res, index) => (
                <ResultSection
                    key={`${res.lang}-${index}`}
                    errorMessage={res.errorMessage}
                    isError={res.isError}
                    text={res.text}
                    title={res.title}
                    url={res.url}
                    wikipedia={getWikipediaName(res.lang)}
                />
            ))}
            {!hideInformationLabel &&
                !useSecondLang && (
                    <div className="infoBar">
                        <InfoBar
                            message={information}
                            onClick={dismissHint}
                        />
                    </div>
                )}
        </>
    );
};
