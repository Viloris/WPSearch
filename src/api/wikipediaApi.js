import log from "loglevel";
import { getLocaleMessage } from "../common/i18n";
import { CONFIG, HTTP_CODES } from "../common/constans";

const {
    WIKIPEDIA_API_URL,
    WIKIPEDIA_SUMMARY_API_URL,
    WIKIPEDIA_FEATURED_API_URL,
    HTTPS
} = CONFIG;
const { NOT_FOUND, SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } = HTTP_CODES;
const logDir = "common/wikisearch";

/**
 * 
 * @description Main function to handle Wikipedia search queries, which retrieves the first search result title for the given expression and target languages,
 * @param {string} language 
 * @param {string} term 
 * @returns {string} URL for Wikipedia search API
 */
const getSearchUrl = (language, term) => {
    return `${HTTPS}${language}${WIKIPEDIA_API_URL}${encodeURIComponent(term)}&format=json&origin=*`;
}

/**
 * 
 * @description Retrieves the title of the first search result for a given language and search term, or null if not found or an error occurs
 * @param {string} language 
 * @param {string} title 
 * @returns {string} URL for Wikipedia summary API
 */
const getSummaryUrl = (language, title) => {
    const cleanTitle = title.trim().replace(/ /g, "_");
    return `${HTTPS}${language}${WIKIPEDIA_SUMMARY_API_URL}${encodeURIComponent(cleanTitle)}`;
};

const getPageQueryUrl = (language, title, extraParams = {}) => {
    if (!/^[a-z0-9-]+$/i.test(language)) {
        throw new Error(`Invalid Wikipedia language code: ${language}`);
    }

    const params = new URLSearchParams({
        action: "query",
        titles: title,
        redirects: "1",
        format: "json",
        formatversion: "2",
        origin: "*",
        ...extraParams
    });
    return `${HTTPS}${language}.wikipedia.org/w/api.php?${params}`;
};

const getPageParseUrl = (language, title) => {
    if (!/^[a-z0-9-]+$/i.test(language)) {
        throw new Error(`Invalid Wikipedia language code: ${language}`);
    }

    const params = new URLSearchParams({
        action: "parse",
        page: title,
        prop: "text",
        format: "json",
        formatversion: "2",
        origin: "*"
    });
    return `${HTTPS}${language}.wikipedia.org/w/api.php?${params}`;
};

/**
 * 
 * @description Fetches the Wikipedia summary for a given language and title, 
 * handling HTTP errors and network issues, 
 * and returns an object containing the summary text, title, 
 * URL, and error information if applicable
 * @param {string} language 
 * @param {string} title 
 * @returns {Promise<Response>} Summary API response
 */
export async function fetchWikiSummary(language, title) {
    const url = getSummaryUrl(language, title);
    return await fetch(url);
}

/**
 * Fetches the fully rendered HTML for a Wikipedia article.
 * @param {string} language Wikipedia language code
 * @param {string} title Article title
 * @returns {Promise<string>} Full article HTML
 */
export async function fetchWikiFullArticle(language, title) {
    const url = getPageParseUrl(language, title);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Full article request failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    const html = data?.parse?.text;
    if (typeof html !== "string" || !html) {
        throw new Error(data?.error?.info || `Full article response is missing content for "${title}"`);
    }

    return html;
}

/**
 * Fetches today's featured article from Wikimedia's Feed API.
 * @param {string} language Wikipedia language code
 * @param {AbortSignal} signal Request cancellation signal
 * @returns {Promise<{title: string, description: string, extractHtml: string, articleUrl: string, thumbnailUrl: string, isFallback: boolean}>}
 */
