import log from "loglevel";
import config from "../config.json";
import { getLocaleMessage, getSecondTargetLang, getTargetLang } from "./utils";
import { getSettings } from "../settings/settings";
import httpCodes from "./httpCodes.json";

const { DASH, NO_SUMMARY, WIKIPEDIA_API_URL, WIKIPEDIA_SUMMARY_API_URL, HTTPS } = config;
const { NOT_FOUND, SERVICE_UNAVAILABLE, TOO_MANY_REQUESTS } = httpCodes;
const logDir = "common/wikisearch";

const getSearchUrl = (language, term) =>
  `${HTTPS}${language}${WIKIPEDIA_API_URL}${encodeURIComponent(term)}&format=json&origin=*`;

const getSummaryUrl = (language, title) => {
  const cleanTitle = title.trim().replace(/ /g, "_");
  return `${HTTPS}${language}${WIKIPEDIA_SUMMARY_API_URL}${encodeURIComponent(cleanTitle)}`;
};

async function getFirstSearchResultTitle(language, term) {
  try {
    const response = await fetch(getSearchUrl(language, term));
    if (!response.ok) return null;

    const data = await response.json();
    return data?.query?.search?.[0]?.title || null;
  } catch (err) {
    log.error(`${logDir} - Search API error:`, err);
    return null;
  }
}

async function fetchWikiSummary(language, title) {
  const url = getSummaryUrl(language, title);
  return await fetch(url);
}

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