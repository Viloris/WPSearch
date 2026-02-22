import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";

/**
 * 
 * @param {string} text 
 * @returns {JSX.Element}
 */
export function ResultFooter({ text }) {
    if (text) return (
        <div className={"mediaButtons"}>
            <CopyButton text={text} />
        </div>
    );
    return null;
}
