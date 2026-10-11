import React from "react";
import { getLocaleMessage } from "../../common/i18n";

export function LoadingCaption() {
    return (
        <p aria-live="polite" className="loadingText">
            {getLocaleMessage("loadingSearchLabel")}
        </p>
    );
}