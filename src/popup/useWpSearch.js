import { useCallback } from "react";
import log from "loglevel";
import browser from "webextension-polyfill";
import { recordSearch } from "./handleSearchHistory";
import searchConfig from "./searchHistoryConfig.json";
import { CONFIG } from "../common/constans";

const { SEARCH_LOADING_MIN_DURATION } = searchConfig;
const {
    requestMessages: { WIKIPEDIA_SEARCH }
} = CONFIG;

const logDir = "popup/PopupPage";

export const useWpSearch = ({
    searchHistoryRef,
    setSearchHistory,
    historySearchId,
    historySearchStartedAt,
    loadingTimer,
    setIsLoadingSearch,
    setResults
}) => useCallback(async (expression, isHistorySearch = false, searchId) => {
    log.info(logDir, "wpSearchText()", expression);

    try {
        await recordSearch(
            expression,
            searchHistoryRef,
            setSearchHistory
        );

        const res = await browser.runtime.sendMessage({
            message: WIKIPEDIA_SEARCH,
            expression: expression.replaceAll("\n", "")
        });
        if (historySearchId.current === searchId) {
            setResults(res);
        }
    } finally {
        if (historySearchId.current === searchId && isHistorySearch) {
            const remainingTime = Math.max(
                0,
                SEARCH_LOADING_MIN_DURATION -
                (Date.now() - historySearchStartedAt.current)
            );
            loadingTimer.current = setTimeout(() => {
                if (historySearchId.current === searchId) {
                    setIsLoadingSearch(false);
                }
            }, remainingTime);
        } else if (historySearchId.current === searchId) {
            setIsLoadingSearch(false);
        }
    }
}, [
    historySearchId,
    historySearchStartedAt,
    loadingTimer,
    searchHistoryRef,
    setIsLoadingSearch,
    setResults,
    setSearchHistory
]);