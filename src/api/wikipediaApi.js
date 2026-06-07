import log from "loglevel";
import { getLocaleMessage } from "../common/i18n";
import { CONFIG, HTTP_CODES } from "../common/constans";

const { WIKIPEDIA_API_URL, WIKIPEDIA_SUMMARY_API_URL, HTTPS } = CONFIG;
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

/**
 * 
 * @description Fetches the Wikipedia summary for a given language and title, handling HTTP errors and network issues, and returns an object containing the summary text, title, URL, and error information if applicable
 * @param {string} language 
 * @param {string} title 
 * @returns {Promise<Response>} Summary API response
 */
export async function fetchWikiSummary(language, title) {
    const url = getSummaryUrl(language, title);
    return await fetch(url);
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