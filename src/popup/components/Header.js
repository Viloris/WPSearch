import React from "react";
import browser from "webextension-polyfill";
import openUrl from "src/common/openUrl";
import SettingsIcon from "../icons/settings.svg";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "../styles/Header.scss";

const EXTENSION_NAME = browser.i18n.getMessage("extName");

export default (props) => (
    <div id="header">
        {renderTitle()}
        {renderActionBar(props)}
    </div>
);

function renderTitle() {
    return (
        <div className="title">
            <img src="../../icons/19.png" alt="Wiki" />
            &nbsp;{EXTENSION_NAME}
        </div>
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

function ToggleButton(props) {
    const { isConnected, isEnabledOnPage, toggleEnabledOnPage } = props;

    const getToggleButtonTitle = (isEnabled) => {
        return isEnabled
            ? browser.i18n.getMessage("disableOnThisPage")
            : browser.i18n.getMessage("enableOnThisPage");
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
