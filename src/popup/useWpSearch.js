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
}) => useCallback(async (expression, isHistorySearch = false, searchId, offset = 0, limit = 5, language) => {
    log.info(logDir, "wpSearchText()", expression);

    try {
        if (offset === 0) {
            await recordSearch(
                expression,
                searchHistoryRef,
                setSearchHistory
            );
        }

        const res = await browser.runtime.sendMessage({
            message: WIKIPEDIA_SEARCH,
            expression: expression.replaceAll("\n", ""),
            offset,
            limit,
            language
        });
        if (historySearchId.current === searchId) {
            setResults((currentPages) => {
                const nextPage = { id: searchId, offset, limit, language, results: res };
                return offset === 0
                    ? [nextPage]
                    : [
                        ...currentPages.filter((page) =>
                            page.language !== language || page.offset !== offset
                        ),
                        nextPage
                    ];
            });
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