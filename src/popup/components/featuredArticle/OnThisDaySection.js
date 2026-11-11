import React from "react";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";

export function OnThisDaySection({ onThisDay, handleArticleLinkClick, language }) {
    return (
        <section className="featuredArticleSupplement">
            <h3 lang={getFeedSectionLanguage(language)}>{getFeedSectionMessage(language, "dailyOnThisDayLabel")}</h3>
            <ul className="featuredArticleEntries">
                {onThisDay.map((item, index) => (
                    <li key={`${item.year}-${item.text}-${index}`}>
                        {item.year && <strong>{item.year}: </strong>}
                        {item.text}
                        {item.articles.length > 0 && (
                            <ul className="featuredArticleFeedLinks" onClick={handleArticleLinkClick}>
                                {item.articles.map((linkedArticle) => (
                                    <li key={`${linkedArticle.title}-${linkedArticle.articleUrl}`}>
                                        {linkedArticle.articleUrl ? (
                                            <a
                                                href={linkedArticle.articleUrl}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                {linkedArticle.title.replace(/_/g, " ")}
                                            </a>
                                        ) : (
                                            linkedArticle.title.replace(/_/g, " ")
                                        )}
                                        {linkedArticle.description && ` — ${linkedArticle.description}`}
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