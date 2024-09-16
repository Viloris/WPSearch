import React from "react";
import "../styles/ResultArea.scss";
import { getSettings } from "../../settings/settings";
import { getFirstWikipedia, getSecondWikipedia } from "../../common/utils";
import { ResultSection } from "../../common/resultSection";

export default (props) => {
    const {
        errorMessageMain,
        errorMessageSecond,
        isErrorMain,
        isErrorSecond,
        resultMain,
        resultSecond
    } = props;
    const mainLangText = getFirstWikipedia();
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