export async function fetchDailyFeaturedArticle(language, signal) {
    if (!/^[a-z0-9-]+$/i.test(language)) {
        throw new Error(`Invalid Wikipedia language code: ${language}`);
    }

    const languageCode = language.toLowerCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
    const url = `${HTTPS}${WIKIPEDIA_FEATURED_API_URL}${languageCode}/featured/${date}`;
    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`Featured article request failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    const featuredArticle = data?.tfa;
    const mostReadArticle = data?.mostread?.articles?.[0];
    const hasArticleData = (article) =>
        typeof article?.title === "string" &&
        (typeof article?.extract_html === "string" || typeof article?.extract === "string") &&
        typeof article?.content_urls?.desktop?.page === "string";
    const useMostReadFallback = !hasArticleData(featuredArticle);
    const article = useMostReadFallback ? mostReadArticle : featuredArticle;

    if (!hasArticleData(article)) {
        throw new Error("Featured article response is missing required article data");
    }

    const getArticleUrl = (item) => {
        try {
            const url = new URL(item.content_urls.desktop.page);
            return url.protocol === "https:" && url.hostname === `${languageCode}.wikipedia.org`
                ? url.href
                : "";
        } catch {
            return "";
        }
    };
    const articleUrl = getArticleUrl(article);
    if (!articleUrl) {
        throw new Error("Featured article response contains an invalid article URL");
    }

    const getThumbnailUrl = (item) => {
        if (typeof item?.thumbnail?.source !== "string") return "";
        try {
            const thumbnail = new URL(item.thumbnail.source);
            if (
                thumbnail.protocol === "https:" &&
                ["upload.wikimedia.org", "thumb.wikimedia.org"].includes(thumbnail.hostname)
            ) {
                return thumbnail.href;
            }
        } catch {
            return "";
        }
        return "";
    };

    const mostReadArticles = (Array.isArray(data?.mostread?.articles)
        ? data.mostread.articles
        : [])
        .map((item) => ({
            title: typeof item?.title === "string" ? item.title : "",
            description: typeof item?.description === "string" ? item.description : "",
            articleUrl: getArticleUrl(item)
        }))
        .slice(0, 6)
        .filter((item) => item.title && item.articleUrl && item.articleUrl !== articleUrl)
        .slice(0, 5);

    const image = data?.image;
    let imagePageUrl = "";
    try {
        const url = new URL(image?.file_page);
        if (url.protocol === "https:" && url.hostname === "commons.wikimedia.org") {
            imagePageUrl = url.href;
        }
    } catch {
        imagePageUrl = "";
    }
    let licenseUrl = "";
    try {
        const url = new URL(image?.license?.url);
        if (url.protocol === "https:" && url.hostname === "creativecommons.org") {
            licenseUrl = url.href;
        }
    } catch {
        licenseUrl = "";
    }
    const imageOfDay = imagePageUrl
        ? {
            description: typeof image?.description?.text === "string" ? image.description.text : "",
            thumbnailUrl: getThumbnailUrl(image),
            filePageUrl: imagePageUrl,
            artist: typeof image?.artist?.text === "string" ? image.artist.text : "",
            licenseName:
                typeof image?.license?.type === "string"
                    ? image.license.type
                    : typeof image?.license?.code === "string"
                        ? image.license.code
                        : "",
            licenseUrl
        }
        : null;

    return {
        title: article.title,
        description: typeof article.description === "string" ? article.description : "",
        extractHtml: typeof article.extract_html === "string" ? article.extract_html : article.extract,
        articleUrl,
        thumbnailUrl: getThumbnailUrl(article),
        isFallback: useMostReadFallback,
        mostReadArticles,
        imageOfDay
    };
}

/**
 * 
 * @description Handles HTTP errors for Wikipedia API requests, returning an appropriate error message and isError flag
 * @param {number} status 
 * @param {string} language 
 * @returns {Object} Error message and isError flag
 */
export function handleHttpError(status, language) {
    log.error(`${logDir} - HTTP Error [${status}] for ${language}`);

    if (status === NOT_FOUND) {
        return { text: getLocaleMessage("notFound"), isError: false };
    }

    const isThrottled = [SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS].includes(status);
    let errorMessage = getLocaleMessage(isThrottled ? "unavailableError" : "unknownError");
    if (!isThrottled) errorMessage += ` [${status}]`;

    return { errorMessage, isError: true };
}

/**
 * 
 * @description Retrieves the title of the first search result for a given language and search term, or null if not found or an error occurs
 * @param {string} language 
 * @param {string} term 
 * @returns {Promise<string|null>} Title of the first search result or null if not found
 */
export async function getFirstSearchResultTitle(language, term) {
    try {
        const response = await fetch(getSearchUrl(language, term));
        if (!response.ok) return null;

        const data = await response.json();
        return data?.query?.search?.[0]?.title || null;
    } catch (err) {
        log.error(`${logDir} - Search API error: `, err);
        return null;
    }
}

export async function getWikipediaTitle(language, title) {
    try {
        const response = await fetch(getPageQueryUrl(language, title));
        if (!response.ok) return null;

        const data = await response.json();
        return data?.query?.pages?.[0]?.title || null;
    } catch (err) {
        log.error(`${logDir} - Wikipedia title fetch error: `, err);
        return null;
    }
}

/**
 * 
 * @description Retrieves the title of the first search result for a given language and search term, or null if not found or an error occurs
 * @param {string} language 
 * @param {string} term 
 * @returns {Promise<string|null>} Title of the first search result or null if not found
 */
export async function getFirst10SearchResultTitle(language, term) {
    try {
        const response = await fetch(getSearchUrl(language, term));
        if (!response.ok) return null;

        const data = await response.json();
        return data?.query?.search?.filter((_, i) => i < 10).map((item) => item.title) || null;
    } catch (err) {
        log.error(`${logDir} - Search API error: `, err);
        return null;
    }
}