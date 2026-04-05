import React from "react";
import { Routes, Route } from "react-router-dom";
import browserInfo from "browser-info";
import SettingsPage from "./SettingsPage";
import KeyboardShortcutsPage from "./KeyboardShortcutsPage";
import InformationPage from "./InformationPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import "../styles/ContentsArea.scss";
import config from "../../config.json"

const { FIREFOX } = config;

const isValidShortcuts =
    browserInfo().name === FIREFOX && browserInfo().version >= 60;

const paths = [
    {
        path: "/settings",
        element: <SettingsPage />,
        show: true
    },
    {
        path: "/shortcuts",
        element: <KeyboardShortcutsPage />,
        show: isValidShortcuts
    },
    {
        path: "/information",
        element: < InformationPage />,
        show: true
    },
    {
        path: "/privacy-policy",
        element: < PrivacyPolicyPage />,
        show: true
    }, {
        /* fallback route */
        path: "*",
        element: < SettingsPage />,
        show: true
    }
]

/**
 * 
 * @description Component to display the main content area of the settings page, which renders different sub-pages based on the current route and available features, such as keyboard shortcuts for supported browsers
 * @returns {JSX.Element} Component to display the main content area of the settings page,
 * which renders different sub-pages based on the current route and available features, such as keyboard shortcuts for supported browsers
 */
export default function ContentsArea() {
    return (
        <div className="contentsArea">
            <Routes>
                {paths.filter(path => path.show).map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                ))}
            </Routes>
        </div>
    );
}
