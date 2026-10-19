import React from "react";

/**
 * 
 * @description Component to display a link to the Wikipedia article with the given title and URL, styled as a header for the search result
 * @param {string} title 
 * @param {string} url 
 * @returns {JSX.Element} Component to display a link to the Wikipedia article with the given title and URL, styled as a header for the search result
 */
export function WikipediaLink({ title }) {
    return (
        <p style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
            <strong>
                {title}
            </strong>
        </p>
    );
}