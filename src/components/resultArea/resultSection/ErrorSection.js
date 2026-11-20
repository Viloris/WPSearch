import React from "react";

/**
 *
 * @description Component to display an error message section with the provided message, styled with the "error" class for visual emphasis
 * @param {string} message
 * @returns {JSX.Element} Error message section
 */
export function ErrorSection({ message }) {
  return <p className="error">{message}</p>;
}
