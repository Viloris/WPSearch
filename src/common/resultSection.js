import React from "react";
import { ErrorSection } from "./errorSection";
import { ResultContent } from "./resultContent";
import { ResultFooter } from "./resultFooter";
import { ResultHeader } from "./resultHeader";

export function ResultSection(props) {
    const {
        errorMessage,
        isError,
        text,
        title,
        url,
        wikipedia
    } = props;
    return (
        <>
            <ResultHeader wikipedia={wikipedia} />
            {!isError && <ResultContent text={text} title={title} url={url} />}
            {!isError && text && <ResultFooter text={text} />}
            {isError && <ErrorSection message={errorMessage} />}
        </>
    );
}
