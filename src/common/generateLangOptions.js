import WP_LANG from "../settings/wikipedia.json";

const alphabeticallySort = (a, b) => a.name.localeCompare(b.name);

/**
 *
 * @description Generates an array of language options for Wikipedia search, sorted alphabetically by language name, to be used in the language selection dropdown in the extension's settings
 * @returns {Object} {value: string, name: string}[] Array of language options for Wikipedia search
 */
export function getWikipediaLanguages() {
  const langOptions = Object.keys(WP_LANG).map((lang) => ({
    value: lang,
    name: WP_LANG[lang]
  }));
  langOptions.sort(alphabeticallySort);
  return langOptions;
}
