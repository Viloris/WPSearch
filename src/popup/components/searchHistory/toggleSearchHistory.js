import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import HistoryIcon from "../../icons/history.svg";

export function ToggleSearchHistory({ isOpen, history, toggleSearchHistory }) {
    const searchHistoryLabel = getLocaleMessage("searchHistoryLabel");

    return (
        <button
            aria-controls="searchHistoryList"
            aria-expanded={isOpen}
            className="searchHistoryToggle"
            onClick={toggleSearchHistory}
            type="button"
        >
            <HistoryIcon width="1em" height="1em" />
            <span>
                {searchHistoryLabel}
                {history.length > 0 && <span> ({history.length})</span>}
            </span>
        </button>
    )
}