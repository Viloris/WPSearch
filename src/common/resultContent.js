import React from "react";
import { splitLine } from "./utils";

export function ResultContent(props) {
    const { result, show } = props;
    if (show)
        return (
            <>
                {WikipediaLink(result)}
                {WikipediaSummary(result)}
            </>
        );
    return null;
}

function WikipediaSummary(result) {
    return (
        <p className="resultText" dir="auto">
            {splitLine(result?.text)}
        </p>
    );
}

function WikipediaLink(result) {
    return (
        <p style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
            <strong>
                <a
                    href={result?.url}
                    target="_blank"
                    style={{
                        textDecoration: "none"
                    }}
                >
                    {result?.title}
                </a>
            </strong>
        </p>
    );
}
