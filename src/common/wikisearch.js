import log from "loglevel";
import { getLocaleMessage, getSecondTargetLang, getTargetLang } from "./i18n";
import { getSettings } from "../settings/settings";
import { CONFIG } from "./constans";
import { fetchWikiSummary, getSearchResultTitles, handleHttpError } from "../api/wikipediaApi";

const { DASH, NO_SUMMARY } = CONFIG;
const logDir = "common/wikisearch";

/**
 * 
 * @description Retrieves the Wikipedia extract for a given language and title, handling various error scenarios and returning a structured result object
 * @param {string} language 
 * @param {string} title 
 * @returns {Promise<Object>} Search result object
 */
async function getWikipediaExtract(language, title) {
  const result = {
    lang: language,
    text: NO_SUMMARY,
    title: title || DASH,
    url: "",
    isError: false,
    errorMessage: ""
  };

  try {
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
      text: data.extract?.trim() || data.description?.trim() || NO_SUMMARY,
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

async function getWikipediaExtracts(language, expression) {
  const titles = await getSearchResultTitles(language, expression);
  if (!Array.isArray(titles)) {
    return [{
      lang: language,
      text: NO_SUMMARY,
      title: expression || DASH,
      url: "",
      ...titles.errorData
    }];
  }

  if (titles.length === 0) {
    return [{
      lang: language,
      text: getLocaleMessage("notFound"),
      title: expression || DASH,
      url: "",
      isError: false,
      errorMessage: ""
    }];
  }

  return Promise.all(titles.map((title) => getWikipediaExtract(language, title)));
}

/**
 * 
 * @description Main function to handle Wikipedia search queries, retrieving up to five results for each target language
 * @param {string} expression 
 * @returns {Promise<Array>} Search result objects, with up to five per target language
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
      Array.from(langSet).map((lang) => getWikipediaExtracts(lang, trimmed))
    );
    const flattenedResults = results.flat();

    log.debug(`${logDir} - Search results for "${trimmed}":`, flattenedResults);
    return flattenedResults;
  } catch (e) {
    log.error(`${logDir} - Search error for "${trimmed}":`, e);
    return [];
  }
}

export default wikisearch;