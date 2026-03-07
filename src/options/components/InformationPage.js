import React, { useState, useEffect, useCallback, useMemo } from "react";
import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import queryString from "query-string";
import OptionsContainer from "./OptionContainer";
import { chromeExtensionUrl, firefoxAddonUrl } from "src/common/personalUrls";
import manifestChrome from "src/manifest-chrome.json";
import manifestFirefox from "src/manifest-firefox.json";
import { useLocation } from "react-router-dom";
import config from "../../config.json";
import { getLocaleMessage } from "../../common/utils";

const { FIREFOX, CHROME, gitHubUrl } = config;

/* ---------------- CUSTOM HOOK ---------------- */

const useAdditionalPermission = () => {
  const [hasPermission, setHasPermission] = useState(true);

  const permissions = useMemo(
    () => ({ origins: ["http://*/*", "https://*/*", "<all_urls>"] }),
    []
  );

  const checkPermission = useCallback(async () => {
    const granted = await browser.permissions.contains(permissions);
    setHasPermission(granted);
  }, [permissions]);

  const requestPermission = async () => {
    await browser.permissions.request(permissions);
    checkPermission();
  };

  useEffect(() => {
    const run = async () => {
      await checkPermission();
    };
    run();
  }, [checkPermission]);

  return [hasPermission, requestPermission];
};

/**
 *
 * @returns {JSX.Element}
 */
export default function InformationPage() {
  const location = useLocation();
  const query = queryString.parse(location.search);

  const browserData = browserInfo();
  const isFirefox = browserData.name === FIREFOX;
  const isChrome = browserData.name === CHROME;

  const extensionVersion = isFirefox
    ? manifestFirefox.version
    : manifestChrome.version;

  const [hasPermission, requestPermission] = useAdditionalPermission();

  const storeLink = isChrome ? chromeExtensionUrl : firefoxAddonUrl;
  const storeLabel = isChrome
    ? getLocaleMessage("extensionPageLabel")
    : getLocaleMessage("addonPageLabel");

  const options = [
    {
      title: "extName",
      captions: ["extDescription"],
      type: "none",
      updated: query.action === "updated",
      extraCaption: (
        <p className="caption">
          <a href={gitHubUrl} target="_blank" rel="noreferrer">
            Version {extensionVersion}
          </a>
        </p>
      ),
      show: true
    },
    {
      title: "licenseLabel",
      captions: ["Mozilla Public License, Version. 2.0"],
      useRawCaptions: true,
      type: "none",
      show: true
    },
    {
      title: "additionalPermissionLabel",
      captions: ["additionalPermissionCaptionLabel"],
      type: "button",
      value: "enableLabel",
      onClick: requestPermission,
      show: !hasPermission
    },
    {
      title: "",
      captions: [],
      type: "none",
      extraCaption: (
        <p>
          <a href={storeLink} target="_blank" rel="noreferrer">
            {storeLabel}
          </a>
        </p>
      ),
      show: true
    }
  ];

  return (
    <div>
      <p className="contentTitle">{getLocaleMessage("informationLabel")}</p>
      <hr />
      {options
        .filter((item) => item.show)
        .map(({ show, ...item }) => (
          <OptionsContainer key={item.title} {...item} />
        ))}
    </div>
  );
}
