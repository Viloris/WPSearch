import React from "react";
import CopyButton from "./CopyButton";
import "../styles/resultFooter.scss";

/**
 *
 * @description Component to display a copy button for the given text if it exists, otherwise returns null
 * @param {string} text
 * @returns {JSX.Element} Component to display a copy button for the given text if it exists, otherwise returns null
 */
export function ResultFooter({ text }) {
  if (text) {
    return (
      <div className={"mediaButtons"}>
        <CopyButton text={text} />
      </div>
    );
  }
  return null;
}
