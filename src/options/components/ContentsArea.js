import React from "react";
import { Routes, Route } from "react-router-dom";
import browserInfo from "browser-info";
import SettingsPage from "./SettingsPage";
import KeyboardShortcutsPage from "./KeyboardShortcutsPage";
import InformationPage from "./InformationPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import "../styles/ContentsArea.scss";

const isValidShortcuts =
    browserInfo().name === "Firefox" && browserInfo().version >= 60;

export default function ContentsArea() {
    return (
        <div className="contentsArea">
            <Routes>
                <Route path="/settings" element={<SettingsPage />} />
                {isValidShortcuts && (
                    <Route path="/shortcuts" element={<KeyboardShortcutsPage />} />
                )}
                <Route path="/information" element={<InformationPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                {/* fallback route */}
                <Route path="*" element={<SettingsPage />} />
            </Routes>
        </div>
    );
}
