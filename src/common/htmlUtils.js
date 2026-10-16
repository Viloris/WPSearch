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
    "a[href*='action=edit']"
].join(",");


export function sanitizeExtractHtml(html, language) {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const baseUrl = `https://${language}.wikipedia.org`;
    let imageCount = 0;
    parsed.body.querySelectorAll(readerViewSelectors).forEach((element) => element.remove());

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

        const safeTag = allowedTags.has(sourceElement.tagName)
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
            const href = sourceElement.getAttribute("href");
            if (href) {
                try {
                    const articleUrl = new URL(href, baseUrl);
                    if (
                        articleUrl.protocol === "https:" &&
                        articleUrl.hostname === `${language}.wikipedia.org`
                    ) {
                        safeElement.setAttribute("href", articleUrl.href);
                        safeElement.setAttribute("target", "_blank");
                        safeElement.setAttribute("rel", "noopener noreferrer");
                    }
                } catch (error) {
                    log.warn(logDir, "Ignored invalid link in featured article extract", error);
                }
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