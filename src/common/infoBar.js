import React from "react";
import browser from "webextension-polyfill";
import "./styles/infoBar.scss";
import { getLocaleMessage } from "../common/utils";

/**
 *
 * @description Information bar with message and settings button, which allows users to dismiss the information and provides a button to open the settings page for further configuration
 * @param {string} message
 * @param {function()} onClick
 * @returns {JSX.Element} Information bar with message and settings button
 */
export default function InfoBar({ message, onClick }) {
  const settings = getLocaleMessage("settingsLabel");

  const openSettings = () => {
    browser.runtime.sendMessage({
      message: "openOptionsPage",
      hash: "#settings"
    });
  };

  return (
    <div className="infoBar-container">
      <div className="infoBar-wrapper">
        <div className="infoBar-top-section">
          <p className="infoBar-message">{message}</p>
          <button
            className="infoBar-close-button"
            onClick={onClick}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
        <button className="infoBar-settings-button" onClick={openSettings}>
          {settings}
        </button>
      </div>
    </div>
  );
}
