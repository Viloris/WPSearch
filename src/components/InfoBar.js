import React from "react";
import browser from "webextension-polyfill";
import { CONFIG } from "../common/constans";
import "./styles/infoBar.scss";
import { getLocaleMessage } from "../common/i18n";

/**
 *
 * @description Information bar with message and settings button, which allows users to dismiss the information and provides a button to open the settings page for further configuration
 * @param {string} message
 * @param {function()} onClick
 * @returns {JSX.Element} Information bar with message and settings button
 */
const { requestMessages: { OPEN_OPTIONS_PAGE } } = CONFIG;

export default function InfoBar({ message, onClick }) {
  const settings = getLocaleMessage("settingsLabel");

  const openSettings = () => {
    browser.runtime.sendMessage({
      message: OPEN_OPTIONS_PAGE,
      hash: "#settings"
    });
  };

  return (
    <div className="infoBar">
      <div className="infoBar-top-section">
        <p className="infoBar-message">{message}</p>
        <CloseButton onClick={onClick} />
      </div>
      <SettingsButton
        openSettings={openSettings}
        settings={settings}
      />
    </div>
  );
}
function SettingsButton({ openSettings, settings }) {
  return <button className="infoBar-settings-button" onClick={openSettings}>
    {settings}
  </button>;
}

function CloseButton({ onClick }) {
  return (
    <button
      className="infoBar-close-button"
      onClick={onClick}
      title="Dismiss"
    >
      ✕
    </button>
  );
}
