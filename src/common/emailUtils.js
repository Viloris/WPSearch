import { getLocaleMessage } from "./i18n";

export function generateEmailSubject(title) {
    return title || getLocaleMessage("shareLabel");
}
export function generateEmailBody(summary, url) {
    return [summary, url].filter(Boolean).join("\n\n");
}

export function generateEmailShareLink(emailSubject, emailBody) {
    return `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
}
