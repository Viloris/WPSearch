import Browser from "webextension-polyfill";

export default async (url, isCurrentTab = false) => {
    const activeTab = (
        await Browser.tabs.query({ currentWindow: true, active: true })
    )[0];

    if (isCurrentTab) Browser.tabs.update({ url: url });
    else Browser.tabs.create({ url: url, index: activeTab.index + 1 });
};
