import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";

export function ResultFooter({ text }) {
    if (text) return (
        <div className={"mediaButtons"}>
            <CopyButton text={text} />
        </div>
    );
    return null;
}
