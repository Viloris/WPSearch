import log from "loglevel";
import config from "../config.json";
import { getSecondTargetLang, getTargetLang } from "./utils";
import { getSettings } from "../settings/settings";
const logDir = "common/wikisearch";

const { NO_SUMMARY, WIKIPEDIA_API_URL, HTTPS } = config;

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
                resolve({
                    errorMessageMain: result[0].errorMessage,
                    isErrorMain: result[0].isError,
                    resultMain: {
                        text: result[0].resultText,
                        title: result[0].resultTitle,
                        url: result[0].resultUrl
                    },
                    ...(useTheSecondTargetLang && {
                        errorMessageSecond: result[1].errorMessage,
                        isErrorSecond: result[1].isError,
                        resultSecond: {
                            text: result[1].resultText,
                            title: result[1].resultTitle,
                            url: result[1].resultUrl
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
        resultText: "",
        isError: false,
        errorMessage: ""
    };

    if (response.status !== 200) {
        resultData.isError = true;

        if (response.status === 0)
            resultData.errorMessage = browser.i18n.getMessage("networkError");
        else if (response.status === 429 || response.status === 503)
            resultData.errorMessage =
                browser.i18n.getMessage("unavailableError");
        else if (response.status === 404) {
            resultData.resultText = browser.i18n.getMessage("NOT_FOUND");
            resultData.isError = false;
        } else
            resultData.errorMessage = `${browser.i18n.getMessage(
                "unknownError"
            )} [${response.status} ${response.statusText}]`;

        log.error(logDir, "sendRequest()", response);
        return resultData;
    }

    const result = await response.json();
    resultData.resultText =
        result?.extract || result?.description || NO_SUMMARY;
    resultData.resultTitle = result?.title || "-";
    resultData.resultUrl = result?.content_urls?.desktop?.page || NO_SUMMARY;
    log.log(logDir, "sendRequest()", resultData);
    return resultData;
}

export default async (expression) => {
    return handleQuery(expression);
};
