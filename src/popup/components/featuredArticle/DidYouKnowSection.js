import React from "react";
import { sanitizeExtractHtml } from "../../../common/htmlUtils";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";

export function DidYouKnowSection({ didYouKnow, handleArticleLinkClick, language }) {
    return (
        <section className="featuredArticleSupplement">
            <h3 lang={getFeedSectionLanguage(language)}>{getFeedSectionMessage(language, "dailyDidYouKnowLabel")}</h3>
            <ul className="featuredArticleEntries">
                {didYouKnow.map((item, index) => (
                    <li key={`${item.text}-${index}`}>
                        {item.html ? (
                            <div
                                className="featuredArticleFeedHtml"
                                onClick={handleArticleLinkClick}
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeExtractHtml(item.html, language.toLowerCase())
                                }} />
                        ) : (
                            <p>{item.text}</p>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}