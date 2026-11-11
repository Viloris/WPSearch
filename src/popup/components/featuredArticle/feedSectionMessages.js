import de from "../../../_locales/de/messages.json";
import en from "../../../_locales/en/messages.json";
import fr from "../../../_locales/fr/messages.json";
import hu from "../../../_locales/hu/messages.json";
import it from "../../../_locales/it/messages.json";
import ja from "../../../_locales/ja/messages.json";
import nl from "../../../_locales/nl/messages.json";
import { getLocaleMessage, getUILanguage } from "../../../common/i18n";

const locales = { de, en, fr, hu, it, ja, nl };

export function getFeedSectionLanguage(language) {
    if (Object.prototype.hasOwnProperty.call(locales, language)) return language;
    const uiLanguage = getUILanguage();
    const baseLanguage = uiLanguage.toLowerCase().split(/[-_]/)[0];
    return Object.prototype.hasOwnProperty.call(locales, baseLanguage) ? uiLanguage : "en";
}

export function getFeedSectionMessage(language, key) {
    const locale = Object.prototype.hasOwnProperty.call(locales, language) ? locales[language] : null;
    return locale?.[key]?.message || getLocaleMessage(key);
}
