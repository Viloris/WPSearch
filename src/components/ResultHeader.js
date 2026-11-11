import React from "react";

/**
 *
 * @description Component to display the Wikipedia language name as a header for search results
 * @param {string} wikipedia
 * @returns {JSX.Element} Component to display the Wikipedia language name as a header for search results
 */
export function ResultHeader({ wikipedia }) {
  return (
    <section
      style={{ padding: "0em 1em 0em 0.5em" }}
    >
      <h3 style={{ margin: 0, fontWeight: 600, color: "var(--main-text)" }}>{wikipedia}</h3>
    </section>
  );
}
