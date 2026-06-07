import React from "react";

/**
 * 
 * @description Component to display a link to the Wikipedia article with the given title and URL, styled as a header for the search result
 * @param {string} title 
 * @param {string} url 
 * @returns {JSX.Element} Component to display a link to the Wikipedia article with the given title and URL, styled as a header for the search result
 */
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