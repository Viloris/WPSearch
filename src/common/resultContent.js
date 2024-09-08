import React from "react";
import { splitLine } from "./utils";

export function resultContent(result) {
    return (
        <>
            <p style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
                <strong>
                    <a
                        href={result?.url}
                        target="_blank"
                        style={{
                            textDecoration: "none"
                        }}
                    >
                        {result.title}
                    </a>
                </strong>
            </p>
            <p className="resultText" dir="auto">
                {splitLine(result?.text)}
            </p>
        </>
    );
}
