import React, { useLayoutEffect, useRef } from "react";
import CONFIG from "../../config.json"
import { ArticleHeader } from "./fullArticleView/ArticleHeader";
import { ArticleContent } from "./fullArticleView/ArticleContent";

const { ARTICLE_PATH, HTTPS, WIKIPEDIA_DOMAIN } = CONFIG;

export function FullArticleView({
    fullArticleState,
    language,
    title,
    articleKey,
    scrollTop,
    canGoBack,
    onBack,
    onNavigateArticle,
    onClose,
    favorites,
    removeFromFavorites,
    text,
    addToFavorites,
    wikipedia
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
        const formattedUrl = `${HTTPS}${languageCode}${WIKIPEDIA_DOMAIN}`;
        if (
            articleUrl.origin !== formattedUrl ||
            !articleUrl.pathname.startsWith(ARTICLE_PATH)
        ) {
            return;
        }

        let linkedTitle;
        try {
            linkedTitle = decodeURIComponent(articleUrl.pathname.slice(ARTICLE_PATH.length))
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
            <ArticleHeader
                canGoBack={canGoBack}
                fullArticleState={fullArticleState}
                language={language}
                onBack={onBack}
                onClose={onClose}
                title={title}
                favorites={favorites}
                removeFromFavorites={removeFromFavorites}
                text={text}
                addToFavorites={addToFavorites}
                wikipedia={wikipedia}
                url={fullArticleState?.url}
            />
            <ArticleContent
                contentRef={contentRef}
                handleContentClick={handleContentClick}
                fullArticleState={fullArticleState}
                language={language}
            />
        </section>
    );
}