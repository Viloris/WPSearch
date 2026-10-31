import React from "react";

/**
 * 
 * @description Splits the input text into lines based on newline characters and returns an array of text and <br> elements for display in the search result summary
 * @param {*} text 
 * @returns {Array} Array of text and <br> elements to split the input text into lines for display in the search result summary
 */
export function splitLine(text) {
    const regex = /(\n)/g;
    if (!text) return;
    return text
        .split(regex)
        .map((line, i) => (line.match(regex) ? React.createElement("br", { key: i }) : line));
}

/**
 * 
 * @param {*} string 
 * @returns 
 */
export function normalizeString(string) {
    return string.trim().replace(/_/g, " ").toLowerCase();
}
