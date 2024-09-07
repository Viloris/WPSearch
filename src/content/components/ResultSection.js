import React from "react";
import { getResultFontColor } from "../../settings/defaultColors";
import { getWikipediaName, splitLine } from "../../common/utils";
import CopyButton from "../../common/CopyButton";

export default function ResultSection(props) {
    const { result, isError, language } = props;
    const wikipedia = getWikipediaName(language);

    return (
        <>
            {resultHeader(result, wikipedia)}
            {resultContent(result)}
            {resultFooter(isError, result)}
        </>
    );
}

function resultHeader(result, wikipedia) {
    return (
        <div>
            <h6>{wikipedia}:</h6>
            <h6>
                <a href={result.url} target="_blank">
                    {result.title}
                </a>
            </h6>
        </div>
    );
}

function resultContent(result) {
    return (
        <p
            className="simple-wikipedia-search-result"
            style={getResultFontColor()}
            dir="auto"
        >
            {splitLine(result.text)}
        </p>
    );
}

function resultFooter(isError, result) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "right",
                alignItems: "center"
            }}
        >
            {!isError && renderCopyButton(result.text)}
        </div>
    );
}

function renderCopyButton(text) {
    return (
        <div className="copyButton">
            <CopyButton text={text} />
        </div>
    );
}
