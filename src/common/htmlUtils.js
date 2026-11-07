import log from "loglevel";
import { buildWikipediaUrl } from "./urlUtils";
import CONFIG from "../config.json";

const {
    protocolHttps,
    WIKIPEDIA_DOMAIN,
    WKIMEDIA_THUMB_API_URL,
    WKIMEDIA_UPLOAD_API_URL
} = CONFIG;
const logDir = "common/htmlUtils";

const allowedTags = new Set([
    "A", "B", "BLOCKQUOTE", "BR", "CAPTION", "DD", "DIV", "DL", "DT", "EM",
    "FIGCAPTION", "FIGURE", "H1", "H2", "H3", "H4", "H5", "H6", "HR", "I",
    "IMG", "LI", "OL", "P", "SPAN", "STRONG", "SUB", "SUP", "TABLE", "TBODY",
    "TD", "TFOOT", "TH", "THEAD", "TR", "UL"
]);
const blockedTags = new Set(["IFRAME", "MATH", "OBJECT", "SCRIPT", "STYLE", "SVG", "TEMPLATE"]);
const readerViewSelectors = [
    ".mw-editsection",
    ".mw-editsection-bracket",
    ".metadata",
    ".ambox",
    ".tmbox",
    ".imbox",
    ".cmbox",
    ".fmbox",
    ".ombox",
    ".navbox",
    ".vertical-navbox",
    ".sistersitebox",
    ".portal",
    ".authority-control",
    ".shortdescription",
    ".mw-indicators",
    ".noprint",
    "tr.nyitasinfo",
    "a[href*='action=edit']:not(.new):not([href*='redlink=1'])"
].join(",");

const refRegex = /^#(?:cite_(?:note|ref)|CITEREF)/i;
const textHtml = "text/html";
const HTML_A = "A";
const HTML_IMG = "IMG";
const HTML_href = "href";
const HTML_span = "span";

export function sanitizeExtractHtml(html, language, disableReferenceLinks = false) {
    const parsed = new DOMParser().parseFromString(html, textHtml);
    const baseUrl = buildWikipediaUrl(language); //`https://${language}.wikipedia.org`;
    let imageCount = 0;
    parsed.body.querySelectorAll(readerViewSelectors).forEach((element) => element.remove());
    if (disableReferenceLinks) {
        parsed.body.querySelectorAll("a").forEach((anchor) => {
            const href = anchor.getAttribute(HTML_href) || "";
            let isReferenceTarget = false;
            try {
                const decodedHref = decodeURIComponent(href);
                const url = new URL(decodedHref, baseUrl);
                isReferenceTarget = refRegex.test(url.hash);
            } catch (error) {
                log.warn(logDir, "Ignored invalid link in full article", error);
            }

            if (
                isReferenceTarget ||
                anchor.matches(".mw-ref, .reference, .mw-cite-backlink, [id^='cite_ref']") ||
                anchor.closest(".mw-ref, .reference, .mw-cite-backlink")
            ) {
                anchor.replaceWith(document.createTextNode(anchor.textContent || ""));
            }
        });
    }

    const copyNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent || "");
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const sourceElement = node;
        if (blockedTags.has(sourceElement.tagName)) {
            return null;
        }

        let articleUrl = null;
        if (sourceElement.tagName === HTML_A) {
            const href = sourceElement.getAttribute(HTML_href);
            if (href) {
                try {
                    articleUrl = new URL(href, baseUrl);
                } catch (error) {
                    log.warn(logDir, "Ignored invalid link in featured article extract", error);
                }
            }
        }

        const isRedLink = sourceElement.tagName === HTML_A && (
            sourceElement.classList.contains("new") ||
            (
                articleUrl?.protocol === protocolHttps &&
                articleUrl.hostname === `${language}${WIKIPEDIA_DOMAIN}` &&
                articleUrl.searchParams.get("redlink") === "1"
            )
        );
        const isReferenceLink = disableReferenceLinks &&
            sourceElement.tagName === HTML_A &&
            (
                sourceElement.closest(".mw-ref, .reference, .mw-cite-backlink") ||
                refRegex.test(articleUrl?.hash || "")
            );
        const safeTag = isRedLink || isReferenceLink
            ? HTML_span
            : allowedTags.has(sourceElement.tagName)
                ? sourceElement.tagName.toLowerCase()
                : HTML_span;
        const safeElement = document.createElement(safeTag);

        /* Preserve merged cells */
        if (sourceElement.tagName === "TD" || sourceElement.tagName === "TH") {
            for (const [attribute, maxValue] of [["colspan", 1000], ["rowspan", 65534]]) {
                const value = sourceElement.getAttribute(attribute);
                if (value !== null && /^\d+$/.test(value)) {
                    const span = Number(value);
                    if (
                        Number.isSafeInteger(span) &&
                        span <= maxValue &&
                        (attribute === "rowspan" || span >= 1)
                    ) {
                        safeElement.setAttribute(attribute, String(span));
                    }
                }
            }
        }

        /* Preserve images from Wikimedia */
        if (sourceElement.tagName === HTML_IMG) {
            if (imageCount >= 5) return null;

            const src = sourceElement.getAttribute("src");
            if (!src) return null;

            try {
                const imageUrl = new URL(src, baseUrl);
                if (
                    imageUrl.protocol !== protocolHttps ||
                    ![WKIMEDIA_THUMB_API_URL,
                        WKIMEDIA_UPLOAD_API_URL].includes(imageUrl.hostname)
                ) {
                    return null;
                }

                safeElement.setAttribute("src", imageUrl.href);
                safeElement.setAttribute("alt", sourceElement.getAttribute("alt") || "");
                safeElement.setAttribute("loading", "lazy");
                safeElement.setAttribute("decoding", "async");
                imageCount += 1;
            } catch (error) {
                log.warn(logDir, "Ignored invalid image in article extract", error);
                return null;
            }
        }

        /* Preserve links to other Wikipedia articles */
        if (sourceElement.tagName === HTML_A) {
            if (
                !isRedLink &&
                !isReferenceLink &&
                articleUrl?.protocol === protocolHttps &&
                articleUrl.hostname === `${language}${WIKIPEDIA_DOMAIN}`
            ) {
                safeElement.setAttribute(HTML_href, articleUrl.href);
                safeElement.setAttribute("target", "_blank");
                safeElement.setAttribute("rel", "noopener noreferrer");
            }
        }

        for (const child of sourceElement.childNodes) {
            const safeChild = copyNode(child);
            if (safeChild) safeElement.appendChild(safeChild);
        }
        return safeElement;
    };

    const container = document.createElement("div");
    for (const child of parsed.body.childNodes) {
        const safeChild = copyNode(child);
        if (safeChild) container.appendChild(safeChild);
    }
    return container.innerHTML;
}

export function extractTextFromHtml(html, language) {
    const sanitizedHtml = sanitizeExtractHtml(html, language);
    const parsed = new DOMParser().parseFromString(sanitizedHtml, textHtml);
    return parsed.body.textContent?.trim() || "";
}