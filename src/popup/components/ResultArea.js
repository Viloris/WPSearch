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
    const firstWikipediaName = getFirstWikipedia();
    const information = browser.i18n.getMessage("firstInformationText");
    const useTheSecondTargetLang = getSettings("shouldUseSecondTargetLang");
    const secondWikipediaName = getSecondWikipedia();

    return (
        <div id="resultArea">
            <ResultSection
                result={resultMain}
                isError={isErrorMain}
                errorMessage={errorMessageMain}
                title={firstWikipediaName}
            />
            {!hideInformationLabel &&
                !useTheSecondTargetLang &&
                (
                    <InfoBar
                        hidePanel={hidePanel}
                        message={information}
                        onClick={dismissHint}
                    />
                )
            }
            <ResultSection
                result={resultSecond}
                isError={isErrorSecond}
                errorMessage={errorMessageSecond}
                title={secondWikipediaName}
                show={useTheSecondTargetLang}
            />
        </div>
    );
};
