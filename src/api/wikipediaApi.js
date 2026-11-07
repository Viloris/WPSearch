import browser from "webextension-polyfill";
import log from "loglevel";
import { getLocaleMessage } from "../common/i18n";
import { CONFIG, HTTP_CODES } from "../common/constans";
import { buildWikipediaAPIUrl } from "../common/urlUtils";

const {
    COMMONS_BASE_URL,
    CREATIVECOMMONS_BASE_URL,
    numberDataType,
    protocolHttps,
    stringType,
    WIKIPEDIA_DOMAIN,
    WIKIPEDIA_SEARCH_API_URL,
    WIKIPEDIA_SUMMARY_API_URL,
    WIKIPEDIA_FEATURED_API_URL,
    HTTPS
} = CONFIG;
const { NOT_FOUND, SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } = HTTP_CODES;
const logDir = "common/wikisearch";
const SEARCH_RESULTS_LIMIT = 5;
const FEATURED_FEED_LOOKBACK_DAYS = 7;
const dailyFeaturedArticleRequests = new Map();
const wikiLanguagePattern = /^[a-z0-9-]+$/i;

/**
 * 
 * @description Builds a Wikipedia search API URL for the given expression and language
 * @param {string} language 
 * @param {string} term 
 * @returns {string} URL for Wikipedia search API
 */
