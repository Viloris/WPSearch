import log from "loglevel";
import config from "../config.json";
import { getLocaleMessage, getSecondTargetLang, getTargetLang } from "./utils";
import { getSettings } from "../settings/settings";
import httpCodes from "./httpCodes.json";

const { DASH, NO_SUMMARY, WIKIPEDIA_API_URL, WIKIPEDIA_SUMMARY_API_URL, HTTPS } = config;
const { NOT_FOUND, SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } = httpCodes;
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
 * @description Retrieves the title of the first search result for a given language and search term, or null if not found or an error occurs
 * @param {string} language 
 * @param {string} term 
 * @returns {Promise<string|null>} Title of the first search result or null if not found
 */
async function getFirstSearchResultTitle(language, term) {
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

/**
 * 
 * @description Fetches the Wikipedia summary for a given language and title, handling HTTP errors and network issues, and returns an object containing the summary text, title, URL, and error information if applicable
 * @param {string} language 
 * @param {string} title 
 * @returns {Promise<Response>} Summary API response
 */
async function fetchWikiSummary(language, title) {
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
function handleHttpError(status, language) {
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
 * @description Retrieves the Wikipedia extract for a given language and expression, handling various error scenarios and returning a structured result object
 * @param {string} language 
 * @param {string} expression 
 * @returns {Promise<Object>} Search result object
 */
async function getWikipediaExtract(language, expression) {
  const result = {
    lang: language,
    text: NO_SUMMARY,
    title: expression || DASH,
    url: "",
    isError: false,
    errorMessage: ""
  };

  try {
    const title = await getFirstSearchResultTitle(language, expression);

    if (!title) {
      result.text = getLocaleMessage("notFound");
      return result;
    }

    const response = await fetchWikiSummary(language, title);

    if (!response.ok) {
      const errorData = handleHttpError(response.status, language);
      return { ...result, ...errorData };
    }

    const data = await response.json();

    return {
      ...result,
      text: data.extract || data.description || NO_SUMMARY,
      title: data.title || title,
      url: data.content_urls?.desktop?.page || ""
    };

  } catch (e) {
    log.error(`${logDir} - Network Error for ${language}:`, e);
    return {
      ...result,
      isError: true,
      errorMessage: `${getLocaleMessage("networkError")} (${language})`
    };
  }
}

/**
 * 
 * @description Main function to handle Wikipedia search queries, which retrieves the first search result title for the given expression and target languages,
 * @param {string} expression 
 * @returns {Promise<Array>} Array of search result objects for target languages
 */
async function handleQuery(expression) {
  const trimmed = expression?.trim();
  if (!trimmed) return [];

  const langSet = new Set([getTargetLang()]);
  if (getSettings("shouldUseSecondTargetLang")) {
    const second = getSecondTargetLang();
    if (second) langSet.add(second);
  }

  const results = await Promise.all(
    Array.from(langSet).map((lang) => getWikipediaExtract(lang, trimmed))
  );

  log.debug(`${logDir} - Search results for "${trimmed}":`, results);
  return results;
}

export default handleQuery;