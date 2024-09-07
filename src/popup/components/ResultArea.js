import React from "react";
import "../styles/ResultArea.scss";
import {
    getFirstWikipedia,
    getSecondTargetLang,
    getSecondWikipedia,
    getTargetLang,
    splitLine
} from "../../common/utils";
import CopyButton from "../../common/CopyButton";
import { getSettings } from "../../settings/settings";
import config from "../../config.json";

const { HTTPS, WIKIPEDIA_URL } = config;

export default (props) => {
    const {
        resultTextMain,
        resultTextSecond,
        errorMessageMain,
        errorMessageSecond,
        inputText,
        isErrorMain,
        isErrorSecond
    } = props;

    const mainLangText = getFirstWikipedia();
    const useTheSecondTargetLang = getSettings("shouldUseSecondTargetLang");
    const secondLangText = getSecondWikipedia();
    const targetLang = getTargetLang();
    const secondTargetLang = getSecondTargetLang();

    return (
        <div id="resultArea">
            {resultHeader(mainLangText, targetLang, inputText)}
            {resultContent(isErrorMain, resultTextMain)}
            {renderCopyButton(isErrorMain, resultTextMain)}
            {errorSection(isErrorMain, errorMessageMain)}
            <br />
            {useTheSecondTargetLang &&
                resultHeader(secondLangText, secondTargetLang, inputText)}
            {resultContent(isErrorSecond, resultTextSecond)}
            {renderCopyButton(isErrorSecond, resultTextSecond)}
            {errorSection(isErrorSecond, errorMessageSecond)}
        </div>
    );
};

function errorSection(isError, message) {
    if (isError) return <p className="error">{message}</p>;
}

function resultContent(isError, resultText) {
    if (!isError)
        return (
            <p className="resultText" dir="auto">
                {splitLine(resultText)}
            </p>
        );
}

function resultHeader(wikipedia, language, searchExpression) {
    const wikipediaUrl = `${HTTPS}${language}${WIKIPEDIA_URL}${searchExpression}`;
    const encodedUrl = encodeURI(wikipediaUrl);
    return (
        <p>
            <a href={encodedUrl} target="_blank">
                {wikipedia}:
            </a>
        </p>
    );
}

function renderCopyButton(isError, text) {
    if (!isError)
        return (
            <div className="mediaButtons">
                <CopyButton text={text} />
            </div>
        );
}
