import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import {
  initSettings,
  getAllSettings,
  resetAllSettings,
  exportSettings,
  importSettings,
  handleSettingsChange,
  addSettingsChangeListener,
  removeSettingsChangeListener
} from "src/settings/settings";
import defaultSettings from "src/settings/defaultSettings";
import CategoryContainer from "./CategoryContainer";
import { getLocaleMessage } from "../../common/i18n";

/* ---------------- component ---------------- */

/**
 *
 * @returns {JSX.element} Component to display the settings page of the extension, 
 * which initializes the settings, handles updates to the settings, and renders 
 * a list of categories and options for the user to customize their preferences, 
 * including actions to import/export settings and reset to default values
 */
export default function SettingsPage() {
  const [currentValues, setCurrentValues] = useState(null);
  const { search } = useLocation();
  const highlightFeedLang = new URLSearchParams(search).get("highlight") === "feedLang";
  const settingsReady = currentValues !== null;

  /* -------- init -------- */

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await initSettings();
      overWriteLogLevel();
      updateLogLevel();

      if (isMounted) {
        setCurrentValues(getAllSettings());
      }
    };

    init();

    const handleStorageChange = (changes) => {
      const newSettings = handleSettingsChange(changes);
      if (newSettings) {
        setCurrentValues(newSettings);
      }
    };

    addSettingsChangeListener(handleStorageChange);

    return () => {
      isMounted = false;
      removeSettingsChangeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!settingsReady || !highlightFeedLang) return;

    const input = document.getElementById("feedLang");
    if (input) {
      input.scrollIntoView({ block: "center" });
      input.focus({ preventScroll: true });
    }
  }, [settingsReady, highlightFeedLang]);

  /* -------- handlers -------- */

  const handleReset = useCallback(async () => {
    await resetAllSettings();
    location.reload();
  }, []);

  /* ---------------- additional category ---------------- */

  const additionalCategory = (handleReset) => ({
    category: "",
    elements: [
      {
        id: "importSettings",
        title: "importSettingsLabel",
        captions: ["importSettingsCaptionLabel"],
        type: "file",
        accept: ".json",
        value: "importButtonLabel",
        onChange: importSettings
      },
      {
        id: "exportSettings",
        title: "exportSettingsLabel",
        captions: ["exportSettingsCaptionLabel"],
        type: "button",
        value: "exportButtonLabel",
        onClick: exportSettings
      },
      {
        id: "resetSettings",
        title: "resetSettingsLabel",
        captions: ["resetSettingsCaptionLabel"],
        type: "button",
        value: "resetSettingsButtonLabel",
        onClick: handleReset
      }
    ]
  });

  /* -------- render -------- */

  if (!currentValues) return null;

  return (
    <div>
      <p className="contentTitle">{getLocaleMessage("settingsLabel")}</p>
      <hr />
      <ul>
        {defaultSettings.map((category, index) => (
          <CategoryContainer
            key={category.category || index}
            {...category}
            currentValues={currentValues}
            highlightedOption={highlightFeedLang ? "feedLang" : null}
          />
        ))}
        <CategoryContainer
          {...additionalCategory(handleReset)}
          currentValues={currentValues}
        />
      </ul>
    </div>
  );
}
