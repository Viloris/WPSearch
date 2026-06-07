import browser from "webextension-polyfill";

/**
 * 
 * @description Opens the given URL in a new tab or the current tab based on isCurrentTab flag, ensuring the new tab is opened next to the currently active tab for better user experience
 * @param {string} url
 * @param {boolean} isCurrentTab
 * @returns {Promise<void>} Opens the given URL in a new tab or the current tab based on isCurrentTab flag
 */
export default async (url, isCurrentTab = false) => {
    const activeTab = (
        await browser.tabs.query({ currentWindow: true, active: true })
    )[0];

    if (isCurrentTab) browser.tabs.update({ url: url });
    else browser.tabs.create({ url: url, index: activeTab.index + 1 });
};
