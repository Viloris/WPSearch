import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function EmptySearchLabel() {
    return (
        <p className="emptySearchLabel">
            {getLocaleMessage("emptySearchLabel")}
        </p>
    );
}