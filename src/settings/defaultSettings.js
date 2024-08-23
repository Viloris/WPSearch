import React from "react";
import browser from "webextension-polyfill";
import generateLangOptions, {
    getWikipediaLanguages
} from "src/common/generateLangOptions";
import { getSettings, setSettings } from "./settings";
import {
    RESULT_FONT_COLOR_LIGHT,
    RESULT_FONT_COLOR_DARK,
    CANDIDATE_FONT_COLOR_LIGHT,
    CANDIDATE_FONT_COLOR_DARK,
    BG_COLOR_LIGHT,
    BG_COLOR_DARK
} from "./defaultColors";
//import { getSecondTargetLang, getTargetLang } from "../common/utils";

const DEFAULT_LANGUAGE = "en";
const ALTERNATIVE_LANGUAGE = "de";

const getDefaultLangs = () => {
    const uiLang = browser.i18n.getUILanguage();
    const langOptions = generateLangOptions("google");

    const shouldUseUiLang = langOptions.some((lang) => lang.value == uiLang);
    const targetLang = shouldUseUiLang ? uiLang : DEFAULT_LANGUAGE;
    const secondTargetLang =
        targetLang === DEFAULT_LANGUAGE
            ? ALTERNATIVE_LANGUAGE
            : DEFAULT_LANGUAGE;

    return { targetLang, secondTargetLang };
};

/* const updateLangsWhenChangeTranslationApi = () => {
    const translationApi = getSettings("translationApi");
    const targetLang = getTargetLang(); //getSettings("targetLang");
    const secondTargetLang = getSecondTargetLang(); //getSettings("secondTargetLang");
    const currentLangs = generateLangOptions(translationApi).map(
        (option) => option.value
    );

    const mappingLang = (lang) => {
        switch (lang) {
            case "en":
                return "en-US";
            case "en-US":
            case "en-GB":
                return "en";
            case "zh":
                return "zh-CN";
            case "zh-CN":
            case "zh-TW":
                return "zh";
            case "pt":
                return "pt-PT";
            case "pt-PT":
            case "pt-BR":
                return "pt";
            default:
                return currentLangs[0];
        }
    };

    if (!currentLangs.includes(targetLang))
        setSettings("targetLang", mappingLang(targetLang));
    if (!currentLangs.includes(secondTargetLang))
        setSettings("secondTargetLang", mappingLang(secondTargetLang));
}; */

const defaultLangs = getDefaultLangs();
// MV2ではwindow.matchMediaでシステムテーマを取得していたが、MV3では簡単に実装できないためオミットする
const getTheme = () => "light";

