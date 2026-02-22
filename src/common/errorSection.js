import React from "react";

/**
 * 
 * @param {string} message 
 * @returns {JSX.Element}
 */
export function ErrorSection({ message }) {
    return (
        <p className="error">
            {message}
        </p>
    );
}
