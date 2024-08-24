import React from "react";
import { getResultFontColor } from "../../settings/defaultColors";
import { getWikipediaName, splitLine } from "../../common/utils";

export default function ResultSection(props) {
    const { resultTextMain, isError, renderCopyButton, targetLang } = props;
    const mainLangText = getWikipediaName(targetLang);
    return (
        <>
            <p>{mainLangText}:</p>
            <div className="actionBar">
                <p
                    className="simple-wikipedia-search-result"
                    style={getResultFontColor()}
                    dir="auto"
                >
                    {splitLine(resultTextMain)}
                </p>
                {!isError && renderCopyButton(resultTextMain)}
            </div>
        </>
    );
}
