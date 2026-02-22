import React from "react";

/**
 * 
 * @param {string} wikipedia
 * @returns {JSX.Element}
 */
export function ResultHeader({ wikipedia }) {
    return (
        <p>
            <strong>{wikipedia}</strong>
        </p>
    );
}
