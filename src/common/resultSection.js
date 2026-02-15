import React from "react";
import { ErrorSection } from "./errorSection";
import { ResultContent } from "./resultContent";
import { ResultFooter } from "./resultFooter";
import { ResultHeader } from "./resultHeader";

export function ResultSection(props) {
    const {
        errorMessage,
        isError,
        text,
        title,
        url,
        wikipedia
    } = props;
    return (
        <>
            <ResultHeader wikipedia={wikipedia} />
            {isError ?
                (<ErrorSection message={errorMessage} />)
                : (
                    <>
                        <ResultContent
                            text={text}
                            title={title}
                            url={url}
                        />
                        <ResultFooter text={text} />
                    </>
                )}
        </>
    );
}
