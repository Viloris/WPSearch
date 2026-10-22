import React from "react";
import { getLocaleMessage } from "../../common/i18n";
import "../styles/MainNavigation.scss";
import { navigationItems } from "./MainNavigationItems";

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
