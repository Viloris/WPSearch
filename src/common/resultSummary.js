import React from "react";
import { splitLine } from "./utils";

export function ResultSummary({ result }) {
    return (
        <p className="resultText" dir="auto">
            {splitLine(result?.text)}
        </p>
    );
}