import React from "react";
import { ResultSummary } from "./resultSummary";
import { WikipediaLink } from "./wikiLink";

export function ResultContent({ text, title, url }) {
    return (
        <>
            <WikipediaLink title={title} url={url} />
            <ResultSummary text={text} />
        </>
    );
}
