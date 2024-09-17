import React from "react";
import "../styles/ResultArea.scss";
import { getSettings } from "../../settings/settings";
import { getFirstWikipedia, getSecondWikipedia } from "../../common/utils";
import { ResultSection } from "../../common/resultSection";
import InfoBar from "../../common/infoBar";

export default (props) => {
    const {
        errorMessageMain,
        errorMessageSecond,
        isErrorMain,
        isErrorSecond,
        resultMain,
        resultSecond,
        hideInformationLabel,
        hidePanel,
        dismissHint
    } = props;
    const mainLangText = getFirstWikipedia();
    const information = browser.i18n.getMessage("firstInformationText");
    const useTheSecondTargetLang = getSettings("shouldUseSecondTargetLang");
    const secondLangText = getSecondWikipedia();

    return (
        <div id="resultArea">
            <ResultSection
                result={resultMain}
                isError={isErrorMain}
                errorMessage={errorMessageMain}
                wikipedia={mainLangText}
            />
            {!hideInformationLabel && !useTheSecondTargetLang && (
                <InfoBar
                    hidePanel={hidePanel}
                    message={information}
                    onClick={dismissHint}
                />
            )}
            <ResultSection
                result={resultSecond}
                isError={isErrorSecond}
                errorMessage={errorMessageSecond}
                wikipedia={secondLangText}
                show={useTheSecondTargetLang}
                className="mediaButtons" //need!
            />
        </div>
    );
};
