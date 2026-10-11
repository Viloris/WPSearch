import React, { useState } from "react";
import "../styles/SearchHistory.scss";
import { EmptySearchLabel } from "./searchHistory/EmptySearchLabel";
import { ToggleSearchHistory } from "./searchHistory/toggleSearchHistory";
import { SearchHistoryList } from "./searchHistory/SearchHistoryList";
import { SearchHistoryHeader } from "./searchHistory/SearchHistoryHeader";

export default function SearchHistory({ history, onSelect, onClear }) {
  const hasSearchHistory = history.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  const selectQuery = (query) => {
    onSelect(query);
    setIsOpen(false);
  };

  const toggleSearchHistory = () => setIsOpen((open) => !open);
  const createSearchHandler = (query) => () => selectQuery(query);

  return (
    <section className="searchHistory">
      <ToggleSearchHistory
        isOpen={isOpen}
        history={history}
        toggleSearchHistory={toggleSearchHistory}
      />
      {isOpen && (
        <div className="searchHistoryPanel" id="searchHistoryList">
          <SearchHistoryHeader
            history={history}
            onClear={onClear}
          />
          {hasSearchHistory ? (
            <SearchHistoryList
              history={history}
              createSearchHandler={createSearchHandler}
            />
          ) : (
            <EmptySearchLabel />
          )}
        </div>
      )}
    </section>
  );


}
