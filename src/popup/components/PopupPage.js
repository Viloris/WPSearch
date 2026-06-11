import React, { useEffect, useState, useCallback, useRef } from "react";
import browser from "webextension-polyfill";
import log from "loglevel";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import { CONFIG } from "../../common/constans";
import Header from "./Header";
import InputArea from "./InputArea";
import "../styles/PopupPage.scss";
import { getTargetLang, getUILanguage } from "../../common/i18n";
import "../../components/styles/ResultArea.scss";
import ResultArea from "../../components/ResultArea";
import { getTabInfo, tabsSendMessage } from "../../common/urlUtils";

const {
  requestMessages: { ENABLE_EXTENSION, DISABLE_EXTENSION, WIKIPEDIA_SEARCH }
} = CONFIG;
const logDir = "popup/PopupPage";

/* ---------------- utils ---------------- */


const UILanguage = getUILanguage(); //browser.i18n.getUILanguage();
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

  const wpSearchText = useCallback(async (expression) => {
    log.info(logDir, "wpSearchText()", expression);

    const res = await browser.runtime.sendMessage({
      message: WIKIPEDIA_SEARCH,
      expression: expression.replaceAll("\n", "")
    });
    setResults(res);
  }, []);

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
        isEnabled ? ENABLE_EXTENSION : DISABLE_EXTENSION
      );
    } catch (e) {
      log.error(logDir, "toggleEnabledOnPage failed", e);
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

    inputTimer.current = setTimeout(async () => {
      try {
        await wpSearchText(text);
      } catch (error) {
        log.error(logDir, "wpSearchText failed", error);
      }
    }, waitTime);
  }, [wpSearchText]);

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

      try {
        const info = await getTabInfo();
        if (!mounted) return;

        setTabInfo({
          isConnected: info.isConnected,
          tabUrl: info.tabUrl,
          isEnabledOnPage: info.isEnabledOnPage
        });

        if (info.selectedText) {
          handleInputText(info.selectedText);
        }
      } catch (err) {
        log.warn(logDir, "getTabInfo failed", err);
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
