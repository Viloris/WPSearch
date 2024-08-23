import React, { Component } from "react";
import browser from "webextension-polyfill";
import log from "loglevel";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import generateLangOptions from "src/common/generateLangOptions";
import Header from "./Header";
import InputArea from "./InputArea";
import ResultArea from "./ResultArea";
import Footer from "./Footer";
import "../styles/PopupPage.scss";
import { getTargetLang, tabsSendMessage } from "../../common/utils";

const logDir = "popup/PopupPage";

const getTabInfo = async () => {
    try {
        const tab = (
            await browser.tabs.query({ currentWindow: true, active: true })
        )[0];
        const tabUrl = tabsSendMessage(tab, "getTabUrl");
        const selectedText = tabsSendMessage(tab, "getSelectedText");
        /* browser.tabs.sendMessage(tab.id, {
            message: "getSelectedText"
        }); */
        const isEnabledOnPage = tabsSendMessage(tab, "getEnabled");
        /* browser.tabs.sendMessage(tab.id, {
            message: "getEnabled"
        }); */

        const tabInfo = await Promise.all([
            tabUrl,
            selectedText,
            isEnabledOnPage
        ]);
        return {
            isConnected: true,
            url: tabInfo[0],
            selectedText: tabInfo[1],
            isEnabledOnPage: tabInfo[2]
        };
    } catch (e) {
        return {
            isConnected: false,
            url: "",
            selectedText: "",
            isEnabledOnPage: false
        };
    }
};

const UILanguage = browser.i18n.getUILanguage();
const rtlLanguage = ["he", "ar"].includes(UILanguage);
const rtlLanguageClassName = rtlLanguage ? "popup-page-rtl-language" : "";

export default class PopupPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetLang: "",
            inputText: "",
            resultText: "",
            //sourceLang: "",
            isError: false,
            errorMessage: "",
            langList: [],
            tabUrl: "",
            isConnected: true,
            isEnabledOnPage: true,
            langHistory: [],
            hasResult: false,
            isErrorMain: false,
            isErrorSecond: false
        };
        this.isSwitchedSecondLang = false;
        this.init();
    }

    init = async () => {
        await initSettings();
        overWriteLogLevel();
        updateLogLevel();

        this.themeClass = getSettings("theme") + "-theme";
        document.body.classList.add(this.themeClass);
        const targetLang = getTargetLang();
        let langHistory = getSettings("langHistory");
        if (!langHistory) {
            const secondLang = getSettings("secondTargetLang");
            langHistory = [targetLang, secondLang];
            setSettings("langHistory", langHistory);
        }
        this.setState({
            targetLang: targetLang,
            langHistory: langHistory,
            langList: generateLangOptions(getSettings("translationApi"))
        });

        const tabInfo = await getTabInfo();
        this.setState({
            isConnected: tabInfo.isConnected,
            inputText: tabInfo.selectedText,
            tabUrl: tabInfo.url,
            isEnabledOnPage: tabInfo.isEnabledOnPage
        });
        if (tabInfo.selectedText !== "")
            this.handleInputText(tabInfo.selectedText);

        document.body.style.width = "348px";
    };

    handleInputText = (inputText) => {
        this.setState({ inputText: inputText });

        const waitTime = getSettings("waitTime");
        clearTimeout(this.inputTimer);
        this.inputTimer = setTimeout(async () => {
            const result = await this.translateText(inputText);
        }, waitTime);
    };

    setLangHistory = (lang) => {
        let langHistory = getSettings("langHistory") || [];
        langHistory.push(lang);
        if (langHistory.length > 30) langHistory = langHistory.slice(-30);
        setSettings("langHistory", langHistory);
        this.setState({ langHistory: langHistory });
    };

    handleLangChange = (lang) => {
        log.info(logDir, "handleLangChange()", lang);
        this.setState({ targetLang: lang });
        const inputText = this.state.inputText;
        if (inputText !== "") this.translateText(inputText, lang);
        this.setLangHistory(lang);
    };

    translateText = async (expression) => {
        log.info(logDir, "translateText()", expression);
        const replaced = expression.replaceAll("\n", "");
        const result = await browser.runtime.sendMessage({
            message: "wikipediaSearch",
            expression: replaced
        });
        this.setState({
            resultTextMain: result?.resultTextMain,
            resultTextSecond: result?.resultTextSecond,
            hasResult: true,
            isErrorMain: result?.isErrorMain,
            isErrorSecond: result?.isErrorSecond,
            errorMessageMain: result?.errorMessageMain,
            errorMessageSecond: result?.errorMessageSecond
        });
        return result;
    };

    toggleEnabledOnPage = async (e) => {
        const isEnabled = e.target.checked;
        this.setState({ isEnabledOnPage: isEnabled });
        try {
            const tab = (
                await browser.tabs.query({ currentWindow: true, active: true })
            )[0];
            if (isEnabled) await tabsSendMessage(tab, "enableExtension");
            /* browser.tabs.sendMessage(tab.id, {
                    message: "enableExtension"
                }); */ else await tabsSendMessage(tab, "disableExtension");
            /* browser.tabs.sendMessage(tab.id, {
                    message: "disableExtension"
                }); */
        } catch (e) {}
    };

    render() {
        return (
            <div className={rtlLanguageClassName}>
                <Header
                    toggleEnabledOnPage={this.toggleEnabledOnPage}
                    isEnabledOnPage={this.state.isEnabledOnPage}
                    isConnected={this.state.isConnected}
                />
                <InputArea
                    inputText={this.state.inputText}
                    handleInputText={this.handleInputText}
                />
                {this.state.hasResult && (
                    <>
                        <hr />
                        <ResultArea
                            inputText={this.state.inputText}
                            targetLang={this.state.targetLang}
                            resultTextMain={this.state.resultTextMain}
                            resultTextSecond={this.state.resultTextSecond}
                            isErrorMain={this.state.isErrorMain}
                            isErrorSecond={this.state.isErrorSecond}
                            errorMessageMain={this.state.errorMessageMain}
                            errorMessageSecond={this.state.errorMessageSecond}
                        />
                        {!this.state.isErrorMain &&
                            !this.state.isErrorSecond && (
                                <>
                                    <hr />
                                    <Footer
                                        tabUrl={this.state.tabUrl}
                                        resultTextMain={
                                            this.state.resultTextMain
                                        }
                                        resultTextSecond={
                                            this.state.resultTextSecond
                                        }
                                        inputText={this.state.inputText}
                                    />
                                </>
                            )}
                    </>
                )}
            </div>
        );
    }
}

/* function tabsSendMessage(tab, message) {
    return browser.tabs.sendMessage(tab.id, {
        message
    });
} */
