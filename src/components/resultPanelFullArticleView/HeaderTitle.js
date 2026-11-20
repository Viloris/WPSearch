import React from "react";
import { getWikipediaName } from "../../common/urlUtils";

export function HeaderTitle({ activeArticle }) {
    const wikipediaArticleName = getWikipediaName(activeArticle.language);

    return (
        <div className="resultPanelArticle-header-text">
            <a
                className="resultPanelArticle-title"
                href={activeArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
            >
                <h2>{activeArticle.title.replaceAll("_", " ")}</h2>
            </a>
            <h5>{wikipediaArticleName}</h5>
        </div>
    );
}