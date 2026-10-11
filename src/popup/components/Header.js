import React from "react";
import openUrl from "src/common/openUrl";
import SettingsIcon from "../icons/settings-solar.svg";
import FavoriteIcon from "../icons/bookmark-solar-blank.svg";
import FavoriteIconFilled from "../icons/bookmark-solar-filled.svg";
import Toggle from "react-toggle";
import { CONFIG } from "../../common/constans";
import { getLocaleMessage } from "../../common/i18n";
import "react-toggle/style.css";
import "../styles/Header.scss";

const { OPTIONS_PAGE_URL } = CONFIG;
const EXTENSION_NAME = getLocaleMessage("extName");

/**
 *
 * @returns {JSX.Element} Title section with extension icon and name
 */
function Title() {
  return (
    <div className="title">
      <img src="../../icons/19.png" alt="Wiki" />
      &nbsp;{EXTENSION_NAME}
    </div>
  );
}

/**
 *
 * @returns {JSX.Element} Settings button that opens settings page on click
 */
function SettingsButton() {
  const openSettings = () => {
    const url = `${OPTIONS_PAGE_URL}#settings`;
    openUrl(url);
  };

  return (
    <button
      className={"settingsButton"}
      onClick={openSettings}
      title={getLocaleMessage("settingsLabel")}
    >
      <SettingsIcon />
    </button>
  );
}

/**
 *
 * @returns {JSX.Element} Favorite button that opens favorite component on click
 */
function FavoriteButton({ toggleFavoritePage, isFavoritePageOpen }) {
  const openFavorite = () => {
    toggleFavoritePage();
  };

  return (
    <button
      className={`favoriteButton${isFavoritePageOpen ? " is-open" : ""}`}
      onClick={openFavorite}
      title={getLocaleMessage("favoriteLabel")}
    >
      {isFavoritePageOpen ? <FavoriteIconFilled /> : <FavoriteIcon />}
    </button>
  );
}

/**
 *
 * @param {boolean} isConnected
 * @param {boolean} isEnabledOnPage
 * @param {function}  toggleEnabledOnPage
 * @returns {JSX.Element} Action bar with toggle button and settings button,
 * passing state and toggle function to toggle button for managing enabled status on page
 */
function ActionBar({ isConnected, isEnabledOnPage, toggleEnabledOnPage, toggleFavoritePage, isFavoritePageOpen }) {
  return (
    <div className="rightButtons">
      <ToggleButton
        isEnabledOnPage={isEnabledOnPage}
        toggleEnabledOnPage={toggleEnabledOnPage}
        isConnected={isConnected}
      />
      {<FavoriteButton toggleFavoritePage={toggleFavoritePage} isFavoritePageOpen={isFavoritePageOpen} />}
      {SettingsButton()}
    </div>
  );
}

/**
 *
 * @param {boolean} isConnected
 * @param {boolean} isEnabledOnPage
 * @param {function}  toggleEnabledOnPage
 * @returns {JSX.Element} Toggle button with state and title based on connection and enabled status
 */
function ToggleButton({ isConnected, isEnabledOnPage, toggleEnabledOnPage }) {
  const getToggleButtonTitle = (isEnabled) => {
    const buttonState = isEnabled ? "disableOnThisPage" : "enableOnThisPage";
    return getLocaleMessage(buttonState);
  };

  return (
    <div
      className="toggleButton"
      title={getToggleButtonTitle(isEnabledOnPage)}
    >
      <Toggle
        checked={isEnabledOnPage}
        onChange={toggleEnabledOnPage}
        icons={false}
        disabled={!isConnected}
      />
    </div>
  );
}

/**
 *
 * @param {*} props
 * @returns {JSX.Element} Header component with title and action bar,
 * passing props to action bar for state management
 */
export default function Header({ isConnected, isEnabledOnPage, toggleEnabledOnPage, toggleFavoritePage, isFavoritePageOpen }) {
  return (
    <div id="header">
      <Title />
      <ActionBar
        isConnected={isConnected}
        isEnabledOnPage={isEnabledOnPage}
        toggleEnabledOnPage={toggleEnabledOnPage}
        toggleFavoritePage={toggleFavoritePage}
        isFavoritePageOpen={isFavoritePageOpen}
      />
    </div>
  );
}
