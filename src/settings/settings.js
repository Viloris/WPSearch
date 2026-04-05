import browser from "webextension-polyfill";
import log from "loglevel";
import defaultSettings from "./defaultSettings";

const logDir = "settings/settings";
const SETTINGS = "Settings";
let currentSettings = {};

/**
 * Initializes settings by fetching from local storage, comparing with default settings
 * and updating local storage with any missing default settings, ensuring all necessary
 * settings are present with either saved or default values
 */
export const initSettings = async () => {
    const response = await browser.storage.local.get(SETTINGS);
    currentSettings = response.Settings || {};
    let shouldSave = false;

    const pushSettings = (element) => {
        if (element.id == undefined || element.default == undefined) return;
        if (currentSettings[element.id] == undefined) {
            currentSettings[element.id] = element.default;
            shouldSave = true;
        }
    };

    const fetchDefaultSettings = () => {
        defaultSettings.forEach((category) => {
            category.elements.forEach((optionElement) => {
                pushSettings(optionElement);
                if (optionElement.childElements) {
                    optionElement.childElements.forEach((childElement) => {
                        pushSettings(childElement);
                    });
                }
            });
        });
    };

    fetchDefaultSettings();
    if (shouldSave)
        await browser.storage.local.set({ Settings: currentSettings });
};

/**
 * 
 * @param {number} id 
 * @param {string} value
 * @returns {Promise} Updates a specific setting in local storage and currentSettings object, logging the change
 */
export const setSettings = async (id, value) => {
    log.info(logDir, "setSettings()", id, value);
    currentSettings[id] = value;
    await browser.storage.local.set({ Settings: currentSettings });
};

/**
 * 
 * @param {*} id
 * @returns {string|number|boolean} Retrieves a specific setting value from currentSettings object by id
 */
export const getSettings = (id) => {
    return currentSettings[id];
};

/**
 * 
 * @returns {Object} Retrieves all current settings
 */
export const getAllSettings = () => {
    return currentSettings;
};

/**
 * Resets all settings to default values by clearing currentSettings, updating local storage and reinitializing settings, logging the reset action
 * @returns {Promise} --- IGNORE ---
 */
export const resetAllSettings = async () => {
    log.info(logDir, "resetAllSettings()");
    currentSettings = {};
    await browser.storage.local.set({ Settings: currentSettings });
    await initSettings();
};

/**
 * 
 * @param {Object} changes 
 * @returns {Object|null} Updates currentSettings with new values from changes if SETTINGS key is present, returning updated settings or null if no relevant changes
 */
export const handleSettingsChange = (changes) => {
    if (Object.keys(changes).includes(SETTINGS)) {
        currentSettings = changes.Settings.newValue;
        return currentSettings;
    }
    return null;
};

const getSettingsIds = () => {
    let settingsIds = [];
    defaultSettings.forEach((category) => {
        category.elements.forEach((optionElement) => {
            if (optionElement.id && optionElement.default !== undefined)
                settingsIds.push(optionElement.id);
            if (optionElement.childElements) {
                optionElement.childElements.forEach((childElement) => {
                    if (childElement.id && childElement.default !== undefined)
                        settingsIds.push(childElement.id);
                });
            }
        });
    });
    return settingsIds;
};

/**
 * Exports settings to a JSON file by creating a blob from current settings,
 * generating a download link and triggering the download, allowing users to save their settings externally
 * @returns {Promise} --- IGNORE ---
 */
export const exportSettings = async () => {
    const settingsIds = getSettingsIds();

    let settingsObj = {};
    for (const id of settingsIds) {
        settingsObj[id] = getSettings(id);
    }

    const downloadUrl = URL.createObjectURL(
        new Blob([JSON.stringify(settingsObj, null, "  ")], {
            type: "application/json"
        })
    );

    const a = document.createElement("a");
    document.body.appendChild(a);
    a.download = "WikipediaSearch_Settings.json";
    a.href = downloadUrl;
    a.click();
    a.remove();
    URL.revokeObjectURL(downloadUrl);
};

/**
 * 
 * @param {Object} e 
 * @description Imports settings from a JSON file, updating current settings and reloading the page to apply changes,
 * allowing users to easily transfer their settings by selecting a previously exported settings file
 * @returns {Promise} --- IGNORE ---
 */
export const importSettings = async (e) => {
    const reader = new FileReader();

    reader.onload = async () => {
        const importedSettings = JSON.parse(reader.result);
        const settingsIds = getSettingsIds();

        for (const id of settingsIds) {
            if (importedSettings[id] !== undefined)
                await setSettings(id, importedSettings[id]);
        }

        location.reload(true);
    };

    const file = e.target.files[0];
    reader.readAsText(file);
};
