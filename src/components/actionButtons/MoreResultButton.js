import React from "react";
import { getLocaleMessage } from "../../common/i18n";

/**
 * 
 * @description Renders a button to fetch more results from Wikipedia.
 * @param {Object} param0
 * @param {Function} param0.fetchNextResults
 * @param {string} param0.lang
 * @param {number} param0.pageOffset
 * @param {number} param0.pageLimit
 * @param {string} param0.localizedWikipedia
 * @returns  {JSX.Element} The rendered MoreResultButton component.
 */
export function MoreResultButton({
    fetchNextResults,
    lang,
    localizedWikipedia,
    pageLimit,
    pageOffset,
}) {
    const moreResultsMessage = getLocaleMessage("moreResultsFor");

    return (
        <button
            className="resultFooterButton"
            type="button"
            onClick={() => fetchNextResults(lang, 10, pageOffset, pageLimit)}
        >
            {moreResultsMessage} {localizedWikipedia}
        </button>
    );
}