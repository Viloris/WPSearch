import React from "react";
import "../styles/ResultArea.scss";
import { getFirstWikipedia, getSecondWikipedia } from "../../common/utils";
import CopyButton from "../../common/CopyButton";
import { getSettings } from "../../settings/settings";
import { resultHeader } from "../../common/resultHeader";
import { resultContent } from "../../common/resultContent";

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
            {resultHeader(mainLangText)}
            {!isErrorMain && resultContent(resultMain)}
            {renderCopyButton(isErrorMain, resultMain)}
            {errorSection(isErrorMain, errorMessageMain)}
            {useTheSecondTargetLang && (
                <>
                    {resultHeader(secondLangText)}
                    {!isErrorSecond && resultContent(resultSecond)}
                    {renderCopyButton(isErrorSecond, resultSecond)}
                    {errorSection(isErrorSecond, errorMessageSecond)}
                </>
            )}
        </div>
    );
};

function errorSection(isError, message) {
    if (isError) return <p className="error">{message}</p>;
}

function renderCopyButton(isError, result) {
    if (!isError)
        return (
            <div className="mediaButtons">
                <CopyButton text={result.text} />
            </div>
        );
}
