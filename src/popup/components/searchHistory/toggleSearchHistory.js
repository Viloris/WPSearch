import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function ToggleSearchHistory({ isOpen, history, toggleSearchHistory }) {
    const searchHistoryLabel = getLocaleMessage("searchHistoryLabel");

    return (<button
        aria-controls="searchHistoryList"
        aria-expanded={isOpen}
        className="searchHistoryToggle"
        onClick={toggleSearchHistory}
        type="button"
    >
        {searchHistoryLabel}
        {history.length > 0 && <span> ({history.length})</span>}
    </button>)
}