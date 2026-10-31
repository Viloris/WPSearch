import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import CONFIG from "../../../config.json"

const { ENTER, SPACE_CHAR } = CONFIG;

export function FavoriteItem({ language, loadFullArticle, onSelect, summary, title, wikipedia }) {
    const readFullArticleLabel = getLocaleMessage("readFullArticleLabel");
    const allowedKeys = [ENTER, SPACE_CHAR];

    const handleFavoriteAction = () => {
        title ? loadFullArticle(language, title) : onSelect(summary);
    };

    const handleKeyPress = (event) => {
        if (allowedKeys.includes(event.key)) {
            event.preventDefault();
            handleFavoriteAction();
        }
    };

    return (
        <div
            className="favorite-info"
            onClick={handleFavoriteAction}
            onKeyDown={handleKeyPress}
            role="button"
            tabIndex={0}
            title={readFullArticleLabel}
        >
            <div className="favorite-text">
                {wikipedia && <FavoriteHeader wikipedia={wikipedia} />}
                {title && <FavoriteTitle title={title} />}
                <FavoriteSumamry summary={summary} />
            </div>
        </div>
    )

}

function FavoriteSumamry({ summary }) {
    return <span className="favorite-summary">{summary}</span>;
}

function FavoriteTitle({ title }) {
    return <span className="favorite-title">{title}</span>;
}

function FavoriteHeader({ wikipedia }) {
    return <span className="favorite-wikipedia">{wikipedia}</span>;
}
