import React from "react";
import {
    DownloadButton,
    MoreResultButton,
    OpenInWikipediaButton,
    ReadFullArticleButton,
    ShareButton
} from "../../actionButtons/MediaButtons";
import AddToFavoritesButton from "../../actionButtons/AddToFavoritesButton";
import CopyButton from "../../actionButtons/CopyButton";

export function FooterActionBar({
    addToFavorites,
    fullArticleState,
    getMessage,
    hasMatchingArticle,
    savedFavorite,
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
                        savedFavorite={savedFavorite}
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
            {openPopup && searchExpression && (
                <MoreResultButton
                    openInPopup={openInPopup}
                    getMessage={getMessage}
                    lang={messageLanguage}
                    wikipedia={wikipedia}
                />
            )}
        </div>
    )
}