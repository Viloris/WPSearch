import browser from "webextension-polyfill";
import { tabsSendMessage } from "../common/urlUtils";
import log from "loglevel";
import { CONFIG } from "../common/constans";

const logDir = "popup/PopupPage";
const {
    requestMessages: { ENABLE_EXTENSION, DISABLE_EXTENSION }
} = CONFIG;

export const handleToggleEnabledOnPage = async (e, setTabInfo) => {
    const isEnabled = e.target.checked;
    setTabInfo((prev) => ({ ...prev, isEnabledOnPage: isEnabled }));

    try {
        const [tab] = await browser.tabs.query({
            currentWindow: true,
            active: true
        });
        await tabsSendMessage(
            tab,
            isEnabled ? ENABLE_EXTENSION : DISABLE_EXTENSION
        );
    } catch (e) {
        log.error(logDir, "HandleToggleEnabledOnPage failed", e);
    }
};