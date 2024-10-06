import log from "loglevel";
import config from "../config.json";
import { getSecondTargetLang, getTargetLang } from "./utils";
import { getSettings } from "../settings/settings";
const logDir = "common/wikisearch";

const { DASH, NO_SUMMARY, WIKIPEDIA_API_URL, HTTPS, NOT_FOUND } = config;

function handleQuery(textValue) {
    const expression = textValue.trim();
    const targetLang = getTargetLang();
    const secondTargetLang = getSecondTargetLang();
    const query_main = getWikipediaExtract(targetLang, expression);
    const useTheSecondTargetLang = getSettings("shouldUseSecondTargetLang");
    const query_second = useTheSecondTargetLang
        ? getWikipediaExtract(secondTargetLang, expression)
        : null;

    const queryArray = [query_main].concat(query_second);
    return new Promise((resolve, reject) => {
        Promise.all(queryArray)
            .then((result) => {
                const MAIN = result[0];
                const SECOND = result[1];
                resolve({
                    errorMessageMain: MAIN.errorMessage,
                    isErrorMain: MAIN.isError,
                    resultMain: {
                        text: MAIN.text,
                        title: MAIN.title,
                        url: MAIN.url
                    },
                    ...(useTheSecondTargetLang &&
                    {
                        errorMessageSecond: SECOND.errorMessage,
                        isErrorSecond: SECOND.isError,
                        resultSecond: {
                            text: SECOND.text,
                            title: SECOND.title,
                            url: SECOND.url
                        }
                    })
                });
            })
            .catch((error) => reject(error));
    });
}

async function getWikipediaExtract(language, expression) {
    const url = `${HTTPS}${language}${WIKIPEDIA_API_URL}${expression}`;
    const response = await fetch(url).catch((e) => ({
        status: 0,
        statusText: ""
    }));

    const resultData = {
        text: "",
        isError: false,
        errorMessage: ""
    };

    if (response.status !== 200) {
        const UNAVAILABLE_ERROR = browser.i18n.getMessage("unavailableError");
        const NOTFOUND_RESPONSE = browser.i18n.getMessage(NOT_FOUND);
        const NETWORK_ERROR = browser.i18n.getMessage("networkError");
        const UNKNOWN_ERROR = `${browser.i18n.getMessage("unknownError")} [${response.status} ${response.statusText}]`;
        resultData.isError = true;

        if (response.status === 0) resultData.errorMessage = NETWORK_ERROR;
        else if ([429, 503].includes(response.status)) resultData.errorMessage = UNAVAILABLE_ERROR;
        else if (response.status === 404) {
            resultData.isError = false;
            resultData.text = NOTFOUND_RESPONSE;
        } else
            resultData.errorMessage = UNKNOWN_ERROR;
        log.error(logDir, "sendRequest()", response);
        return resultData;
    }

    const result = await response.json();
    const { content_urls, description, extract, title } = result;
    resultData.text = extract || description || NO_SUMMARY;
    resultData.title = title || DASH;
    resultData.url = content_urls?.desktop?.page;
    log.log(logDir, "sendRequest()", resultData);
    return resultData;
}

export default async (expression) => {
    return handleQuery(expression);
};
