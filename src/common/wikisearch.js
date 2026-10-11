import log from "loglevel";
import { getLocaleMessage, getSecondTargetLang, getTargetLang } from "./i18n";
import { getSettings } from "../settings/settings";
import { CONFIG } from "./constans";
import { fetchWikiSummary, getFirstSearchResultTitle, handleHttpError } from "../api/wikipediaApi";

const { DASH, NO_SUMMARY } = CONFIG;
const logDir = "common/wikisearch";

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
    const articleTitle = data.title || title;
    const articleUrl =
      data.content_urls?.desktop?.page ||
      `https://${language}.wikipedia.org/wiki/${encodeURIComponent(
        articleTitle.replace(/ /g, "_")
      )}`;

    return {
      ...result,
      text: data.extract || data.description || NO_SUMMARY,
      title: articleTitle,
      url: articleUrl
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
async function wikisearch(expression) {
  const trimmed = expression?.trim();
  if (!trimmed) return [];

  try {
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
  } catch (e) {
    log.error(`${logDir} - Search error for "${trimmed}":`, e);
    return [];
  }
}

export default wikisearch;