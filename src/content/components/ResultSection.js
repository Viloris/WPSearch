import React from "react";
import { getResultFontColor } from "../../settings/defaultColors";
import { getWikipediaName, splitLine } from "../../common/utils";
import CopyButton from "../../common/CopyButton";
import config from "../../config.json";

const { HTTPS, WIKIPEDIA_URL } = config;

export default function ResultSection(props) {
    const { resultText, isError, language, searchExpression } = props;
    const wikipedia = getWikipediaName(language);
    const translateUrl = `${HTTPS}${language}${WIKIPEDIA_URL}${searchExpression}`;
    const urlToWikipedia = encodeURI(translateUrl);

    return (
        <>
            {resultHeader(urlToWikipedia, wikipedia)}
            {resultContent(resultText)}
            {resultFooter(isError, resultText)}
        </>
    );
}

function resultFooter(isError, resultText) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "right",
                alignItems: "center"
            }}
        >
            {!isError && renderCopyButton(resultText)}
        </div>
    );
}

function resultContent(resultText) {
    return (
        <p
            className="simple-wikipedia-search-result"
            style={getResultFontColor()}
            dir="auto"
        >
            {splitLine(resultText)}
        </p>
    );
}

function resultHeader(urlToWikipedia, wikipedia) {
    return (
        <p>
            <a href={urlToWikipedia} target="_blank">
                {wikipedia}:
            </a>
        </p>
    );
}

function renderCopyButton(text) {
    return (
        <div className="copyButton">
            <CopyButton text={text} />
        </div>
    );
}
