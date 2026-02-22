import WP_LANG from "../settings/wikipedia.json";

const alphabeticallySort = (a, b) => a.name.localeCompare(b.name);

/**
 * 
 * @returns {Object} {value: string, name: string}
 */
export function getWikipediaLanguages() {
    const langOptions = Object.keys(WP_LANG).map((lang) => ({
        value: lang,
        name: WP_LANG[lang]
    }));
    langOptions.sort(alphabeticallySort);
    return langOptions;
}