const getSearchUrl = (language, term, offset, limit) => {
    return `${HTTPS}${language}${WIKIPEDIA_SEARCH_API_URL}${encodeURIComponent(term)}&srlimit=${limit}&sroffset=${offset}&format=json&origin=*`;
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
    if (!wikiLanguagePattern.test(language)) {
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
    return buildWikipediaAPIUrl(language, params);
};

const getPageParseUrl = (language, title) => {
    if (!wikiLanguagePattern.test(language)) {
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
    return buildWikipediaAPIUrl(language, params);
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
    if (typeof html !== stringType || !html) {
        throw new Error(data?.error?.info || `Full article response is missing content for "${title}"`);
    }

    return html;
}

async function fetchDailyFeaturedArticleFromApi(languageCode, today, todayDate, signal) {
    const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, "/");
    const fetchFeed = async (date) => {
        const url = `${HTTPS}${WIKIPEDIA_FEATURED_API_URL}${languageCode}/featured/${date}`;
        const response = await fetch(url, { signal });
        if (!response.ok) {
            throw new Error(`Featured article request failed with HTTP ${response.status}`);
        }
        return response.json();
    };
    const hasArticleData = (article) =>
        typeof article?.title === stringType &&
        (typeof article?.extract_html === stringType || typeof article?.extract === stringType) &&
        typeof article?.content_urls?.desktop?.page === stringType;
    const data = await fetchFeed(todayDate);
    let latestFeaturedArticle = hasArticleData(data?.tfa)
        ? { article: data.tfa, date: todayDate }
        : null;
    let mostReadArticlesData = Array.isArray(data?.mostread?.articles) &&
        data.mostread.articles.length
        ? data.mostread.articles
        : null;
    let mostReadDate = mostReadArticlesData ? todayDate : "";

    for (let daysAgo = 1;
        daysAgo <= FEATURED_FEED_LOOKBACK_DAYS && (!latestFeaturedArticle || !mostReadArticlesData);
        daysAgo += 1) {
        const pastDate = new Date(today);
        pastDate.setUTCDate(pastDate.getUTCDate() - daysAgo);
        const formattedPastDate = formatDate(pastDate);
        try {
            const pastData = await fetchFeed(formattedPastDate);
            if (!latestFeaturedArticle && hasArticleData(pastData?.tfa)) {
                latestFeaturedArticle = { article: pastData.tfa, date: formattedPastDate };
            }
            if (!mostReadArticlesData &&
                Array.isArray(pastData?.mostread?.articles) &&
                pastData.mostread.articles.length) {
                mostReadArticlesData = pastData.mostread.articles;
                mostReadDate = formattedPastDate;
            }
        } catch (error) {
            if (signal?.aborted) throw error;
            log.warn(logDir, `Failed to load featured feed fallback for ${formattedPastDate}`, error);
            break;
        }
    }

    const featuredArticle = latestFeaturedArticle?.article;
    const mostReadArticle = mostReadArticlesData?.[0];
    const useMostReadFallback = !hasArticleData(featuredArticle) && hasArticleData(mostReadArticle);
    const candidateArticle = useMostReadFallback ? mostReadArticle : featuredArticle;

    const getArticleUrl = (item) => {
        try {
            const url = new URL(item.content_urls.desktop.page);
            return url.protocol === protocolHttps && url.hostname === `${languageCode}${WIKIPEDIA_DOMAIN}`
                ? url.href
                : "";
        } catch {
            return "";
        }
    };
    const candidateArticleUrl = candidateArticle ? getArticleUrl(candidateArticle) : "";
    const article = candidateArticleUrl ? candidateArticle : null;
    const articleUrl = article ? candidateArticleUrl : "";

    const getThumbnailUrl = (item) => {
        if (typeof item?.thumbnail?.source !== stringType) return "";
        try {
            const thumbnail = new URL(item.thumbnail.source);
            if (
                thumbnail.protocol === protocolHttps &&
                ["upload.wikimedia.org", "thumb.wikimedia.org"].includes(thumbnail.hostname)
            ) {
                return thumbnail.href;
            }
        } catch {
            return "";
        }
        return "";
    };

    const didYouKnow = (Array.isArray(data?.dyk) ? data.dyk : [])
        .filter((item) =>
            (typeof item?.html === stringType && item.html) ||
            (typeof item?.text === stringType && item.text)
        )
        .slice(0, 6)
        .map((item) => ({
            html: typeof item.html === stringType ? item.html : "",
            text: typeof item.text === stringType ? item.text : ""
        }));
    const news = (Array.isArray(data?.news) ? data.news : [])
        .filter((item) => typeof item?.story === stringType && item.story)
        .slice(0, 5)
        .map((item) => ({
            story: item.story,
            links: (Array.isArray(item.links) ? item.links : [])
                .map((link) => ({
                    title: typeof link?.title === stringType ? link.title : "",
                    articleUrl: getArticleUrl(link)
                }))
                .filter((link) => link.title)
        }));
    const onThisDay = (Array.isArray(data?.onthisday) ? data.onthisday : [])
        .filter((item) => typeof item?.text === stringType && item.text)
        .slice(0, 8)
        .map((item) => ({
            text: item.text,
            year: typeof item.year === numberDataType || typeof item.year === stringType ? item.year : "",
            articles: (Array.isArray(item.pages) ? item.pages : [])
                .map((page) => ({
                    title: typeof page?.title === stringType ? page.title : "",
                    description:
                        typeof page?.description === stringType ? page.description : "",
                    articleUrl: getArticleUrl(page)
                }))
                .filter((page) => page.title)
        }));

    const sourceMostReadArticles = mostReadArticlesData || [];
    const trendingSource = sourceMostReadArticles[0];
    const trendingArticleUrl = hasArticleData(trendingSource)
        ? getArticleUrl(trendingSource)
        : "";
    const trendingArticle = !useMostReadFallback &&
        trendingSource?.title &&
        trendingArticleUrl &&
        trendingArticleUrl !== articleUrl
        ? {
            title: trendingSource.title,
            description: typeof trendingSource.description === stringType ? trendingSource.description : "",
            extractText: typeof trendingSource.extract === stringType ? trendingSource.extract : "",
            extractHtml:
                typeof trendingSource.extract_html === stringType
                    ? trendingSource.extract_html
                    : trendingSource.extract,
            articleUrl: trendingArticleUrl,
            thumbnailUrl: getThumbnailUrl(trendingSource)
        }
        : null;
    const mostReadArticles = sourceMostReadArticles
        .map((item) => ({
            title: typeof item?.title === stringType ? item.title : "",
            description: typeof item?.description === stringType ? item.description : "",
            articleUrl: getArticleUrl(item)
        }))
        .slice(0, 6)
        .filter((item) =>
            item.title &&
            item.articleUrl &&
            item.articleUrl !== articleUrl &&
            item.articleUrl !== trendingArticleUrl
        )
        .slice(0, 5);

    const image = data?.image;
    let imagePageUrl = "";
    try {
        const url = new URL(image?.file_page);
        if (url.protocol === protocolHttps && url.hostname === COMMONS_BASE_URL) {
            imagePageUrl = url.href;
        }
    } catch {
        imagePageUrl = "";
    }
    let licenseUrl = "";
    try {
        const url = new URL(image?.license?.url);
        if (url.protocol === protocolHttps && url.hostname === CREATIVECOMMONS_BASE_URL) {
            licenseUrl = url.href;
        }
    } catch {
        licenseUrl = "";
    }
    const imageOfDay = imagePageUrl
        ? {
            description: typeof image?.description?.text === stringType ? image.description.text : "",
            thumbnailUrl: getThumbnailUrl(image),
            filePageUrl: imagePageUrl,
            artist: typeof image?.artist?.text === stringType ? image.artist.text : "",
            licenseName:
                typeof image?.license?.type === stringType
                    ? image.license.type
                    : typeof image?.license?.code === stringType
                        ? image.license.code
                        : "",
            licenseUrl
        }
        : null;

    if (!article && !imageOfDay && !didYouKnow.length && !news.length && !onThisDay.length) {
        throw new Error("Featured article response contains no usable content");
    }

    return {
        title: article?.title || "",
        description: typeof article?.description === stringType ? article.description : "",
        extractText: typeof article?.extract === stringType ? article.extract : "",
        extractHtml:
            typeof article?.extract_html === stringType
                ? article.extract_html
                : typeof article?.extract === stringType
                    ? article.extract
                    : "",
        articleUrl,
        thumbnailUrl: article ? getThumbnailUrl(article) : "",
        isFallback: Boolean(article && useMostReadFallback),
        isLatestFeatured: Boolean(
            article &&
            !useMostReadFallback &&
            latestFeaturedArticle?.date !== todayDate
        ),
        mostReadDate,
        trendingArticle,
        mostReadArticles,
        imageOfDay,
        didYouKnow,
        news,
        onThisDay
    };
}

async function loadDailyFeaturedArticle(languageCode, today, todayDate, signal) {
    const cacheKey = `dailyFeaturedArticleCache:${languageCode}`;
    try {
        const stored = await browser.storage.local.get(cacheKey);
        const cached = stored[cacheKey];
        if (cached?.date === todayDate && cached.result && typeof cached.result === "object") {
            return cached.result;
        }
    } catch (error) {
        log.warn(logDir, "Failed to read daily featured article cache", error);
    }

    const result = await fetchDailyFeaturedArticleFromApi(languageCode, today, todayDate, signal);
    try {
        await browser.storage.local.set({
            [cacheKey]: { date: todayDate, result }
        });
    } catch (error) {
        log.warn(logDir, "Failed to save daily featured article cache", error);
    }
    return result;
}

/**
 * Fetches today's Wikipedia feed, using recent feeds when today's article data is unavailable.
 * @param {string} language Wikipedia language code
 * @param {AbortSignal} signal Request cancellation signal
 * @returns {Promise<{title: string, description: string, extractHtml: string, articleUrl: string, thumbnailUrl: string, isFallback: boolean, isLatestFeatured: boolean, mostReadDate: string, trendingArticle: object|null, mostReadArticles: object[], imageOfDay: object|null, didYouKnow: object[], news: object[], onThisDay: object[]}>}
 * Article fields are empty when no usable featured or most-read article is available.
 */
export async function fetchDailyFeaturedArticle(language, signal) {
    if (!wikiLanguagePattern.test(language)) {
        throw new Error(`Invalid Wikipedia language code: ${language}`);
    }

    const languageCode = language.toLowerCase();
    const today = new Date();
    const todayDate = today.toISOString().slice(0, 10).replace(/-/g, "/");
    const requestKey = `${languageCode}/${todayDate}`;
    const existingRequest = dailyFeaturedArticleRequests.get(requestKey);
    if (existingRequest) return existingRequest;

    const request = loadDailyFeaturedArticle(languageCode, today, todayDate, signal);
    dailyFeaturedArticleRequests.set(requestKey, request);
    try {
        return await request;
    } finally {
        dailyFeaturedArticleRequests.delete(requestKey);
    }
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
 * @description Retrieves up to five search result titles for a given language and search term
 * @param {string} language 
 * @param {string} term 
 * @param {number} offset 
 * @returns {Promise<string[]|{errorData: Object}>} Search result titles or a structured error
 */
export async function getSearchResultTitles(language, term, offset = 0, limit = SEARCH_RESULTS_LIMIT) {
    try {
        const response = await fetch(getSearchUrl(language, term, offset, limit));
        if (!response.ok) {
            return { errorData: handleHttpError(response.status, language) };
        }

        const data = await response.json();
        if (!Array.isArray(data?.query?.search)) {
            throw new Error("Search API response is missing search results");
        }

        return data.query.search
            .slice(0, limit)
            .map((item) => item?.title)
            .filter((title) => typeof title === stringType && title);
    } catch (err) {
        log.error(`${logDir} - Search API error: `, err);
        return {
            errorData: {
                isError: true,
                errorMessage: `${getLocaleMessage("networkError")} (${language})`
            }
        };
    }
}

/**
 * Retrieves the canonical Wikipedia title for a given page title.
 * @param {string} language
 * @param {string} title
 * @returns {Promise<string|null>} Canonical title or null if not found
 */
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
