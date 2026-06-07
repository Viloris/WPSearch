import React from "react";
import browser from "webextension-polyfill";
import { HashRouter } from "react-router-dom";
import { initSettings, getSettings, addSettingsChangeListener, removeSettingsChangeListener } from "../../settings/settings";
import SideBar from "./SideBar";
import ContentsArea from "./ContentsArea";
import ScrollToTop from "./ScrollToTop";
import "../styles/OptionsPage.scss";

// setup theme and watch for changes

const UILanguage = browser.i18n.getUILanguage();
const rtlLanguage = ["he", "ar"].includes(UILanguage);
const optionsPageClassName =
  "optionsPage" + (rtlLanguage ? " rtl-language" : "");

/**
 *
 * @returns {JSX.Element} Component to display the options page of the extension, 
 * which includes a sidebar for navigation and a main content area that renders 
 * different sub-pages based on the current route, with theme setup and localization support
 */
export default function OptionsPage() {
  React.useEffect(() => {
    let mounted = true;
    const init = async () => {
      await initSettings();
      if (!mounted) return;
      document.body.classList.add(getSettings("theme") + "-theme");
    };
    init();

    const onSettingsChanged = (changes) => {
      if (!changes || !changes.Settings) return;
      const oldTheme = changes.Settings.oldValue?.theme;
      const newTheme = changes.Settings.newValue?.theme;
      if (!oldTheme || !newTheme || oldTheme === newTheme) return;
      document.body.classList.replace(oldTheme + "-theme", newTheme + "-theme");
    };

    addSettingsChangeListener(onSettingsChanged);

    return () => {
      mounted = false;
      removeSettingsChangeListener(onSettingsChanged);
    };
  }, []);
  return (
    <HashRouter
      hashType="noslash"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ScrollToTop>
        <div className={optionsPageClassName}>
          <SideBar />
          <ContentsArea />
        </div>
      </ScrollToTop>
    </HashRouter>
  );
}
