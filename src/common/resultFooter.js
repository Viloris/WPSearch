import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";

export function ResultFooter(props) {
    const { show, result } = props;
    if (show)
        return (
            <div className={"mediaButtons"}>
                <CopyButton text={result?.text} />
            </div>
        );
    return null;
}
