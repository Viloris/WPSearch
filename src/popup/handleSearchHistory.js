import log from "loglevel";
import browser from "webextension-polyfill";
import config from "./searchHistoryConfig.json";

const { SEARCH_HISTORY_STORAGE_KEY, SEARCH_HISTORY_LIMIT } = config;

const logDir = "popup/PopupPage";

export const recordSearch = async (expression, searchHistoryRef, setSearchHistory) => {
    const query = expression.replaceAll("\n", "").trim();
    if (!query) return;

    const nextHistory = [
        query,
        ...searchHistoryRef.current.filter((entry) => entry !== query)
    ].slice(0, SEARCH_HISTORY_LIMIT);
    searchHistoryRef.current = nextHistory;
    setSearchHistory(nextHistory);

    try {
        await browser.storage.local.set({
            [SEARCH_HISTORY_STORAGE_KEY]: nextHistory
        });
    } catch (error) {
        log.error(logDir, "Saving search history failed", error);
    }
}

export const clearSearchHistory = async (searchHistoryRef, setSearchHistory) => {
    try {
        await browser.storage.local.set({ [SEARCH_HISTORY_STORAGE_KEY]: [] });
        searchHistoryRef.current = [];
        setSearchHistory([]);
    } catch (error) {
        log.error(logDir, "Clearing search history failed", error);
    }
};

export const getSearchHistory = async (isMounted, searchHistoryRef, setSearchHistory) => {
    try {
        const stored = await browser.storage.local.get(
            SEARCH_HISTORY_STORAGE_KEY
        );
        const savedHistory = stored[SEARCH_HISTORY_STORAGE_KEY];
        const history = Array.isArray(savedHistory)
            ? savedHistory
                .filter((query) => typeof query === "string" && query.trim())
                .slice(0, SEARCH_HISTORY_LIMIT)
            : [];
        if (!isMounted()) return;
        searchHistoryRef.current = history;
        setSearchHistory(history);
    } catch (error) {
        log.error(logDir, "Loading search history failed", error);
    }
}
