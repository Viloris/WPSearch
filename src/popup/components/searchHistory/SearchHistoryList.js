import React from "react";

export function SearchHistoryList({ history, createSearchHandler }) {
    return (
        <ul>
            {history.map((query) => (
                <li key={query}>
                    <button
                        onClick={createSearchHandler(query)}
                        title={query}
                        type="button"
                    >
                        {query}
                    </button>
                </li>
            ))}
        </ul>
    )
}