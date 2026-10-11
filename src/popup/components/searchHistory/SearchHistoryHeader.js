import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import { ClearSearchHistoryButton } from "./clearSearchHistory";

export function SearchHistoryHeader({ history, onClear }) {
    const searchHistoryLabel = getLocaleMessage("searchHistoryLabel");

    return (
        <div className="searchHistoryHeader">
            <span>{searchHistoryLabel}</span>
            <ClearSearchHistoryButton onClear={onClear} history={history} />
        </div>
    )
}