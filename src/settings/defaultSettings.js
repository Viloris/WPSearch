import browser from "webextension-polyfill";
import { getWikipediaLanguages } from "src/common/generateLangOptions";
import {
    RESULT_FONT_COLOR_LIGHT,
    RESULT_FONT_COLOR_DARK,
    BG_COLOR_LIGHT,
    BG_COLOR_DARK
} from "./defaultColors";
import { CONFIG } from "../common/constans";

const { DEFAULT_LANGUAGE, SECOND_LANGUAGE, CTRL, CMD, SHIFT, ALT,
    LANG_PLACEHOLDER,
    theme: { LIGHT, DARK, SYSTEM },
    directions: { TOP, BOTTOM, RIGHT, LEFT, TOP_RIGHT, TOP_LEFT, BOTTOM_RIGHT, BOTTOM_LEFT },
    settingsType: { CHECKBOX, NUMBER, COLOR, NONE, RADIO, SELECT, TEXT, TEXT_AREA }
} = CONFIG;
const WIKIPEDIA_LANGUAGES = getWikipediaLanguages();

const getDefaultLangs = () => {
    const uiLang = browser.i18n.getUILanguage();
    const shouldUseUiLang = WIKIPEDIA_LANGUAGES.some(
        (lang) => lang.value == uiLang
    );
    const targetLang = shouldUseUiLang ? uiLang : DEFAULT_LANGUAGE;
    const secondTargetLang =
        targetLang === DEFAULT_LANGUAGE ? SECOND_LANGUAGE : DEFAULT_LANGUAGE;
    return { targetLang, secondTargetLang };
};

const defaultLangs = getDefaultLangs();
// MV2ではwindow.matchMediaでシステムテーマを取得していたが、MV3では簡単に実装できないためオミットする
const getTheme = () => LIGHT;

