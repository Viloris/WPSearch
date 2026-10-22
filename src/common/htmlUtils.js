import log from "loglevel";

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
    "a[href*='action=edit']:not(.new):not([href*='redlink=1'])"
].join(",");


export function sanitizeExtractHtml(html, language, disableReferenceLinks = false) {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const baseUrl = `https://${language}.wikipedia.org`;
    let imageCount = 0;
    parsed.body.querySelectorAll(readerViewSelectors).forEach((element) => element.remove());
    if (disableReferenceLinks) {
        parsed.body.querySelectorAll("a").forEach((anchor) => {
            const href = anchor.getAttribute("href") || "";
            let isReferenceTarget = false;
            try {
                const decodedHref = decodeURIComponent(href);
                const url = new URL(decodedHref, baseUrl);
                isReferenceTarget = /^#(?:cite_(?:note|ref)|CITEREF)/i.test(url.hash);
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
        if (sourceElement.tagName === "A") {
            const href = sourceElement.getAttribute("href");
            if (href) {
                try {
                    articleUrl = new URL(href, baseUrl);
                } catch (error) {
                    log.warn(logDir, "Ignored invalid link in featured article extract", error);
                }
            }
        }

        const isRedLink = sourceElement.tagName === "A" && (
            sourceElement.classList.contains("new") ||
            (
                articleUrl?.protocol === "https:" &&
                articleUrl.hostname === `${language}.wikipedia.org` &&
                articleUrl.searchParams.get("redlink") === "1"
            )
        );
        const isReferenceLink = disableReferenceLinks &&
            sourceElement.tagName === "A" &&
            (
                sourceElement.closest(".mw-ref, .reference, .mw-cite-backlink") ||
                /^#(?:cite_(?:note|ref)|CITEREF)/i.test(articleUrl?.hash || "")
            );
        const safeTag = isRedLink || isReferenceLink
            ? "span"
            : allowedTags.has(sourceElement.tagName)
                ? sourceElement.tagName.toLowerCase()
                : "span";
        const safeElement = document.createElement(safeTag);

        if (sourceElement.tagName === "IMG") {
            if (imageCount >= 5) return null;

            const src = sourceElement.getAttribute("src");
            if (!src) return null;

            try {
                const imageUrl = new URL(src, baseUrl);
                if (
                    imageUrl.protocol !== "https:" ||
                    !["thumb.wikimedia.org", "upload.wikimedia.org"].includes(imageUrl.hostname)
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

        if (sourceElement.tagName === "A") {
            if (
                !isRedLink &&
                !isReferenceLink &&
                articleUrl?.protocol === "https:" &&
                articleUrl.hostname === `${language}.wikipedia.org`
            ) {
                safeElement.setAttribute("href", articleUrl.href);
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
    const parsed = new DOMParser().parseFromString(sanitizedHtml, "text/html");
    return parsed.body.textContent?.trim() || "";
}