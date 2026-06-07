import browserInfo from "browser-info";
import { CONFIG } from "../../common/constans";

const { FIREFOX } = CONFIG;

const isValidShortcuts =
    browserInfo().name === FIREFOX && browserInfo().version >= 60;

export const menuList = [
    {
        to: "/settings",
        label: "settingsLabel",
        pathName: ["/settings", "/"],
        show: true
    },
    {
        to: "/shortcuts",
        label: "shortcutsLabel",
        pathName: ["/shortcuts"],
        show: isValidShortcuts
    },
    {
        to: "/privacy-policy",
        label: "privacyPolicyMenuTitle",
        pathName: ["/privacy-policy"],
        show: true
    },
    {
        to: "/information",
        label: "informationLabel",
        pathName: ["/information"],
        show: true
    },
]