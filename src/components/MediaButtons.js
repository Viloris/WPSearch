import React from "react";
import NewWindowIcon from "../icons/open-in-new-window.svg";
// import ShareIcon from "../icons/share-solar.svg";
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

/* export function ShareButton({ title, summary }) {
    const moreResultsLabel = getLocaleMessage("shareLabel");
    return (
        <button
            type="button"
            className="resultFooterButton"
            onClick={() => { }}
        >
            <ShareIcon />
            {moreResultsLabel}
        </button>
    )
} */