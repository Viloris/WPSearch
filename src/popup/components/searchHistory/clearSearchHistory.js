import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function ClearSearchHistoryButton({ onClear, history }) {
    const clearSearchHistoryLabel = getLocaleMessage("clearSearchHistoryLabel");
    return (
        <button
            disabled={history.length === 0}
            onClick={onClear}
            type="button"
        >
            {clearSearchHistoryLabel}
        </button>
    );
}