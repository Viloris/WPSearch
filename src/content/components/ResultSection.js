/* import React from "react";
import "../styles/ResultPanel.scss";
import { getWikipediaName } from "../../common/utils";
import { resultHeader } from "../../common/resultHeader";
import { resultContent } from "../../common/resultContent";
import { ResultFooter } from "../../common/resultFooter";

export function ResultSection(props) {
    const { result, isError, language } = props;
    const wikipedia = getWikipediaName(language);

    return (
        <>
            {resultHeader(wikipedia)}
            {!isError && resultContent(result)}
            <ResultFooter
                isError={isError}
                result={result}
                className="actionBar"
            />
        </>
    );
}
 */
