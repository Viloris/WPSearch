import React, { useState } from "react";
import "../styles/SearchHistory.scss";
import { EmptySearchLabel } from "./searchHistory/EmptySearchLabel";
import { SearchHistoryList } from "./searchHistory/SearchHistoryList";
import { SearchHistoryHeader } from "./searchHistory/SearchHistoryHeader";

export default function SearchHistory({ history, onSelect, onClear, defaultOpen = false }) {
  const hasSearchHistory = history.length > 0;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const selectQuery = (query) => {
    onSelect(query);
    setIsOpen(false);
  };

  // const searchHistoryLabel = getLocaleMessage("searchHistoryLabel");
  // const toggleSearchHistory = () => setIsOpen((open) => !open);
  const createSearchHandler = (query) => () => selectQuery(query);

  if (!hasSearchHistory && !isOpen) return null;

  return (
    <section className="searchHistory">
      {/*  {hasSearchHistory && (
        <h2>
          {searchHistoryLabel}
        </h2>
      )} */}
      {isOpen && hasSearchHistory ? (
        <div className="searchHistoryPanel" id="searchHistoryList">
          <SearchHistoryHeader
            history={history}
            onClear={onClear}
          />
          <SearchHistoryList
            history={history}
            createSearchHandler={createSearchHandler}
          />
        </div>
      ) : isOpen ? (
        <EmptySearchLabel />
      ) : (
        null
      )}
    </section>
  );


}
