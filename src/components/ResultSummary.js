import React from "react";
import { splitLine } from "../common/textUtils";

/**
 * 
 * @description Component to display a summary of the search result text, splitting it into lines for better readability
 * @param {string} text 
 * @returns {JSX.Element} Component to display a summary of the search result text, splitting it into lines for better readability
 */
export function ResultSummary({ text }) {
    return (
        <p className="resultText" dir="auto">
            {splitLine(text)}
        </p>
    );
}