import React from "react";
import { ResultSummary } from "./resultSummary";
import { WikipediaLink } from "./wikiLink";

export function ResultContent({ result }) {
    return (
        <>
            <WikipediaLink result={result} />
            <ResultSummary result={result} />
        </>
    );
}
