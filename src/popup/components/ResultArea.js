import React from "react";
import "../styles/ResultArea.scss";
import {
    getFirstWikipedia,
    getSecondWikipedia,
    splitLine
} from "../../common/utils";
import CopyButton from "../../common/CopyButton";
import { getSettings } from "../../settings/settings";

export default (props) => {
    const {
        resultTextMain,
        resultTextSecond,
        errorMessageMain,
        errorMessageSecond,
        isErrorMain,
        isErrorSecond
    } = props;

    const mainLangText = getFirstWikipedia();
    const useTheSecondTargetLang = getSettings("shouldUseSecondTargetLang");
    const secondLangText = getSecondWikipedia();

    return (
        <div id="resultArea">
            <p>{mainLangText}:</p>
            {!isErrorMain && (
                <p className="resultText" dir="auto">
                    {splitLine(resultTextMain)}
                </p>
            )}
            {!isErrorMain && renderCopyButton(resultTextMain)}
            {isErrorMain && <p className="error">{errorMessageMain}</p>}
            <br />
            {useTheSecondTargetLang && <p>{secondLangText}:</p>}
            {!isErrorSecond && (
                <p className="resultText" dir="auto">
                    {splitLine(resultTextSecond)}
                </p>
            )}
            {!isErrorSecond && renderCopyButton(resultTextSecond)}
            {isErrorSecond && <p className="error">{errorMessageSecond}</p>}
        </div>
    );
};

function renderCopyButton(text) {
    return (
        <div className="mediaButtons">
            <CopyButton text={text} />
        </div>
    );
}
