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
                url: typeof entry.url === "string" ? entry.url : "",
                summary: entry.summary.trim()
            }];
        }

        return [];
    });
};

export const findFavorite = (favorites, { summary, wikipedia, title, url }) =>
    favorites.find((favorite) => {
        if (url && favorite.url === url) return true;

        if (wikipedia && title && favorite.wikipedia && favorite.title) {
            return favorite.wikipedia === wikipedia &&
                favorite.title.replaceAll("_", " ").normalize("NFC") ===
                title.replaceAll("_", " ").normalize("NFC");
        }

        if (url && favorite.url) return false;
        return Boolean(summary && favorite.summary === summary);
    });

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

export const observeFavorites = (setFavorites) => {
    let active = true;
    let changed = false;
    const onChanged = (changes) => {
        if (!active || !changes.favorites) return;
        changed = true;
        setFavorites(normalizeFavorites(changes.favorites.newValue));
    };

    browser.storage.local.onChanged.addListener(onChanged);
    void getFavorites(() => active && !changed, setFavorites);

    return () => {
        active = false;
        browser.storage.local.onChanged.removeListener(onChanged);
    };
};

export const addFavorite = async (summary, setFavorites, wikipedia, title, url) => {
    try {
        const stored = await browser.storage.local.get("favorites");
        const favorites = normalizeFavorites(stored["favorites"]);
        if (!findFavorite(favorites, { summary, wikipedia, title, url }) &&
            !favorites.some((entry) => entry.summary === summary)) {
            const nextFavorites = [{ wikipedia, title, url, summary }, ...favorites];
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