import React from "react";
import { splitLine } from "./utils";

export function ResultSummary({ text }) {
    return (
        <p className="resultText" dir="auto">
            {splitLine(text)}
        </p>
    );
}