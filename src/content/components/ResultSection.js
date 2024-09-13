import React from "react";
import { getWikipediaName } from "../../common/utils";
import CopyButton from "../../common/CopyButton";
import { resultHeader } from "../../common/resultHeader";
import { resultContent } from "../../common/resultContent";
import "../styles/ResultPanel.scss";

export function ResultSection(props) {
    const { result, isError, language } = props;
    const wikipedia = getWikipediaName(language);

    return (
        <>
            {resultHeader(wikipedia)}
            {resultContent(result)}
            {resultFooter(isError, result)}
        </>
    );
}

function resultFooter(isError, result) {
    if (!isError)
        return (
            <div className="actionBar">
                <CopyButton text={result.text} />
            </div>
        );
}
