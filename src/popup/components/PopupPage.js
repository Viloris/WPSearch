import React, { useEffect, useState, useCallback, useRef } from "react";
import browser from "webextension-polyfill";
import log from "loglevel";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import Header from "./Header";
import InputArea from "./InputArea";
import "../styles/PopupPage.scss";
import { getTargetLang, tabsSendMessage } from "../../common/utils";
import "../../common/styles/ResultArea.scss";
import ResultArea from "../../common/ResultArea";

const logDir = "popup/PopupPage";

/* ---------------- utils ---------------- */

/**
 *
 * @returns {Object<{ isConnected: true, url, selectedText, isEnabledOnPage }>} Tab information including connection status, url,
 * selected text and enabled status on page,  or default values if error occurs
 */
const getTabInfo = async () => {
  try {
    const [tab] = await browser.tabs.query({
      currentWindow: true,
      active: true
    });

    const [url, selectedText, isEnabledOnPage] = await Promise.all([
      tabsSendMessage(tab, "getTabUrl"),
      tabsSendMessage(tab, "getSelectedText"),
      tabsSendMessage(tab, "getEnabled")
    ]);

    return { isConnected: true, url, selectedText, isEnabledOnPage };
  } catch (e) {
    console.error(e);
    return {
      isConnected: false,
      url: "",
      selectedText: "",
      isEnabledOnPage: false
    };
  }
};

const UILanguage = browser.i18n.getUILanguage();
const rtlLanguageClassName = ["he", "ar"].includes(UILanguage)
  ? "popup-page-rtl-language"
  : "";

/* ---------------- component ---------------- */

/**
 *
 * @returns {JSX.Element} Popup page component managing state and handlers for input text, search results,
 * tab information and information label visibility, rendering header,
 * input area and result area components, and initializing settings and theme on mount
 */
export default function PopupPage() {
  const [targetLang, setTargetLang] = useState("");
  const [inputText, setInputText] = useState("");
  const [tabInfo, setTabInfo] = useState({
    isConnected: true,
    tabUrl: "",
    isEnabledOnPage: true
  });
  const [results, setResults] = useState([]);
  const [hideInformationLabel, setHideInformationLabel] = useState(false);

  const inputTimer = useRef(null);
  const themeClass = useRef(null);

  /* -------- handlers -------- */

  const wpSearchText = async (expression) => {
    log.info(logDir, "wpSearchText()", expression);

    const res = await browser.runtime.sendMessage({
      message: "wikipediaSearch",
      expression: expression.replaceAll("\n", "")
    });

    setResults(res);
  };

  const toggleEnabledOnPage = async (e) => {
    const isEnabled = e.target.checked;
    setTabInfo((prev) => ({ ...prev, isEnabledOnPage: isEnabled }));

    try {
      const [tab] = await browser.tabs.query({
        currentWindow: true,
        active: true
      });
      await tabsSendMessage(
        tab,
        isEnabled ? "enableExtension" : "disableExtension"
      );
    } catch (e) {
      console.error(e);
    }
  };

  const dismissHint = () => {
    setSettings("hidePopupInformationLabel", true);
    setHideInformationLabel(true);
  };

  const handleInputText = useCallback((text) => {
    setInputText(text);

    clearTimeout(inputTimer.current);
    const waitTime = getSettings("waitTime");

    inputTimer.current = setTimeout(() => {
      wpSearchText(text);
    }, waitTime);
  }, []);

  /* -------- init -------- */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await initSettings();
      overWriteLogLevel();
      updateLogLevel();

      themeClass.current = `${getSettings("theme")}-theme`;
      document.body.classList.add(themeClass.current);
      document.body.style.width = "348px";

      if (!mounted) return;

      setTargetLang(getTargetLang());
      setHideInformationLabel(!!getSettings("hidePopupInformationLabel"));

      const info = await getTabInfo();
      if (!mounted) return;

      setTabInfo({
        isConnected: info.isConnected,
        tabUrl: info.url,
        isEnabledOnPage: info.isEnabledOnPage
      });

      if (info.selectedText) {
        handleInputText(info.selectedText);
      }
    };

    init();

    return () => {
      mounted = false;
      clearTimeout(inputTimer.current);
      if (themeClass.current) {
        document.body.classList.remove(themeClass.current);
      }
    };
  }, [handleInputText]);

  /* -------- render -------- */

  return (
    <div className={rtlLanguageClassName}>
      <Header
        toggleEnabledOnPage={toggleEnabledOnPage}
        isEnabledOnPage={tabInfo.isEnabledOnPage}
        isConnected={tabInfo.isConnected}
      />
      <InputArea inputText={inputText} handleInputText={handleInputText} />
      {results.length > 0 && (
        <>
          <hr />
          <div id="resultArea">
            <ResultArea
              inputText={inputText}
              targetLang={targetLang}
              dismissHint={dismissHint}
              hideInformationLabel={hideInformationLabel}
              results={results}
            />
          </div>
        </>
      )}
    </div>
  );
}
