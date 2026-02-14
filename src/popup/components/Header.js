import React from "react";
import browser from "webextension-polyfill";
import openUrl from "src/common/openUrl";
import SettingsIcon from "../icons/settings.svg";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "../styles/Header.scss";

const EXTENSION_NAME = browser.i18n.getMessage("extName");

function renderTitle() {
    return (
        <div className="title">
            <img src="../../icons/19.png" alt="Wiki" />
            &nbsp;{EXTENSION_NAME}
        </div>
    );
}

function SettingsButton() {
    const openSettings = () => {
        const url = "../options/index.html#settings";
        openUrl(url);
    };

    return (
        <button
            className={"settingsButton"}
            onClick={openSettings}
            title={browser.i18n.getMessage("settingsLabel")}
        >
            <SettingsIcon />
        </button>
    );
}

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

function ToggleButton(props) {
    const { isConnected, isEnabledOnPage, toggleEnabledOnPage } = props;

    const getToggleButtonTitle = (isEnabled) => {
        const buttonState = isEnabled ? "disableOnThisPage" : "enableOnThisPage"
        return browser.i18n.getMessage(buttonState)
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

export default function Header(props) {
    return (
        <div id="header">
            {renderTitle()}
            {renderActionBar(props)}
        </div>
    )
};
