import React from "react";
import { ErrorSection } from "./errorSection";
import { ResultContent } from "./resultContent";
import { ResultFooter } from "./resultFooter";
import { ResultHeader } from "./resultHeader";

export function ResultSection(props) {
    const {
        errorMessage,
        isError,
        result,
        show = true,
        title
    } = props;
    if (show)
        return (
            <>
                <ResultHeader title={title} />
                <ResultContent result={result} show={!isError} />
                <ResultFooter result={result} show={!isError} />
                <ErrorSection message={errorMessage} show={isError} />
            </>
        );
    return null;
}
