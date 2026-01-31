import React from "react";
import browser from "webextension-polyfill";
import { Link, useLocation } from "react-router-dom";
import browserInfo from "browser-info";
import "../styles/SideBar.scss";

const isValidShortcuts =
    browserInfo().name === "Firefox" && browserInfo().version >= 60;

const SideBar = () => {
    const { pathname } = useLocation();

    return (
        <div className="sideBar">
            <div className="titleContainer">
                <img src="/icons/64.png" className="logo" />
                <span className="logoTitle">Wikipedia Preview</span>
            </div>

            <ul>
                <li className={`sideBarItem ${pathname === "/settings" || pathname === "/" ? "selected" : ""}`}>
                    <Link to="/settings">{browser.i18n.getMessage("settingsLabel")}</Link>
                </li>

                {isValidShortcuts && (
                    <li className={`sideBarItem ${pathname === "/shortcuts" ? "selected" : ""}`}>
                        <Link to="/shortcuts">{browser.i18n.getMessage("shortcutsLabel")}</Link>
                    </li>
                )}

                <li className={`sideBarItem ${pathname === "/privacy-policy" ? "selected" : ""}`}>
                    <Link to="/privacy-policy">{browser.i18n.getMessage("privacyPolicyMenuTitle")}</Link>
                </li>

                <li className={`sideBarItem ${pathname === "/information" ? "selected" : ""}`}>
                    <Link to="/information">{browser.i18n.getMessage("informationLabel")}</Link>
                </li>
            </ul>
        </div>
    );
};


export default SideBar;
