import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import CopyIcon from "../icons/copy.svg";
import "../styles/CopyButton.scss";

const labelCopied = browser.i18n.getMessage("copiedLabel");
const buttonCaption = browser.i18n.getMessage("copyLabel");

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
            console.error("Másolási hiba", err);
        }
    };
    return (
        <div className="copy">
            {isCopied && (
                <span className="copiedText">
                    {labelCopied}
                </span>
            )}
            <button
                className="copyButton"
                title={buttonCaption}
                onClick={handleCopy}
            >
                <CopyIcon />
            </button>
        </div>
    );
}
