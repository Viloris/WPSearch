import React, { Component } from "react";
import openUrl from "src/common/openUrl";
import "../styles/Footer.scss";
import { getSettings, setSettings } from "../../settings/settings";
import config from "../../config.json";
import {
    getMainLangText,
    getSecondLangText,
    getTargetLang,
    getWikipediaName
} from "../../common/utils";
import InfoBar from "../../common/infoBar";

const { HTTPS, NO_SUMMARY, WIKIPEDIA_URL } = config;

export default class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hideInformationLabel: getSettings("hideInformationLabel")
        };
    }

    dismissHint = () => {
        setSettings("hideInformationLabel", true);
        this.setState({
            hideInformationLabel: true,
            hidePanel: true
        });
    };

    render() {
        const { inputText, resultTextMain, resultTextSecond } = this.props;
        const targetLang = getTargetLang();
        const secondTargetLang = getSettings("secondTargetLang");
        const mainLangText = getMainLangText();
        const secondLangText = getSecondLangText();
        const expMain = getExpression(resultTextMain, inputText);
        const useTheSecondTargetLang = getSettings("shouldUseSecondTargetLang");
        const expSecond = useTheSecondTargetLang
            ? getExpression(resultTextSecond, inputText)
            : "";
        const information = browser.i18n.getMessage("firstInformationText");
        return (
            <>
                <div id="footer">
                    <WikiLink
                        langCode={targetLang}
                        text={expMain}
                        langText={mainLangText}
                    />
                    {useTheSecondTargetLang && (
                        <WikiLink
                            langCode={secondTargetLang}
                            text={expSecond}
                            langText={secondLangText}
                        />
                    )}
                </div>
                {!this.state.hideInformationLabel && (
                    <InfoBar
                        hidePanel={this.state.hidePanel}
                        message={information}
                        onClick={this.dismissHint}
                    />
                )}
            </>
        );
    }
}

async function handleLinkClick(langCode, text) {
    const wikipediaUrl = `${HTTPS}${langCode}${WIKIPEDIA_URL}${text}`;
    openUrl(encodeURI(wikipediaUrl));
}

function WikiLink(props) {
    const { langCode, langText, text } = props;

    return (
        <div className="wikipediaLink">
            <a onClick={() => handleLinkClick(langCode, text)}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "center",
                        marginRight: "0.5em"
                    }}
                >
                    <img src="../../icons/19.png" alt="Wiki" />
                    &nbsp;
                    {getWikipediaName(langCode)}
                </div>
            </a>
        </div>
    );
}

function getExpression(resultTextMain, inputText) {
    return resultTextMain.includes(
        browser.i18n.getMessage("NOT_FOUND"),
        NO_SUMMARY
    )
        ? ""
        : inputText;
}
