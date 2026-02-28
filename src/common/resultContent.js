import React from "react";
import { ResultSummary } from "./resultSummary";
import { WikipediaLink } from "./wikiLink";

/**
 *
 * @param {string} text
 * @param {string} title
 * @param {string} url
 * @returns {JSX.Element}
 */
export function ResultContent({ text, title, url }) {
  return (
    <>
      <WikipediaLink title={title} url={url} />
      <ResultSummary text={text} />
    </>
  );
}
