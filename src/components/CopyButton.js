import React, { useEffect, useState } from "react";
import log from "loglevel";
import CopyIcon from "../icons/copy-solar.svg";
import "../styles/CopyButton.scss";
import { getLocaleMessage } from "../common/i18n";

const labelCopied = getLocaleMessage("copiedLabel");
const buttonCaption = getLocaleMessage("copyLabel");

/**
 *
 * @description Component to display a copy button for the given text, which allows users to copy the text to their clipboard and provides visual feedback when the text has been copied successfully
 * @param {string} text
 * @returns {JSX.Element} Copy button with copied state
 */
export default function CopyButton({ text }) {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [copiedForText, setCopiedForText] = useState("");

  useEffect(() => {
    if (!isCopied) return;
    const timeoutId = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedForText(text);
      setIsCopied(true);
      setCopyError("");
    } catch (err) {
      log.error("Copy failed", err);
      setCopyError("A másolás nem sikerült. Próbáld újra, vagy engedélyezd a vágólaphoz való hozzáférést.");
    }
  };

  return (
    <div className="copy">
      {isCopied && copiedForText === text && (
        <span className="copiedText">{labelCopied}</span>
      )}
      {copyError && <span className="copyError">{copyError}</span>}
      <button className="copyButton" title={buttonCaption} onClick={handleCopy}>
        <CopyIcon />
      </button>
    </div>
  );
}
