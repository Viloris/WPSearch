import React from "react";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";
import { sanitizeExtractHtml } from "../../../common/htmlUtils";

export function NewsSection({ news, handleArticleLinkClick, language }) {
    return (
        <section className="featuredArticleSupplement">
            <h3 lang={getFeedSectionLanguage(language)}>{getFeedSectionMessage(language, "dailyNewsLabel")}</h3>
            <ul className="featuredArticleEntries">
                {news.map((item, index) => (
                    <li key={`${item.story}-${index}`}>
                        <div
                            className="featuredArticleFeedHtml"
                            onClick={handleArticleLinkClick}
                            dangerouslySetInnerHTML={{
                                __html: sanitizeExtractHtml(item.story, language.toLowerCase())
                            }} />
                        {item.links.length > 0 && (
                            <ul className="featuredArticleFeedLinks" onClick={handleArticleLinkClick}>
                                {item.links.map((link) => (
                                    <li key={`${link.title}-${link.articleUrl}`}>
                                        {link.articleUrl ? (
                                            <a href={link.articleUrl} rel="noopener noreferrer" target="_blank">
                                                {link.title.replace(/_/g, " ")}
                                            </a>
                                        ) : (
                                            link.title.replace(/_/g, " ")
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}