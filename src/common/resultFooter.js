import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";

export function ResultFooter({ result }) {
    return (
        <div className={"mediaButtons"}>
            <CopyButton text={result?.text} />
        </div>
    );
}
