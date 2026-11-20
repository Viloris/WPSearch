const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const babel = require("@babel/core");

const source = readFileSync(path.join(__dirname, "../src/common/favorites.js"), "utf8");
const compiled = babel.transformSync(source, {
    presets: [["@babel/preset-env", { targets: { node: "current" } }]]
}).code;

function createFavoritesModule(initialFavorites = [], getOverride) {
    let stored = initialFavorites;
    const listeners = new Set();
    const emit = (changes) => listeners.forEach((listener) => listener(changes));
    const storage = {
        get: getOverride || (async () => ({ favorites: stored })),
        set: async ({ favorites }) => {
            stored = favorites;
            emit({ favorites: { newValue: favorites } });
        },
        onChanged: {
            addListener: (listener) => listeners.add(listener),
            removeListener: (listener) => listeners.delete(listener)
        }
    };
    const exports = {};
    vm.runInNewContext(compiled, {
        exports,
        require: (name) => {
            if (name === "webextension-polyfill") return { storage: { local: storage } };
            if (name === "loglevel") return { error: (...args) => { throw new Error(args.join(" ")); } };
            throw new Error(`Unexpected dependency: ${name}`);
        }
    });
    return { ...exports, getStored: () => stored, emit, listenerCount: () => listeners.size };
}

function loadComponent(file, dependencies) {
    const componentSource = readFileSync(path.join(__dirname, "../src", file), "utf8");
    const code = babel.transformSync(componentSource, {
        presets: [
            ["@babel/preset-env", { targets: { node: "current" } }],
            "@babel/preset-react"
        ]
    }).code;
    const exports = {};
    vm.runInNewContext(code, {
        exports,
        require: (name) => {
            if (name === "react") return require("react");
            if (name in dependencies) return dependencies[name];
            throw new Error(`Unexpected dependency: ${name}`);
        }
    });
    return exports;
}

test("matches the same article across summaries without matching another language", () => {
    const { findFavorite } = createFavoritesModule();
    const favorite = {
        summary: "Full article text",
        wikipedia: "English",
        title: "New York",
        url: "https://en.wikipedia.org/wiki/New_York"
    };
    assert.equal(findFavorite([favorite], {
        summary: "Short extract",
        wikipedia: "English",
        title: "New_York",
        url: "https://en.wikipedia.org/wiki/New%20York"
    }), favorite);
    assert.equal(findFavorite([favorite], {
        summary: "Short extract",
        wikipedia: "Hungarian",
        title: "New York",
        url: "https://hu.wikipedia.org/wiki/New_York"
    }), undefined);
    assert.equal(findFavorite([{ summary: "Legacy text" }], {
        summary: "Legacy text",
        wikipedia: "English",
        title: "New York",
        url: favorite.url
    }).summary, "Legacy text");
});

test("avoids duplicates and removes the originally saved text", async () => {
    const original = {
        summary: "Full article text",
        wikipedia: "English",
        title: "Article",
        url: "https://en.wikipedia.org/wiki/Article"
    };
    const { addFavorite, findFavorite, getStored, removeFavorite } = createFavoritesModule([original]);
    let state;
    await addFavorite("Short extract", (value) => { state = value; }, original.wikipedia, original.title, original.url);
    assert.equal(getStored().length, 1);
    const saved = findFavorite(getStored(), { ...original, summary: "Short extract" });
    await removeFavorite(saved.summary, (value) => { state = value; });
    assert.equal(state.length, 0);
    assert.equal(getStored().length, 0);
});

test("result and full article buttons remove the matching saved entry", () => {
    const { findFavorite } = createFavoritesModule();
    const stub = () => null;
    const resultFooter = loadComponent("components/resultArea/resultSection/ResultFooter.js", {
        "../../../styles/resultFooter.scss": {},
        "../../../common/i18n": { getLocaleMessage: stub },
        "./FooterActionBar": { FooterActionBar: stub },
        "../../../common/favorites": { findFavorite }
    }).ResultFooter;
    const resultButton = loadComponent("components/actionButtons/AddToFavoritesButton.js", {
        "../../icons/bookmark-filled.svg": stub,
        "../../icons/bookmark-blank.svg": stub,
        "../../common/i18n": { getLocaleMessage: stub }
    }).default;
    const articleHeader = loadComponent("popup/components/fullArticleView/ArticleHeader.js", {
        "./BackButton": { BackButton: stub },
        "./ArticleTitle": { ArticleTitle: stub },
        "../../../components/actionButtons/MediaButtons": { DownloadButton: stub, ShareButton: stub },
        "../../../components/actionButtons/FullArticleFavoriteButton": {
            FullArticleFavoriteButton: stub
        },
        "../../../components/actionButtons/CloseButton": { CloseButton: stub },
        "../../../styles/articleReaderActions.scss": {},
        "../../../common/favorites": { findFavorite }
    }).ArticleHeader;
    const article = {
        wikipedia: "English",
        title: "Article",
        url: "https://en.wikipedia.org/wiki/Article"
    };
    const removed = [];
    const removeFromFavorites = (summary) => removed.push(summary);
    const result = resultFooter({
        ...article, text: "Short extract",
        favorites: [{ ...article, summary: "Full article text" }]
    });
    const button = resultButton({
        ...article, text: "Short extract",
        savedFavorite: result.props.savedFavorite,
        removeFromFavorites
    });
    button.props.onClick();
    const header = articleHeader({
        ...article, text: "Full article text",
        favorites: [{ ...article, summary: "Short extract" }],
        removeFromFavorites
    });
    const favoriteButton = header.props.children[2].props.children[2];
    assert.equal(favoriteButton.props.isSaved, true);
    favoriteButton.props.handleToggleFavorite();
    assert.deepEqual(removed, ["Full article text", "Short extract"]);
});

test("observes external changes without restoring an outdated initial snapshot", async () => {
    let resolveInitial;
    const initial = new Promise((resolve) => { resolveInitial = resolve; });
    const { observeFavorites, emit, listenerCount } = createFavoritesModule([], () => initial);
    const states = [];
    const unsubscribe = observeFavorites((favorites) => states.push(favorites));

    emit({ otherSetting: { newValue: true } });
    emit({ favorites: { newValue: [" Saved article "] } });
    resolveInitial({ favorites: ["Outdated article"] });
    await initial;
    await Promise.resolve();
    assert.equal(states.length, 1);
    assert.equal(states[0][0].summary, "Saved article");

    emit({ favorites: { newValue: undefined } });
    assert.equal(states[1].length, 0);
    unsubscribe();
    assert.equal(listenerCount(), 0);
    emit({ favorites: { newValue: ["Later article"] } });
    assert.equal(states.length, 2);
});

test("updates an open result when another context adds or removes a favorite", async () => {
    const { observeFavorites, addFavorite, removeFavorite, findFavorite } = createFavoritesModule();
    const article = {
        summary: "Short extract",
        wikipedia: "English",
        title: "Article",
        url: "https://en.wikipedia.org/wiki/Article"
    };
    let panelFavorites = [];
    const unsubscribe = observeFavorites((favorites) => { panelFavorites = favorites; });
    await Promise.resolve();
    await addFavorite(article.summary, () => {}, article.wikipedia, article.title, article.url);
    assert.ok(findFavorite(panelFavorites, article));
    await removeFavorite(article.summary, () => {});
    assert.equal(findFavorite(panelFavorites, article), undefined);
    unsubscribe();
});
