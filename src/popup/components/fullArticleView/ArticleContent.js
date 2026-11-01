import React from "react";
import { sanitizeExtractHtml } from "../../../common/htmlUtils";
import { getLocaleMessage } from "../../../common/i18n";

export function ArticleContent({ contentRef, handleContentClick, fullArticleState, language }) {

    const loadingLabel = getLocaleMessage("loadingFullArticleLabel");
    const errorLabel = fullArticleState?.error || getLocaleMessage("unknownError");
    return (
        <div
            className="fullArticleView-content"
            ref={contentRef}
            onClick={handleContentClick}
        >
            {fullArticleState?.isLoading ? (
                <p>{loadingLabel}</p>
            ) : fullArticleState?.html ? (
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitizeExtractHtml(fullArticleState.html, language.toLowerCase(), true)
                    }}
                />
            ) : (
                <p role="alert">{errorLabel}</p>
            )}
        </div>
    )
}