import React, { useState } from "react";
import { getLocaleMessage } from "../../common/i18n";
import "../styles/SearchHistory.scss";

export default function SearchHistory({ history, onSelect, onClear }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectQuery = (query) => {
    onSelect(query);
    setIsOpen(false);
  };

  return (
    <section className="searchHistory">
      <button
        aria-controls="searchHistoryList"
        aria-expanded={isOpen}
        className="searchHistoryToggle"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {getLocaleMessage("searchHistoryLabel")}
        {history.length > 0 && <span> ({history.length})</span>}
      </button>
      {isOpen && (
        <div className="searchHistoryPanel" id="searchHistoryList">
          <div className="searchHistoryHeader">
            <span>{getLocaleMessage("searchHistoryLabel")}</span>
            <button
              disabled={history.length === 0}
              onClick={onClear}
              type="button"
            >
              {getLocaleMessage("clearSearchHistoryLabel")}
            </button>
          </div>
          {history.length > 0 ? (
            <ul>
              {history.map((query) => (
                <li key={query}>
                  <button
                    onClick={() => selectQuery(query)}
                    title={query}
                    type="button"
                  >
                    {query}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>{getLocaleMessage("emptySearchHistoryLabel")}</p>
          )}
        </div>
      )}
    </section>
  );
}
