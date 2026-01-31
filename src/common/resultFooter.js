import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";

export function ResultFooter({ text }) {
    return (
        <div className={"mediaButtons"}>
            {text && <CopyButton text={text} />}
        </div>
    );
}
