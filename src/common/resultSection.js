import React from "react";
import { ErrorSection } from "./errorSection";
import { ResultContent } from "./resultContent";
import { ResultFooter } from "./resultFooter";
import { resultHeader } from "./resultHeader";

export function ResultSection(props) {
    const {
        errorMessage,
        isError,
        result,
        show = true,
        wikipedia,
        className
    } = props;
    if (show)
        return (
            <>
                {resultHeader(wikipedia)}
                <ResultContent result={result} showResult={!isError} />
                <ResultFooter isError={isError} result={result} />
                <ErrorSection errorMessage={errorMessage} isError={isError} />
            </>
        );
    return null;
}