export default [
    {
        category: "generalLabel",
        elements: [
            {
                id: "targetLang",
                title: "targetLangLabel",
                captions: ["targetLangCaptionLabel"],
                type: "select",
                default: defaultLangs.targetLang,
                options: () => getWikipediaLanguages(),
                /* getSettings("translationApi") */
                useRawOptionName: true
            },
            {
                id: "secondTargetLang",
                title: "secondTargetLangLabel",
                captions: ["secondTargetLangCaptionLabel"],
                type: "select",
                default: defaultLangs.secondTargetLang,
                options: () => getWikipediaLanguages(),
                //  generateLangOptions(getSettings("translationApi")),
                useRawOptionName: true
            }
        ]
    },
    {
        category: "webPageLabel",
        elements: [
            {
                id: "whenSelectText",
                title: "whenSelectTextLabel",
                captions: [],
                type: "none",
                default: "showButton",
                childElements: [
                    {
                        id: "whenSelectText",
                        title: "ifShowButtonLabel",
                        captions: ["ifShowButtonCaptionLabel"],
                        type: "radio",
                        value: "showButton"
                    },
                    {
                        id: "whenSelectText",
                        title: "ifAutoTranslateLabel",
                        captions: ["ifAutoTranslateCaptionLabel"],
                        type: "radio",
                        value: "showPanel"
                    },
                    {
                        id: "whenSelectText",
                        title: "dontShowButtonLabel",
                        captions: ["dontShowButtonCaptionLabel"],
                        type: "radio",
                        value: "dontShowButton"
                    }
                ]
            },
            {
                id: "ifOnlyTranslateWhenModifierKeyPressed",
                title: "ifOnlyTranslateWhenModifierKeyPressedLabel",
                captions: ["ifOnlyTranslateWhenModifierKeyPressedCaptionLabel"],
                type: "checkbox",
                default: false,
                childElements: [
                    {
                        id: "modifierKey",
                        title: "modifierKeyLabel",
                        captions: [],
                        type: "select",
                        default: "shift",
                        options: [
                            {
                                name: "shiftLabel",
                                value: "shift"
                            },
                            {
                                name: "ctrlLabel",
                                value: "ctrl"
                            },
                            {
                                name: "altLabel",
                                value: "alt"
                            },
                            {
                                name: "cmdLabel",
                                value: "cmd"
                            }
                        ]
                    }
                ]
            },
            {
                title: "disableTranslationLabel",
                captions: [],
                type: "none",
                childElements: [
                    {
                        id: "isDisabledInTextFields",
                        title: "isDisabledInTextFieldsLabel",
                        captions: ["isDisabledInTextFieldsCaptionLabel"],
                        type: "checkbox",
                        default: false
                    },
                    {
                        id: "isDisabledInCodeElement",
                        title: "isDisabledInCodeElementLabel",
                        captions: ["isDisabledInCodeElementCaptionLabel"],
                        type: "checkbox",
                        default: false
                    },
                    {
                        id: "ignoredDocumentLang",
                        title: "ignoredDocumentLangLabel",
                        captions: ["ignoredDocumentLangCaptionLabel"],
                        type: "text",
                        default: "",
                        placeholder: "en, ru, zh"
                    },
                    {
                        id: "disableUrlList",
                        title: "disableUrlListLabel",
                        captions: ["disableUrlListCaptionLabel"],
                        type: "textarea",
                        default: "",
                        placeholder:
                            "https://example.com/*\nhttps://example.net/*"
                    }
                ]
            }
        ]
    },
    {
        category: "toolbarLabel",
        elements: [
            {
                id: "waitTime",
                title: "waitTimeLabel",
                captions: ["waitTimeCaptionLabel", "waitTime2CaptionLabel"],
                type: "number",
                min: 0,
                placeholder: 800,
                default: 800
            }
        ]
    },
    {
        category: "menuLabel",
        elements: [
            {
                id: "ifShowMenu",
                title: "ifShowMenuLabel",
                captions: ["ifShowMenuCaptionLabel"],
                type: "checkbox",
                default: true
            }
        ]
    },
    {
        category: "styleLabel",
        elements: [
            {
                id: "theme",
                title: "themeLabel",
                captions: ["themeCaptionLabel"],
                type: "select",
                default: "system",
                options: [
                    {
                        name: "lightLabel",
                        value: "light"
                    },
                    {
                        name: "darkLabel",
                        value: "dark"
                    },
                    {
                        name: "systemLabel",
                        value: "system"
                    }
                ]
            },
            {
                title: "buttonStyleLabel",
                captions: ["buttonStyleCaptionLabel"],
                type: "none",
                childElements: [
                    {
                        id: "buttonSize",
                        title: "buttonSizeLabel",
                        captions: [],
                        type: "number",
                        min: 1,
                        placeholder: 22,
                        default: 22
                    },
                    {
                        id: "buttonDirection",
                        title: "displayDirectionLabel",
                        captions: [],
                        type: "select",
                        default: "bottomRight",
                        options: [
                            {
                                name: "topLabel",
                                value: "top"
                            },
                            {
                                name: "bottomLabel",
                                value: "bottom"
                            },
                            {
                                name: "rightLabel",
                                value: "right"
                            },
                            {
                                name: "leftLabel",
                                value: "left"
                            },
                            {
                                name: "topRightLabel",
                                value: "topRight"
                            },
                            {
                                name: "topLeftLabel",
                                value: "topLeft"
                            },
                            {
                                name: "bottomRightLabel",
                                value: "bottomRight"
                            },
                            {
                                name: "bottomLeftLabel",
                                value: "bottomLeft"
                            }
                        ]
                    },
                    {
                        id: "buttonOffset",
                        title: "positionOffsetLabel",
                        captions: [],
                        type: "number",
                        default: 10,
                        placeholder: 10
                    }
                ]
            },
            {
                title: "panelStyleLabel",
                captions: ["panelStyleCaptionLabel"],
                type: "none",
                childElements: [
                    {
                        id: "width",
                        title: "widthLabel",
                        captions: [],
                        type: "number",
                        min: 1,
                        placeholder: 300,
                        default: 300
                    },
                    {
                        id: "height",
                        title: "heightLabel",
                        captions: [],
                        type: "number",
                        min: 1,
                        placeholder: 200,
                        default: 200
                    },
                    {
                        id: "fontSize",
                        title: "fontSizeLabel",
                        captions: [],
                        type: "number",
                        min: 1,
                        placeholder: 13,
                        default: 13
                    },
                    {
                        id: "panelReferencePoint",
                        title: "referencePointLabel",
                        captions: [],
                        type: "select",
                        default: "bottomSelectedText",
                        options: [
                            {
                                name: "topSelectedTextLabel",
                                value: "topSelectedText"
                            },
                            {
                                name: "bottomSelectedTextLabel",
                                value: "bottomSelectedText"
                            },
                            {
                                name: "clickedPointLabel",
                                value: "clickedPoint"
                            }
                        ]
                    },
                    {
                        id: "panelDirection",
                        title: "displayDirectionLabel",
                        captions: [],
                        type: "select",
                        default: "bottom",
                        options: [
                            {
                                name: "topLabel",
                                value: "top"
                            },
                            {
                                name: "bottomLabel",
                                value: "bottom"
                            },
                            {
                                name: "rightLabel",
                                value: "right"
                            },
                            {
                                name: "leftLabel",
                                value: "left"
                            },
                            {
                                name: "topRightLabel",
                                value: "topRight"
                            },
                            {
                                name: "topLeftLabel",
                                value: "topLeft"
                            },
                            {
                                name: "bottomRightLabel",
                                value: "bottomRight"
                            },
                            {
                                name: "bottomLeftLabel",
                                value: "bottomLeft"
                            }
                        ]
                    },
                    {
                        id: "panelOffset",
                        title: "positionOffsetLabel",
                        captions: [],
                        type: "number",
                        default: 10,
                        placeholder: 10
                    },
                    {
                        id: "isOverrideColors",
                        title: "isOverrideColorsLabel",
                        captions: [],
                        type: "checkbox",
                        default: false
                    },
                    {
                        id: "resultFontColor",
                        title: "resultFontColorLabel",
                        captions: [],
                        type: "color",
                        default:
                            getTheme() === "light"
                                ? RESULT_FONT_COLOR_LIGHT
                                : RESULT_FONT_COLOR_DARK
                    },
                    {
                        id: "bgColor",
                        title: "bgColorLabel",
                        captions: [],
                        type: "color",
                        default:
                            getTheme() === "light"
                                ? BG_COLOR_LIGHT
                                : BG_COLOR_DARK
                    }
                ]
            }
        ]
    },
    {
        category: "otherLabel",
        elements: [
            {
                id: "isShowOptionsPageWhenUpdated",
                title: "isShowOptionsPageWhenUpdatedLabel",
                captions: ["isShowOptionsPageWhenUpdatedCaptionLabel"],
                type: "checkbox",
                default: true
            },
            {
                id: "isDebugMode",
                title: "isDebugModeLabel",
                captions: ["isDebugModeCaptionLabel"],
                type: "checkbox",
                default: false
            }
        ]
    }
];
