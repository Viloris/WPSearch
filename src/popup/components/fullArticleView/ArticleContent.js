import React from "react";
import { sanitizeExtractHtml } from "../../../common/htmlUtils";
import { getLocaleMessage } from "../../../common/i18n";

export function ArticleContent({ contentRef, handleContentClick, fullArticleState, language }) {

    return (
        <div
            className="fullArticleView-content"
            ref={contentRef}
            onClick={handleContentClick}
        >
            {fullArticleState?.isLoading ? (
                <p>{getLocaleMessage("loadingFullArticleLabel")}</p>
            ) : fullArticleState?.html ? (
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitizeExtractHtml(fullArticleState.html, language.toLowerCase(), true)
                    }}
                />
            ) : (
                <p role="alert">{fullArticleState?.error || getLocaleMessage("unknownError")}</p>
            )}
        </div>
    )
}