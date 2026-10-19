import React from "react";
import { getLocaleMessage } from "../../../common/i18n";

export function OnThisDaySection({ onThisDay, handleArticleLinkClick }) {
    return <section className="featuredArticleSupplement">
        <h3>{getLocaleMessage("dailyOnThisDayLabel")}</h3>
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
    </section>;
}