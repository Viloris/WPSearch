import React, { Component } from "react";
import openUrl from "src/common/openUrl";
import "../styles/Footer.scss";
import { getSettings } from "../../settings/settings";
import config from "../../config.json";
import {
    getMainLangText,
    getSecondLangText,
    getTargetLang,
    getWikipediaName
} from "../../common/utils";

const { HTTPS, NOT_FOUND, NO_SUMMARY, WIKIPEDIA_URL } = config;

export default class Footer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { inputText, resultTextMain, resultTextSecond } = this.props;
        const targetLang = getTargetLang();
        const secondTargetLang = getSettings("secondTargetLang");
        const mainLangText = getMainLangText();
        const secondLangText = getSecondLangText();
        const expMain = getExpression(resultTextMain, inputText);
        const expSecond = getExpression(resultTextSecond, inputText);

        return (
            <div id="footer">
                <WikiLink
                    langCode={targetLang}
                    text={expMain}
                    langText={mainLangText}
                />
                <WikiLink
                    langCode={secondTargetLang}
                    text={expSecond}
                    langText={secondLangText}
                />
            </div>
        );
    }
}

async function handleLinkClick(langCode, text) {
    const translateUrl = `${HTTPS}${langCode}${WIKIPEDIA_URL}${text}`;
    openUrl(encodeURI(translateUrl));
}

function WikiLink(props) {
    const { langCode, langText, text } = props;

    return (
        <div className="translateLink">
            <a
                onClick={() => handleLinkClick(langCode, text)}
                style={{ color: "black" }}
            >
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
    return resultTextMain.includes(NOT_FOUND, NO_SUMMARY) ? "" : inputText;
}
