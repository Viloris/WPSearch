import React from "react";
import AddToFavoritesButton from "./AddToFavoritesButton";
import CopyButton from "./CopyButton";
import {
    DownloadButton,
    MoreResultButton,
    OpenInWikipediaButton,
    ReadFullArticleButton,
    ShareButton
} from "./MediaButtons";

export function FooterActionBar({
    addToFavorites,
    fullArticleState,
    getMessage,
    hasMatchingArticle,
    isSaved,
    language,
    loadFullArticle,
    messageLanguage,
    openInPopup,
    openPopup,
    removeFromFavorites,
    searchExpression,
    title,
    text,
    url,
    wikipedia,
}) {
    return (
        <div className={"mediaButtons"} lang={messageLanguage}>
            {openPopup && searchExpression && (
                <MoreResultButton
                    openInPopup={openInPopup}
                    getMessage={getMessage}
                />
            )}
            {hasMatchingArticle && (
                <>
                    <ReadFullArticleButton
                        fullArticleState={fullArticleState}
                        openPopup={openPopup}
                        language={language}
                        loadFullArticle={loadFullArticle}
                        title={title}
                        getMessage={getMessage}
                    />
                    <OpenInWikipediaButton
                        title={title}
                        url={url}
                        getMessage={getMessage}
                    />
                    <AddToFavoritesButton
                        className="resultFooterButton"
                        text={text}
                        addToFavorites={addToFavorites}
                        removeFromFavorites={removeFromFavorites}
                        wikipedia={wikipedia}
                        title={title}
                        url={url}
                        isSaved={isSaved}
                        getMessage={getMessage}
                    />
                </>
            )}
            <CopyButton
                className="resultFooterButton"
                text={text}
                getMessage={getMessage}
            />
            <DownloadButton
                title={title}
                summary={text}
                url={url}
                getMessage={getMessage}
            />
            <ShareButton
                title={title}
                summary={text}
                url={url}
                getMessage={getMessage}
            />
        </div>
    )
}