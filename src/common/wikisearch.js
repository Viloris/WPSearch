import log from "loglevel";
import config from "../config.json";
import { getLocaleMessage, getSecondTargetLang, getTargetLang } from "./utils";
import { getSettings } from "../settings/settings";
import httpCodes from "./httpCodes.json";

const { DASH, NO_SUMMARY, WIKIPEDIA_API_URL, HTTPS } = config;
const { NOT_FOUND, SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } = httpCodes;
const logDir = "common/wikisearch";

/**
 *
 * @param {string} language
 * @param {string} expression
 * @returns {Promise<{errorMessage: string, isError: boolean, lang: string, text: string, title: string, url: string}>}
 */
async function getWikipediaExtract(language, expression) {
  const url = `${HTTPS}${language}${WIKIPEDIA_API_URL}${encodeURIComponent(expression)}`;

  const result = {
    lang: language,
    text: NO_SUMMARY,
    title: expression || DASH,
    url: "",
    isError: false,
    errorMessage: ""
  };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const status = response.status;
      log.error(`${logDir} - HTTP Error [${status}] for ${language}:`, url);

      if (status === NOT_FOUND) {
        result.text = getLocaleMessage("notFound");
      } else {
        result.isError = true;
        const isThrottled = [SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS].includes(
          status
        );
        result.errorMessage = getLocaleMessage(
          isThrottled ? "unavailableError" : "unknownError"
        );
        if (!isThrottled) result.errorMessage += ` [${status}]`;
      }
      return result;
    }

    const data = await response.json();

    return {
      ...result,
      text: data.extract || data.description || NO_SUMMARY,
      title: data.title || expression,
      url: data.content_urls?.desktop?.page || ""
    };
  } catch (e) {
    log.error(`${logDir} - Network Error for ${language}:`, e);
    return {
      ...result,
      isError: true,
      errorMessage: getLocaleMessage("networkError") + language + expression
    };
  }
}

/**
 *
 * @param {string} expression
 * @returns {Promise<array>}
 */
async function handleQuery(expression) {
  const trimmed = expression?.trim();
  if (!trimmed) return [];

  const langSet = new Set([getTargetLang()]);

  if (getSettings("shouldUseSecondTargetLang")) {
    const second = getSecondTargetLang();
    if (second) langSet.add(second);
  }

  /* You can add more languages:
        if (getSettings("useThirdLang")) langSet.add(getThirdTargetLang());
    */

  const languages = Array.from(langSet);

  const results = await Promise.all(
    languages.map((lang) => getWikipediaExtract(lang, trimmed))
  );

  log.debug(`${logDir} - Search results for "${trimmed}":`, results);

  return results;
}

export default handleQuery;
