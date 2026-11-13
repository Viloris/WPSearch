import React, { useEffect, useId, useRef, useState } from "react";
import log from "loglevel";
import NewWindowIcon from "../icons/open-in-new-window.svg";
import DownloadIcon from "../icons/download-solar.svg";
import ShareIcon from "../icons/share-solar.svg";
import ReadIcon from "../icons/book-solar.svg";
import { getLocaleMessage } from "../common/i18n";
import { createFacebookShareLink, createTwitterShareLink } from "../common/urlUtils";
import { createEmailShareTab, openWikipediaLink } from "../common/openUrl";
import { generateEmailBody, generateEmailShareLink, generateEmailSubject } from "../common/emailUtils";

export function ReadFullArticleButton({ fullArticleState, openPopup, openInPopup, language, loadFullArticle, title, getMessage = getLocaleMessage }) {
    const readMoreLabel = getMessage("readMoreLabel")
    return (
        <button
            type="button"
            className="resultFooterButton"
            onClick={() => loadFullArticle
                ? loadFullArticle(language, title)
                : openPopup && openInPopup({ language, title })}
            disabled={fullArticleState?.isLoading}
        >
            <ReadIcon className="resultFooterButtonIcon" />
            {readMoreLabel}
        </button>
    )
}

export function OpenInWikipediaButton({ title, url, getMessage = getLocaleMessage }) {
    const wikipediaLabel = getMessage("wikipediaLabel");
    const openInNewWindowLabel = getMessage("openInNewWindowLabel");
    /* const openWikipediaLink = () => {
        window.open(url, "_blank");
    } */

    return (
        <button
            type="button"
            className="resultFooterButton"
            onClick={() => openWikipediaLink(url)}
            title={openInNewWindowLabel + ": " + title}
        >
            <NewWindowIcon className="resultFooterButtonIcon" />
            {wikipediaLabel}
        </button>
    )
}

export function MoreResultButton({ openInPopup, getMessage = getLocaleMessage }) {
    const moreResultsLabel = getMessage("moreResultsLabel");
    return (
        <button
            type="button"
            className="resultFooterButton"
            onClick={() => openInPopup()}
        >
            {moreResultsLabel}
        </button>
    )
}

export function DownloadButton({ title, summary, url, getMessage = getLocaleMessage, iconOnly = false, disabled = false }) {
    const [error, setError] = useState("");
    const downloadLabel = getMessage("downloadLabel");
    function sanitizeTitle() {
        return (title || "wikipedia-article")
            .replace(/[<>:"/\\|?*]/g, "-")
            .split("")
            .filter((character) => character.charCodeAt(0) >= 32)
            .join("")
            .trim() || "wikipedia-article";
    }

    return (
        <div className="mediaAction">
            {error && <span className="mediaActionError" role="alert">{error}</span>}
            <button
                type="button"
                className="resultFooterButton"
                aria-label={iconOnly ? downloadLabel : undefined}
                title={iconOnly ? downloadLabel : undefined}
                disabled={disabled}
                onClick={() => {
                    try {
                        const content = [title, summary, url].filter(Boolean).join("\n\n");
                        const file = new Blob([content], { type: "text/plain;charset=utf-8" });
                        const downloadUrl = URL.createObjectURL(file);
                        const link = document.createElement("a");
                        const fileName = sanitizeTitle();
                        link.href = downloadUrl;
                        link.download = `${fileName}.txt`;
                        try {
                            document.body.appendChild(link);
                            link.click();
                        } finally {
                            link.remove();
                            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
                        }
                        setError("");
                    } catch (downloadError) {
                        log.error("Download failed", downloadError);
                        setError(getMessage("downloadErrorLabel"));
                    }
                }}
            >
                <DownloadIcon className="resultFooterButtonIcon" />
                {!iconOnly && downloadLabel}
            </button>
        </div>
    );
}

function renderShareLink(url, title) {
    return (
        <a
            className="resultFooterButton"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
        >
            {title}
        </a>
    );
}

function renderEmailShareButton(onClick, getMessage) {
    return (
        <button
            type="button"
            className="resultFooterButton"
            onClick={onClick}
        >
            {getMessage("emailLabel")}
        </button>
    );
}

/* function renderTwitterShareLink(twitterShareUrl) {
    return <a
        className="resultFooterButton"
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
    >
        Twitter
    </a>;
} */


export function ShareButton({ title, summary, url, getMessage = getLocaleMessage, iconOnly = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [shareError, setShareError] = useState("");
    const shareRef = useRef(null);
    const optionsId = useId();
    const shareLabel = getMessage("shareLabel");
    const shareText = title || summary || "";
    const twitterShareUrl = createTwitterShareLink(shareText, url);
    const facebookShareUrl = createFacebookShareLink(url);
    const emailSubject = generateEmailSubject(title);
    const emailBody = generateEmailBody(summary, url);
    const emailShareUrl = generateEmailShareLink(emailSubject, emailBody);

    function onClick() {
        createEmailShareTab(emailShareUrl, setIsOpen, setShareError)();
    }
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleOutsideClick = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [isOpen]);

    return (
        <div className="mediaAction" ref={shareRef}>
            <button
                type="button"
                className="resultFooterButton"
                aria-label={iconOnly ? shareLabel : undefined}
                title={iconOnly ? shareLabel : undefined}
                aria-expanded={isOpen}
                aria-controls={optionsId}
                onClick={() => setIsOpen(!isOpen)}
            >
                <ShareIcon className="resultFooterButtonIcon" />
                {!iconOnly && shareLabel}
            </button>
            {isOpen && (
                <div className="shareOptions" id={optionsId} role="group" aria-label={shareLabel}>
                    {shareError && <span className="mediaActionError" role="alert">{shareError}</span>}
                    {url && renderShareLink(facebookShareUrl, "Facebook")}
                    {renderShareLink(twitterShareUrl, "Twitter")}
                    {renderEmailShareButton(onClick, getMessage)}
                </div>
            )}
        </div>
    );
}
