import log from "loglevel";
import config from "../config.json";
import { getSecondTargetLang, getTargetLang } from "./utils";
import { getSettings } from "../settings/settings";
import browser from "webextension-polyfill";

const { DASH, NO_SUMMARY, WIKIPEDIA_API_URL, HTTPS, NOT_FOUND } = config;

const logDir = "common/wikisearch";

/**
 * @param {string} language
 * @param {string} expression
 * @returns {Promise<{text: string, title: string, url: string, isError: boolean, errorMessage: string}>}
 */
async function getWikipediaExtract(language, expression) {
    const url = `${HTTPS}${language}${WIKIPEDIA_API_URL}${expression}`;

    const resultData = {
        text: "",
        title: DASH,
        url: "",
        isError: false,
        errorMessage: ""
    };

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const status = response.status;
            const UNAVAILABLE_ERROR = browser.i18n.getMessage("unavailableError");
            const NOTFOUND_RESPONSE = browser.i18n.getMessage(NOT_FOUND);
            const UNKNOWN_ERROR = `${browser.i18n.getMessage("unknownError")} [${status} ${response.statusText}]`;

            resultData.isError = true;

            if (status === 404) {
                resultData.isError = false;
                resultData.text = NOTFOUND_RESPONSE;
                resultData.title = expression;
            } else if ([429, 503].includes(status)) {
                resultData.errorMessage = UNAVAILABLE_ERROR;
            } else {
                resultData.errorMessage = UNKNOWN_ERROR;
            }

            log.error(logDir, "getWikipediaExtract() - HTTP Hiba", response);
            return resultData;
        }

        const result = await response.json();
        const { content_urls, description, extract, title } = result;

        resultData.text = extract || description || NO_SUMMARY;
        resultData.title = title || expression;
        resultData.url = content_urls?.desktop?.page || "";

        log.log(logDir, "getWikipediaExtract() - Siker", resultData);
        return resultData;

    } catch (e) {
        const NETWORK_ERROR = browser.i18n.getMessage("networkError");
        resultData.isError = true;
        resultData.errorMessage = NETWORK_ERROR;
        resultData.title = expression;

        log.error(logDir, "getWikipediaExtract() - Hálózati hiba", e);
        return resultData;
    }
}

/**
 * 
 * @param {string} textValue - Search expression
 * @returns {Promise<{mainResult: object, secondResult?: object}>} - Query result
 */
async function handleQuery(textValue) {
    const expression = textValue.trim();
    const targetLang = getTargetLang();
    const useSecondLang = getSettings("shouldUseSecondTargetLang");
    const queryPromises = [
        getWikipediaExtract(targetLang, expression)
    ];

    if (useSecondLang) {
        const secondTargetLang = getSecondTargetLang();
        queryPromises.push(getWikipediaExtract(secondTargetLang, expression));
    }

    const results = await Promise.all(queryPromises);
    const [MAIN, SECOND] = results;
    let response = {
        errorMessageMain: MAIN.errorMessage,
        isErrorMain: MAIN.isError,
        resultMain: {
            text: MAIN.text,
            title: MAIN.title,
            url: MAIN.url
        }
    };

    if (useSecondLang) {
        response = {
            ...response,
            errorMessageSecond: SECOND.errorMessage,
            isErrorSecond: SECOND.isError,
            resultSecond: {
                text: SECOND.text,
                title: SECOND.title,
                url: SECOND.url
            }
        };
    }
    log.log(logDir, response)
    return response;
}

export default async (expression) => {
    return handleQuery(expression);
};