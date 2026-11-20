import React from "react";
import { getLocaleMessage } from "../../common/i18n";
import { sanitizeExtractHtml } from "../../common/htmlUtils";

export function ArticleBody({ activeArticle, handleArticleClick }) {
    const { isLoading, html, language, error } = activeArticle;
    const defaultErrorText = getLocaleMessage("unknownError");
    const articleLoadingText = getLocaleMessage("loadingFullArticleLabel");

    return (
        <div
            className="resultPanelArticle-content"
            onClick={handleArticleClick}
        >
            {isLoading ? (
                <p>{articleLoadingText}</p>
            ) : html ? (
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitizeExtractHtml(
                            html,
                            language.toLowerCase(),
                            true
                        )
                    }}
                />
            ) : (
                <p role="alert">{error || defaultErrorText}</p>
            )}
        </div>
    )
}