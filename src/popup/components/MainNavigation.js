import React from "react";
import { getLocaleMessage } from "../../common/i18n";
import HomeIcon from "../icons/home-solar.svg";
import SearchIcon from "../icons/search-solar.svg";
import HistoryIcon from "../icons/history-solar.svg";
import FavoritesIcon from "../icons/bookmark-solar.svg";
import "../styles/MainNavigation.scss";

const navigationItems = [
  {
    id: "home",
    label: "mainMenuLabel",
    icon: (
      <HomeIcon />
      /* <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" />
      </svg> */
    )
  },
  {
    id: "search",
    label: "searchLabel",
    icon: (<SearchIcon />
      /* <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </svg> */
    )
  },
  {
    id: "history",
    label: "searchHistoryLabel",
    icon: (
      <HistoryIcon />
      /* <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
        <path d="M3 3v5h5m4-1v5l3 2" />
      </svg> */
    )
  },
  {
    id: "favorites",
    label: "favoritesLabel",
    icon: (<FavoritesIcon />
      /*<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>*/
    )
  }
];

export default function MainNavigation({ activeView, onChange }) {
  return (
    <nav className="mainNavigation" aria-label={getLocaleMessage("mainMenuLabel")}>
      {navigationItems.map(({ id, label, icon }) => (
        <button
          key={id}
          aria-pressed={activeView === id}
          className={activeView === id ? "is-active" : ""}
          onClick={() => onChange(id)}
          type="button"
        >
          {icon}
          <span>{getLocaleMessage(label)}</span>
        </button>
      ))}
    </nav>
  );
}
