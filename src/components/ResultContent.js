import React from "react";
import { ResultSummary } from "./ResultSummary";
import { WikipediaLink } from "./WikiLink";

/**
 *
 * @description Component to display Wikipedia search result with a link and summary
 * @param {string} text
 * @param {string} title
 * @param {string} url
 * @returns {JSX.Element} Component to display Wikipedia search result with a link and summary
 */
export function ResultContent({ text, title }) {
  return (
    <>
      <WikipediaLink title={title} />
      <ResultSummary text={text} />
    </>
  );
}
