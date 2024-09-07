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
            {resultContent(isErrorMain, resultMain)}
            {renderCopyButton(isErrorMain, resultMain)}
            {errorSection(isErrorMain, errorMessageMain)}
            {useTheSecondTargetLang && (
                <>
                    {resultHeader(secondLangText)}
                    {resultContent(isErrorSecond, resultSecond)}
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

function resultContent(isError, result) {
    if (!isError)
        return (
            <>
                <h5>
                    <a
                        href={result?.url}
                        target="_blank"
                        style={{ textDecoration: "none" }}
                    >
                        {result.title}
                    </a>
                </h5>
                <p className="resultText" dir="auto">
                    {splitLine(result?.text)}
                </p>
            </>
        );
}

function resultHeader(wikipedia) {
    return <h5>{wikipedia}:</h5>;
}

function renderCopyButton(isError, result) {
    if (!isError)
        return (
            <div className="mediaButtons">
                <CopyButton text={result.text} />
            </div>
        );
}
