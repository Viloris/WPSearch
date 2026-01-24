import React from "react";

export function WikipediaLink({ result }) {
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