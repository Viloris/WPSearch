import React from "react";
import { getWikipediaName } from "../../common/utils";
import CopyButton from "../../common/CopyButton";
import { resultHeader } from "../../common/resultHeader";
import { resultContent } from "../../common/resultContent";

export default function ResultSection(props) {
    const { result, isError, language } = props;
    const wikipedia = getWikipediaName(language);

    return (
        <div>
            {resultHeader(wikipedia)}
            {resultContent(result)}
            {resultFooter(isError, result)}
        </div>
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
