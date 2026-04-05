import React from "react";

/**
 *
 * @description Component to display the Wikipedia language name as a header for search results
 * @param {string} wikipedia
 * @returns {JSX.Element} Component to display the Wikipedia language name as a header for search results
 */
export function ResultHeader({ wikipedia }) {
  return (
    <p>
      <strong>{wikipedia}</strong>
    </p>
  );
}
