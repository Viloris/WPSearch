import React, { useLayoutEffect, useRef } from "react";
import { sanitizeExtractHtml } from "../../common/htmlUtils";
import { getLocaleMessage } from "../../common/i18n";
import { getWikipediaName } from "../../common/urlUtils";

export function FullArticleView({
    fullArticleState,
    language,
    title,
    articleKey,
    scrollTop,
    canGoBack,
    onBack,
    onNavigateArticle,
    onClose
}) {
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = scrollTop;
        }
    }, [articleKey, fullArticleState?.html, scrollTop]);

    const handleContentClick = (event) => {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !(event.target instanceof Element)
        ) {
            return;
        }

        const anchor = event.target.closest("a[href]");
        if (!anchor) return;

        const articleUrl = new URL(anchor.href);
        const languageCode = language.toLowerCase();
        const articlePath = "/wiki/";
        if (
            articleUrl.origin !== `https://${languageCode}.wikipedia.org` ||
            !articleUrl.pathname.startsWith(articlePath)
        ) {
            return;
        }

        let linkedTitle;
        try {
            linkedTitle = decodeURIComponent(articleUrl.pathname.slice(articlePath.length))
                .replaceAll("_", " ");
        } catch {
            return;
        }
        if (!linkedTitle) return;

        event.preventDefault();
        onNavigateArticle(languageCode, linkedTitle, contentRef.current?.scrollTop || 0);
    };

    return (
        <section className="fullArticleView" aria-label={title}>
            <header className="fullArticleView-header">
                <button
                    className="fullArticleView-back-button"
                    type="button"
                    onClick={onBack}
                    disabled={!canGoBack}
                    aria-label={getLocaleMessage("backFullArticleLabel")}
                    title={getLocaleMessage("backFullArticleLabel")}
                >
                    ←
                </button>
                <div className="fullArticleView-header-text">
                    <a href={fullArticleState?.url} target="_blank" rel="noopener noreferrer"
                        style={{
                            textDecoration: "none"
                        }}>
                        <h2>{title.replaceAll(/_/g, " ")}</h2>
                    </a>
                    <h5>{getWikipediaName(language)}</h5>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={getLocaleMessage("closeFullArticleLabel")}
                    title={getLocaleMessage("closeFullArticleLabel")}
                >
                    ×
                </button>
            </header>
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
                            __html: sanitizeExtractHtml(fullArticleState.html, language.toLowerCase())
                        }}
                    />
                ) : (
                    <p role="alert">{fullArticleState?.error || getLocaleMessage("unknownError")}</p>
                )}
            </div>
        </section>
    );
}