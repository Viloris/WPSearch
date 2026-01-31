import React, { useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { getSettings } from "src/settings/settings.js";
import SearchButton from "./SearchButton";
import ResultPanel from "./ResultPanel";
import "../styles/SearchContainer.scss";
import { getTargetLang } from "../../common/utils";

const wpSearchText = (expression) =>
    browser.runtime.sendMessage({
        message: "wikipediaSearch",
        expression
    });

export default function SearchContainer({
    selectedText,
    selectedPosition,
    clickedPosition,
    shouldWPSearch,
    removeContainer
}) {
    const currentLang = getTargetLang();

    const [button, setButton] = useState({
        show: false,
        position: { x: 0, y: 0 }
    });

    const [panel, setPanel] = useState({
        show: false,
        position: { x: 0, y: 0 }
    });

    const [result, setResult] = useState({
        resultMain: "",
        resultSecond: "",
        errorMessageMain: "",
        errorMessageSecond: "",
        isErrorMain: "",
        isErrorSecond: ""
    });

    /* ---------------- CORE ACTIONS ---------------- */

    const showPanel = useCallback(async (clickedPos = null) => {
        const useClicked =
            getSettings("panelReferencePoint") === "clickedPoint" &&
            clickedPos !== null;

        const position = useClicked ? clickedPos : selectedPosition;

        const res = await wpSearchText(selectedText);

        setPanel({ show: true, position });
        setButton((b) => ({ ...b, show: false }));
        setResult({
            resultMain: res?.resultMain,
            resultSecond: res?.resultSecond,
            errorMessageMain: res?.errorMessageMain,
            errorMessageSecond: res?.errorMessageSecond,
            isErrorMain: res?.isErrorMain,
            isErrorSecond: res?.isErrorSecond
        });
    }, [selectedPosition, selectedText]);

    const showButton = (pos) =>
        setButton({ show: true, position: pos });

    const hidePanel = () =>
        setPanel((p) => ({ ...p, show: false }));

    /* ---------------- SELECTION LOGIC ---------------- */

    const handleTextSelect = useCallback((pos) => {
        const behavior = getSettings("whenSelectText");

        if (behavior === "dontShowButton") return removeContainer();
        if (behavior === "showButton") return showButton(pos);
        if (behavior === "showPanel") return showPanel(pos);
    }, [removeContainer, showPanel]);

    /* ---------------- INIT ---------------- */

    useEffect(() => {
        if (!selectedText) return;

        if (shouldWPSearch) {
            showPanel();
        } else {
            handleTextSelect(clickedPosition);
        }
    }, [selectedText, clickedPosition, handleTextSelect, showPanel, shouldWPSearch]);

    /* ---------------- EVENTS ---------------- */

    const handleButtonClick = (e) => {
        showPanel({ x: e.clientX, y: e.clientY });
    };

    /* ---------------- RENDER ---------------- */

    return (
        <div>
            <SearchButton
                shouldShow={button.show}
                position={button.position}
                handleButtonClick={handleButtonClick}
            />
            <ResultPanel
                shouldShow={panel.show}
                position={panel.position}
                selectedText={selectedText}
                currentLang={currentLang}
                {...result}
                hidePanel={hidePanel}
            />
        </div>
    );
}
