import React from "react";
import openUrl from "src/common/openUrl";
import SettingsIcon from "../icons/settings.svg";
import Toggle from "react-toggle";
import { getLocaleMessage } from "../../common/utils";
import "react-toggle/style.css";
import "../styles/Header.scss";

const EXTENSION_NAME = getLocaleMessage("extName");

/**
 *
 * @returns {JSX.Element}
 */
function renderTitle() {
  return (
    <div className="title">
      <img src="../../icons/19.png" alt="Wiki" />
      &nbsp;{EXTENSION_NAME}
    </div>
  );
}

/**
 *
 * @returns {JSX.Element}
 */
function SettingsButton() {
  const openSettings = () => {
    const url = "../options/index.html#settings";
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
 * @param {boolean} isConnected
 * @param {boolean} isEnabledOnPage
 * @param {function}  toggleEnabledOnPage
 * @returns {JSX.Element}
 */
function renderActionBar(props) {
  const { isConnected, isEnabledOnPage, toggleEnabledOnPage } = props;
  return (
    <div className="rightButtons">
      <ToggleButton
        isEnabledOnPage={isEnabledOnPage}
        toggleEnabledOnPage={toggleEnabledOnPage}
        isConnected={isConnected}
      />
      {SettingsButton()}
    </div>
  );
}

/**
 *
 * @param {boolean} isConnected
 * @param {boolean} isEnabledOnPage
 * @param {function}  toggleEnabledOnPage
 * @returns {JSX.Element}
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
 * @returns {JSX.Element}
 */
export default function Header(props) {
  return (
    <div id="header">
      {renderTitle()}
      {renderActionBar(props)}
    </div>
  );
}
