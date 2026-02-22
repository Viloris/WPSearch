import React from "react";
import { splitLine } from "./utils.jsx";

/**
 * 
 * @param {string} text 
 * @returns {JSX.Element}
 */
export function ResultSummary({ text }) {
    return (
        <p className="resultText" dir="auto">
            {splitLine(text)}
        </p>
    );
}