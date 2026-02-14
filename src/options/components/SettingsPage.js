import React, { useEffect, useState, useCallback } from "react";
import browser from "webextension-polyfill";
import {
  updateLogLevel,
  overWriteLogLevel
} from "src/common/log";
import {
  initSettings,
  getAllSettings,
  resetAllSettings,
  exportSettings,
  importSettings,
  handleSettingsChange
} from "src/settings/settings";
import defaultSettings from "src/settings/defaultSettings";
import CategoryContainer from "./CategoryContainer";

/* ---------------- component ---------------- */

export default function SettingsPage() {
  const [currentValues, setCurrentValues] = useState(null);

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

    const handleStorageChange = changes => {
      const newSettings = handleSettingsChange(changes);
      if (newSettings) {
        setCurrentValues(newSettings);
      }
    };

    browser.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      isMounted = false;
      browser.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  /* -------- handlers -------- */

  const handleReset = useCallback(async () => {
    await resetAllSettings();
    location.reload();
  }, []);

  /* ---------------- additional category ---------------- */

  const additionalCategory = handleReset => ({
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
      <p className="contentTitle">
        {browser.i18n.getMessage("settingsLabel")}
      </p>
      <hr />

      <ul>
        {defaultSettings.map((category, index) => (
          <CategoryContainer
            key={category.category || index}
            {...category}
            currentValues={currentValues}
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


