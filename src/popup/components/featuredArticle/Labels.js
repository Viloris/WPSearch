import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import { getWikipediaName } from "../../../common/urlUtils";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";
import browser from "webextension-polyfill";
import openUrl from "../../../common/openUrl";
import { CONFIG } from "../../../common/constans";
import SettingsIcon from "../../icons/settings-solar.svg";

export function ArticleHeader({ language }) {
    const feedLangSettingLabel = getLocaleMessage("feedLangSettingLabel");

    return (
        <h1>
            {getWikipediaName(language)}
            <button
                type="button"
                className="featuredArticleSettings"
                title={feedLangSettingLabel}
                aria-label={feedLangSettingLabel}
                onClick={() => openUrl(browser.runtime.getURL(`${CONFIG.OPTIONS_PAGE_URL}#settings?highlight=feedLang`))}
            >
                <SettingsIcon aria-hidden="true" />
            </button>
        </h1>
    )
}

export function ArticleLabel({ isLoading, hasFeaturedArticle, article, language }) {
    return (
        <h2 lang={getFeedSectionLanguage(language)}>
            {isLoading || !hasFeaturedArticle
                ? getFeedSectionMessage(language, "feedLoadingLabel")
                : getFeedSectionMessage(
                    language,
                    article.isFallback
                        ? "dailyTrendingArticleLabel"
                        : article.isLatestFeatured
                            ? "dailyLatestFeaturedArticleLabel"
                            : "featuredArticleLabel"
                )}
        </h2>
    );
}