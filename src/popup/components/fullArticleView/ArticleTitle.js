import React from "react";
import { getWikipediaName } from "../../../common/urlUtils";

export function ArticleTitle({ fullArticleState, language, title }) {
    return (
        <div className="fullArticleView-header-text">
            <a href={fullArticleState?.url} target="_blank" rel="noopener noreferrer"
                style={{
                    textDecoration: "none"
                }}>
                <h2>{title.replaceAll(/_/g, " ")}</h2>
            </a>
            <h5>{getWikipediaName(language)}</h5>
        </div>
    )
}