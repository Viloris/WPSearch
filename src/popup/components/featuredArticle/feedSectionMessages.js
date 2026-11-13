import cs from "../../../_locales/cs/messages.json";
import de from "../../../_locales/de/messages.json";
import en from "../../../_locales/en/messages.json";
import es from "../../../_locales/es/messages.json";
import fr from "../../../_locales/fr/messages.json";
import hu from "../../../_locales/hu/messages.json";
import it from "../../../_locales/it/messages.json";
import ja from "../../../_locales/ja/messages.json";
import nl from "../../../_locales/nl/messages.json";
import pl from "../../../_locales/pl/messages.json";
import sk from "../../../_locales/sk/messages.json";
import { getLocaleMessage, getUILanguage } from "../../../common/i18n";

const locales = { cs, de, en, es, fr, hu, it, ja, nl, pl, sk };

function getAvailableLocale(language) {
    const baseLanguage = language?.toLowerCase().split(/[-_]/)[0];
    return Object.prototype.hasOwnProperty.call(locales, baseLanguage) ? baseLanguage : null;
}

export function getFeedSectionLanguage(language) {
    return getAvailableLocale(language) ||
        getAvailableLocale(getUILanguage()) ||
        "en";
}

export function getFeedSectionMessage(language, key) {
    const locale = locales[getFeedSectionLanguage(language)];
    return locale[key]?.message || getLocaleMessage(key);
}
