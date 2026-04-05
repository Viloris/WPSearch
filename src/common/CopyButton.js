import React, { useEffect, useState } from "react";
import CopyIcon from "../icons/copy.svg";
import "../styles/CopyButton.scss";
import { getLocaleMessage } from "../common/utils";

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
  const [prevText, setPrevText] = useState(text);

  if (text !== prevText) {
    setPrevText(text);
    setIsCopied(false);
  }

  useEffect(() => {
    if (!isCopied) return;
    const timeoutId = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Copy error", err);
    }
  };

  return (
    <div className="copy">
      {isCopied && <span className="copiedText">{labelCopied}</span>}
      <button className="copyButton" title={buttonCaption} onClick={handleCopy}>
        <CopyIcon />
      </button>
    </div>
  );
}
