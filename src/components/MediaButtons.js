import React, { useId, useState } from "react";
import log from "loglevel";
import browser from "webextension-polyfill";
import NewWindowIcon from "../icons/open-in-new-window.svg";
import DownloadIcon from "../icons/download-solar.svg";
import ShareIcon from "../icons/share-solar.svg";
import ReadIcon from "../icons/book-solar.svg";
import { getLocaleMessage } from "../common/i18n";

export function ReadFullArticleButton({ fullArticleState, openPopup, openInPopup, language, loadFullArticle, title }) {
    const readMoreLabel = getLocaleMessage("readMoreLabel")
    return (
        <button
            type="button"
            className="resultFooterButton"
            onClick={() => openPopup
                ? openInPopup({ language, title })
                : loadFullArticle(language, title)}
            disabled={fullArticleState?.isLoading}
        >
            <ReadIcon className="resultFooterButtonIcon" />
            {readMoreLabel}
        </button>
    )
}

export function OpenInWikipediaButton({ title, url }) {
    const wikipediaLabel = getLocaleMessage("wikipediaLabel");
    const openInNewWindowLabel = getLocaleMessage("openInNewWindowLabel");
    const openWikipediaLink = () => {
        window.open(url, "_blank");
    }

    return (
        <button
            type="button"
            className="resultFooterButton"
            onClick={() => openWikipediaLink()}
            title={openInNewWindowLabel + ": " + title}
        >
            <NewWindowIcon className="resultFooterButtonIcon" />
            {wikipediaLabel}
        </button>
    )
}

export function MoreResultButton({ openInPopup }) {
    const moreResultsLabel = getLocaleMessage("moreResultsLabel");
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

export function DownloadButton({ title, summary, url }) {
    const [error, setError] = useState("");
    const downloadLabel = getLocaleMessage("downloadLabel");

    return (
        <div className="mediaAction">
            {error && <span className="mediaActionError" role="alert">{error}</span>}
            <button
                type="button"
                className="resultFooterButton"
                onClick={() => {
                    try {
                        const content = [title, summary, url].filter(Boolean).join("\n\n");
                        const file = new Blob([content], { type: "text/plain;charset=utf-8" });
                        const downloadUrl = URL.createObjectURL(file);
                        const link = document.createElement("a");
                        const fileName = (title || "wikipedia-article")
                            .replace(/[<>:"/\\|?*]/g, "-")
                            .split("")
                            .filter((character) => character.charCodeAt(0) >= 32)
                            .join("")
                            .trim() || "wikipedia-article";

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
                        setError(getLocaleMessage("downloadErrorLabel"));
                    }
                }}
            >
                <DownloadIcon className="resultFooterButtonIcon" />
                {downloadLabel}
            </button>
        </div>
    );
}

export function ShareButton({ title, summary, url }) {
    const [isOpen, setIsOpen] = useState(false);
    const [shareError, setShareError] = useState("");
    const optionsId = useId();
    const shareLabel = getLocaleMessage("shareLabel");
    const shareText = title || summary || "";
    const twitterShareUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
        ...(shareText && { text: shareText }),
        ...(url && { url })
    })}`;
    const emailSubject = title || getLocaleMessage("shareLabel");
    const emailBody = [summary, url].filter(Boolean).join("\n\n");
    const emailShareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return (
        <div className="mediaAction">
            <button
                type="button"
                className="resultFooterButton"
                aria-expanded={isOpen}
                aria-controls={optionsId}
                onClick={() => setIsOpen(!isOpen)}
            >
                <ShareIcon className="resultFooterButtonIcon" />
                {shareLabel}
            </button>
            {isOpen && (
                <div className="shareOptions" id={optionsId} role="group" aria-label={shareLabel}>
                    {shareError && <span className="mediaActionError" role="alert">{shareError}</span>}
                    {url && (
                        <a
                            className="resultFooterButton"
                            href={`https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: url })}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Facebook
                        </a>
                    )}
                    <a
                        className="resultFooterButton"
                        href={twitterShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Twitter
                    </a>
                    <button
                        type="button"
                        className="resultFooterButton"
                        onClick={async () => {
                            try {
                                await browser.tabs.create({ url: emailShareUrl, active: true });
                                setIsOpen(false);
                                setShareError("");
                            } catch (error) {
                                log.error("Email share failed", error);
                                setShareError(getLocaleMessage("shareErrorLabel"));
                            }
                        }}
                    >
                        {getLocaleMessage("emailLabel")}
                    </button>
                </div>
            )}
        </div>
    );
}