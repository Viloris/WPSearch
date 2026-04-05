import React from "react";
import { ResultSummary } from "./resultSummary";
import { WikipediaLink } from "./wikiLink";

/**
 *
 * @description Component to display Wikipedia search result with a link and summary
 * @param {string} text
 * @param {string} title
 * @param {string} url
 * @returns {JSX.Element} Component to display Wikipedia search result with a link and summary
 */
export function ResultContent({ text, title, url }) {
  return (
    <>
      <WikipediaLink title={title} url={url} />
      <ResultSummary text={text} />
    </>
  );
}
