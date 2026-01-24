import React, { Component } from "react";
import browser from "webextension-polyfill";
import log from "loglevel";
import {
    initSettings,
    getSettings,
    setSettings
} from "src/settings/settings.js";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import Header from "./Header";
import InputArea from "./InputArea";
import "../styles/PopupPage.scss";
import { getTargetLang, tabsSendMessage, getHidePopupInfromationLabel } from "../../common/utils";
import ResultArea from "./ResultArea";

const logDir = "popup/PopupPage";

const getTabInfo = async () => {
    try {
        const tab = (
            await browser.tabs.query({ currentWindow: true, active: true })
        )[0];
        const tabUrl = tabsSendMessage(tab, "getTabUrl");
        const selectedText = tabsSendMessage(tab, "getSelectedText");
        const isEnabledOnPage = tabsSendMessage(tab, "getEnabled");

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
        console.error(e)
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
            isError: false,
            errorMessage: "",
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
        this.setState({
            targetLang: targetLang
        });

        const hideInformationLabel = getHidePopupInfromationLabel()
        this.setState({
            hideInformationLabel: hideInformationLabel
        })

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
            await this.wpSearchText(inputText);
        }, waitTime);
    };

    wpSearchText = async (expression) => {
        log.info(logDir, "wpSearchText()", expression);
        const replaced = expression.replaceAll("\n", "");
        const result = await browser.runtime.sendMessage({
            message: "wikipediaSearch",
            expression: replaced
        });
        this.setState({
            resultMain: result?.resultMain,
            resultSecond: result?.resultSecond,
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
            else await tabsSendMessage(tab, "disableExtension");
        } catch (e) { console.error(e) }
    };

    dismissHint = () => {
        setSettings("hidePopupInformationLabel", true);
        this.setState({
            hideInformationLabel: true
        });
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
                            errorMessageMain={this.state.errorMessageMain}
                            errorMessageSecond={this.state.errorMessageSecond}
                            isErrorMain={this.state.isErrorMain}
                            isErrorSecond={this.state.isErrorSecond}
                            inputText={this.state.inputText}
                            resultMain={this.state.resultMain}
                            resultSecond={this.state.resultSecond}
                            targetLang={this.state.targetLang}
                            dismissHint={this.dismissHint}
                            hideInformationLabel={
                                this.state.hideInformationLabel
                            }
                        />
                    </>
                )}
            </div>
        );
    }
}
