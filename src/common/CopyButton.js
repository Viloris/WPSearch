import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { CopyToClipboard } from "react-copy-to-clipboard";
import CopyIcon from "../icons/copy.svg";
import "../styles/CopyButton.scss";

const labelCopied = browser.i18n.getMessage("copiedLabel");
const buttonCaption = browser.i18n.getMessage("copyLabel");

export default function CopyButton({ text }) {
    const [isCopied, setIsCopied] = useState(false)

    function handleCopy(copiedText) {
        navigator.clipboard.writeText(copiedText);
        setIsCopied(true);
    };

    useEffect(() => setIsCopied(false), [text])

    if (text) return (
        <div className="copy">
            {isCopied && (
                <span className="copiedText">
                    {labelCopied}
                </span>
            )}
            <CopyToClipboard text={text} onCopy={handleCopy}>
                <button
                    className="copyButton"
                    title={buttonCaption}
                >
                    <CopyIcon />
                </button>
            </CopyToClipboard>
        </div>
    );
    return null;
}
