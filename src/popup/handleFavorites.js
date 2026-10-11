import log from "loglevel";
import browser from "webextension-polyfill";

const logDir = "popup/PopupPage";

export const getFavorites = async (isMounted, setFavorites) => {
    try {
        const stored = await browser.storage.local.get("favorites");
        const savedFavorites = stored["favorites"];
        const favorites = Array.isArray(savedFavorites)
            ? savedFavorites
                .filter((query) => typeof query === "string" && query.trim())
            : [];
        if (!isMounted()) return;
        setFavorites(favorites);
    } catch (error) {
        log.error(logDir, "Loading favorites failed", error);
    }
}

export const addFavorite = async (query, setFavorites) => {
    try {
        const stored = await browser.storage.local.get("favorites");
        const savedFavorites = stored["favorites"];
        const favorites = Array.isArray(savedFavorites)
            ? savedFavorites
                .filter((entry) => typeof entry === "string" && entry.trim())
            : [];
        if (!favorites.includes(query)) {
            const nextFavorites = [query, ...favorites];
            await browser.storage.local.set({ "favorites": nextFavorites });
            setFavorites(nextFavorites);
        }
    } catch (error) {
        log.error(logDir, "Adding favorite failed", error);
    }
}

export const removeFavorite = async (query, setFavorites) => {
    try {
        const stored = await browser.storage.local.get("favorites");
        const savedFavorites = stored["favorites"];
        const favorites = Array.isArray(savedFavorites)
            ? savedFavorites
                .filter((entry) => typeof entry === "string" && entry.trim())
            : [];
        if (favorites.includes(query)) {
            const nextFavorites = favorites.filter((entry) => entry !== query);
            await browser.storage.local.set({ "favorites": nextFavorites });
            setFavorites(nextFavorites);
        }
    } catch (error) {
        log.error(logDir, "Removing favorite failed", error);
    }
}