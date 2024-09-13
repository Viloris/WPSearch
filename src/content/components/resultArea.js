import React from "react";
import { ErrorSection } from "./errorSection";
import { ResultSection } from "./ResultSection";

export function ResultArea(props) {
    const { errorMessage, isError, language, result } = props;
    return (
        <>
            <ResultSection
                result={result}
                isError={isError}
                language={language}
            />
            {isError && (
                <ErrorSection errorMessage={errorMessage} isError={isError} />
            )}
        </>
    );
}
