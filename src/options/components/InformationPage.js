import React, { useState, useEffect, useCallback, useMemo } from "react";
import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import queryString from "query-string";
import OptionsContainer from "./OptionContainer";
import { chromeExtensionUrl, firefoxAddonUrl } from "src/common/personalUrls";
import manifestChrome from "src/manifest-chrome.json";
import manifestFirefox from "src/manifest-firefox.json";
import { useLocation } from "react-router-dom";

/* ---------------- CUSTOM HOOK ---------------- */

const useAdditionalPermission = () => {
    const [hasPermission, setHasPermission] = useState(true);

    const permissions = useMemo(() => ({ origins: ["http://*/*", "https://*/*", "<all_urls>"] }), []);

    const checkPermission = useCallback(async () => {
        const granted = await browser.permissions.contains(permissions);
        setHasPermission(granted);
    }, [permissions]);

    const requestPermission = async () => {
        await browser.permissions.request(permissions);
        checkPermission();
    };

    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    return [hasPermission, requestPermission];
};

export default function InformationPage() {
    const location = useLocation();
    const query = queryString.parse(location.search);

    const browserData = browserInfo();
    const isFirefox = browserData.name === "Firefox";
    const isChrome = browserData.name === "Chrome";

    const extensionVersion = isFirefox
        ? manifestFirefox.version
        : manifestChrome.version;

    const [hasPermission, requestPermission] = useAdditionalPermission();

    const storeLink = isChrome ? chromeExtensionUrl : firefoxAddonUrl;
    const storeLabel = isChrome
        ? browser.i18n.getMessage("extensionPageLabel")
        : browser.i18n.getMessage("addonPageLabel");

    return (
        <div>
            <p className="contentTitle">{browser.i18n.getMessage("informationLabel")}</p>
            <hr />

            <OptionsContainer
                title="extName"
                captions={["extDescription"]}
                type="none"
                updated={query.action === "updated"}
                extraCaption={
                    <p className="caption">
                        <a href="https://github.com/Viloris" target="_blank" rel="noreferrer">
                            Version {extensionVersion}
                        </a>
                    </p>
                }
            />

            <OptionsContainer
                title="licenseLabel"
                captions={["Mozilla Public License, Version. 2.0"]}
                useRawCaptions={true}
                type="none"
            />

            {!hasPermission && (
                <>
                    <hr />
                    <OptionsContainer
                        title="additionalPermissionLabel"
                        captions={["additionalPermissionCaptionLabel"]}
                        type="button"
                        value="enableLabel"
                        onClick={requestPermission}
                    />
                </>
            )}

            <hr />
            <OptionsContainer
                title=""
                captions={[]}
                type="none"
                extraCaption={
                    <p>
                        <a href={storeLink} target="_blank" rel="noreferrer">
                            {storeLabel}
                        </a>
                    </p>
                }
            />
        </div>
    );
}


