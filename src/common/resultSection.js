import React from "react";
import { ErrorSection } from "./errorSection";
import { ResultContent } from "./resultContent";
import { ResultFooter } from "./resultFooter";
import { ResultHeader } from "./resultHeader";

/**
 * 
 * @param {string} errorMessage 
 * @param {boolean} isError 
 * @param {string} text 
 * @param {string} title 
 * @param {string} url 
 * @param {string} wikipedia 
 * @returns {JSX.Element}
 */
export function ResultSection({ errorMessage, isError, text, title, url, wikipedia }) {
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
