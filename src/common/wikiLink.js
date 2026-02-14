import React from "react";

export function WikipediaLink({ title, url }) {
    return (
        <p style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
            <strong>
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        textDecoration: "none"
                    }}
                >
                    {title}
                </a>
            </strong>
        </p>
    );
}