export default [
    {
        category: "generalLabel",
        elements: [
            {
                id: "targetLang",
                title: "targetLangLabel",
                captions: ["targetLangCaptionLabel"],
                type: SELECT,
                default: defaultLangs.targetLang,
                options: WIKIPEDIA_LANGUAGES,
                useRawOptionName: true
            },
            {
                id: "shouldUseSecondTargetLang",
                title: "shouldUseSecondTargetLangLabel",
                captions: ["shouldUseSecondTargetLangCaptionLabel"],
                type: CHECKBOX,
                default: false,
                childElements: [
                    {
                        id: "secondTargetLang",
                        title: "secondTargetLangLabel",
                        captions: ["secondTargetLangCaptionLabel"],
                        type: SELECT,
                        default: defaultLangs.secondTargetLang,
                        options: WIKIPEDIA_LANGUAGES,
                        useRawOptionName: true
                    }
                ]
            },
            {
                id: "feedLang",
                title: "feedLangLabel",
                captions: ["feedLangCaptionLabel"],
                type: SELECT,
                default: defaultLangs.targetLang,
                options: WIKIPEDIA_LANGUAGES,
                useRawOptionName: true
            },
        ]
    },
    {
        category: "webPageLabel",
        elements: [
            {
                id: "whenSelectText",
                title: "whenSelectTextLabel",
                captions: [],
                type: NONE,
                default: "showButton",
                childElements: [
                    {
                        id: "whenSelectText",
                        title: "ifShowButtonLabel",
                        captions: ["ifShowButtonCaptionLabel"],
                        type: RADIO,
                        value: "showButton"
                    },
                    {
                        id: "whenSelectText",
                        title: "ifAutoSearchLabel",
                        captions: ["ifAutoSearchCaptionLabel"],
                        type: RADIO,
                        value: "showPanel"
                    },
                    {
                        id: "whenSelectText",
                        title: "dontShowButtonLabel",
                        captions: ["dontShowButtonCaptionLabel"],
                        type: RADIO,
                        value: "dontShowButton"
                    }
                ]
            },
            {
                id: "ifOnlySearchWhenModifierKeyPressed",
                title: "ifOnlySearchWhenModifierKeyPressedLabel",
                captions: ["ifOnlySearchWhenModifierKeyPressedCaptionLabel"],
                type: CHECKBOX,
                default: false,
                childElements: [
                    {
                        id: "modifierKey",
                        title: "modifierKeyLabel",
                        captions: [],
                        type: SELECT,
                        default: SHIFT,
                        options: [
                            {
                                name: "shiftLabel",
                                value: SHIFT
                            },
                            {
                                name: "ctrlLabel",
                                value: CTRL
                            },
                            {
                                name: "altLabel",
                                value: ALT
                            },
                            {
                                name: "cmdLabel",
                                value: CMD
                            }
                        ]
                    }
                ]
            },
            {
                title: "disableWikipediaSearchLabel",
                captions: [],
                type: NONE,
                childElements: [
                    {
                        id: "isDisabledInTextFields",
                        title: "isDisabledInTextFieldsLabel",
                        captions: ["isDisabledInTextFieldsCaptionLabel"],
                        type: CHECKBOX,
                        default: false
                    },
                    {
                        id: "isDisabledInCodeElement",
                        title: "isDisabledInCodeElementLabel",
                        captions: ["isDisabledInCodeElementCaptionLabel"],
                        type: CHECKBOX,
                        default: false
                    },
                    {
                        id: "ignoredDocumentLang",
                        title: "ignoredDocumentLangLabel",
                        captions: ["ignoredDocumentLangCaptionLabel"],
                        type: TEXT,
                        default: "",
                        placeholder: LANG_PLACEHOLDER
                    },
                    {
                        id: "disableUrlList",
                        title: "disableUrlListLabel",
                        captions: ["disableUrlListCaptionLabel"],
                        type: TEXT_AREA,
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
                type: NUMBER,
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
                type: CHECKBOX,
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
                type: SELECT,
                default: "system",
                options: [
                    {
                        name: "lightLabel",
                        value: LIGHT
                    },
                    {
                        name: "darkLabel",
                        value: DARK
                    },
                    {
                        name: "systemLabel",
                        value: SYSTEM
                    }
                ]
            },
            {
                title: "buttonStyleLabel",
                captions: ["buttonStyleCaptionLabel"],
                type: NONE,
                childElements: [
                    {
                        id: "buttonSize",
                        title: "buttonSizeLabel",
                        captions: [],
                        type: NUMBER,
                        min: 1,
                        placeholder: 22,
                        default: 22
                    },
                    {
                        id: "buttonDirection",
                        title: "displayDirectionLabel",
                        captions: [],
                        type: SELECT,
                        default: "bottomRight",
                        options: [
                            {
                                name: "topLabel",
                                value: TOP
                            },
                            {
                                name: "bottomLabel",
                                value: BOTTOM
                            },
                            {
                                name: "rightLabel",
                                value: RIGHT
                            },
                            {
                                name: "leftLabel",
                                value: LEFT
                            },
                            {
                                name: "topRightLabel",
                                value: TOP_RIGHT
                            },
                            {
                                name: "topLeftLabel",
                                value: TOP_LEFT
                            },
                            {
                                name: "bottomRightLabel",
                                value: BOTTOM_RIGHT
                            },
                            {
                                name: "bottomLeftLabel",
                                value: BOTTOM_LEFT
                            }
                        ]
                    },
                    {
                        id: "buttonOffset",
                        title: "positionOffsetLabel",
                        captions: [],
                        type: NUMBER,
                        default: 10,
                        placeholder: 10
                    }
                ]
            },
            {
                title: "panelStyleLabel",
                captions: ["panelStyleCaptionLabel"],
                type: NONE,
                childElements: [
                    {
                        id: "width",
                        title: "widthLabel",
                        captions: [],
                        type: NUMBER,
                        min: 1,
                        placeholder: 300,
                        default: 300
                    },
                    {
                        id: "height",
                        title: "heightLabel",
                        captions: [],
                        type: NUMBER,
                        min: 1,
                        placeholder: 200,
                        default: 200
                    },
                    {
                        id: "fontSize",
                        title: "fontSizeLabel",
                        captions: [],
                        type: NUMBER,
                        min: 1,
                        placeholder: 13,
                        default: 13
                    },
                    {
                        id: "panelReferencePoint",
                        title: "referencePointLabel",
                        captions: [],
                        type: SELECT,
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
                        type: SELECT,
                        default: BOTTOM,
                        options: [
                            {
                                name: "topLabel",
                                value: TOP
                            },
                            {
                                name: "bottomLabel",
                                value: BOTTOM
                            },
                            {
                                name: "rightLabel",
                                value: RIGHT
                            },
                            {
                                name: "leftLabel",
                                value: LEFT
                            },
                            {
                                name: "topRightLabel",
                                value: TOP_RIGHT
                            },
                            {
                                name: "topLeftLabel",
                                value: TOP_LEFT
                            },
                            {
                                name: "bottomRightLabel",
                                value: BOTTOM_RIGHT
                            },
                            {
                                name: "bottomLeftLabel",
                                value: BOTTOM_LEFT
                            }
                        ]
                    },
                    {
                        id: "panelOffset",
                        title: "positionOffsetLabel",
                        captions: [],
                        type: NUMBER,
                        default: 10,
                        placeholder: 10
                    },
                    {
                        id: "isOverrideColors",
                        title: "isOverrideColorsLabel",
                        captions: [],
                        type: CHECKBOX,
                        default: false
                    },
                    {
                        id: "resultFontColor",
                        title: "resultFontColorLabel",
                        captions: [],
                        type: COLOR,
                        default:
                            getTheme() === LIGHT
                                ? RESULT_FONT_COLOR_LIGHT
                                : RESULT_FONT_COLOR_DARK
                    },
                    {
                        id: "bgColor",
                        title: "bgColorLabel",
                        captions: [],
                        type: COLOR,
                        default:
                            getTheme() === LIGHT
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
                type: CHECKBOX,
                default: true
            },
            {
                id: "isDebugMode",
                title: "isDebugModeLabel",
                captions: ["isDebugModeCaptionLabel"],
                type: CHECKBOX,
                default: false
            }
        ]
    }
];
