import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import HistoryIcon from "../../icons/history.svg";

export function EmptySearchLabel() {
    return (
        <div className="emptySearchLabel">
            <span className="empty-icon" aria-hidden="true">
                <HistoryIcon />
            </span>
            <h3>{getLocaleMessage("searchHistoryLabel")}</h3>
            <p>{getLocaleMessage("emptySearchHistoryLabel")}</p>
        </div>
    );
}