import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import { ClearSearchHistoryButton } from "./clearSearchHistory";

export function SearchHistoryHeader({ history, onClear }) {
    const searchTermLabel = getLocaleMessage("searchTermLabel");

    return (
        <div className="searchHistoryHeader">

            <span>{searchTermLabel}</span>
            <ClearSearchHistoryButton onClear={onClear} history={history} />
        </div>
    )
}