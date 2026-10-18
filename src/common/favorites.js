import log from "loglevel";
import browser from "webextension-polyfill";

const logDir = "common/favorites";

const normalizeFavorites = (savedFavorites) => {
    if (!Array.isArray(savedFavorites)) return [];

    return savedFavorites.flatMap((entry) => {
        if (typeof entry === "string" && entry.trim()) {
            return [{ summary: entry.trim() }];
        }

        if (entry && typeof entry === "object" && typeof entry.summary === "string" && entry.summary.trim()) {
            return [{
                wikipedia: typeof entry.wikipedia === "string" ? entry.wikipedia : "",
                title: typeof entry.title === "string" ? entry.title : "",
                summary: entry.summary.trim()
            }];
        }

        return [];
    });
};

export const getFavorites = async (isMounted, setFavorites) => {
    try {
        const stored = await browser.storage.local.get("favorites");
        const favorites = normalizeFavorites(stored["favorites"]);
        if (!isMounted()) return;
        setFavorites(favorites);
    } catch (error) {
        log.error(logDir, "Loading favorites failed", error);
    }
}

export const addFavorite = async (summary, setFavorites, wikipedia, title) => {
    try {
        const stored = await browser.storage.local.get("favorites");
        const favorites = normalizeFavorites(stored["favorites"]);
        if (!favorites.some((entry) => entry.summary === summary)) {
            const nextFavorites = [{ wikipedia, title, summary }, ...favorites];
            await browser.storage.local.set({ "favorites": nextFavorites });
            setFavorites(nextFavorites);
        }
    } catch (error) {
        log.error(logDir, "Adding favorite failed", error);
    }
}

export const removeFavorite = async (summary, setFavorites) => {
    try {
        const stored = await browser.storage.local.get("favorites");
        const favorites = normalizeFavorites(stored["favorites"]);
        if (favorites.some((entry) => entry.summary === summary)) {
            const nextFavorites = favorites.filter((entry) => entry.summary !== summary);
            await browser.storage.local.set({ "favorites": nextFavorites });
            setFavorites(nextFavorites);
        }
    } catch (error) {
        log.error(logDir, "Removing favorite failed", error);
    }
}