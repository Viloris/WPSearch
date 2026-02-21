import React from "react";
import browser from "webextension-polyfill";
import "./styles/infoBar.scss";

export default function InfoBar({ message, onClick }) {
    const settings = browser.i18n.getMessage("settingsLabel");
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
                <button
                    className="infoBar-settings-button"
                    onClick={openSettings}
                >
                    {settings}
                </button>
            </div>
        </div>
    );
}
