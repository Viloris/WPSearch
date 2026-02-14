import React, { useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { getSettings } from "src/settings/settings.js";
import SearchButton from "./SearchButton";
import ResultPanel from "./ResultPanel";
import "../styles/SearchContainer.scss";
import { getTargetLang } from "../../common/utils";

const DEFAULT_POSITION = { x: 0, y: 0 };

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
        position: DEFAULT_POSITION
    });

    const [panel, setPanel] = useState({
        show: false,
        position: DEFAULT_POSITION
    });

    const [results, setResults] = useState([]);

    /* ---------------- CORE ACTIONS ---------------- */

    const showPanel = useCallback(async (clickedPos = null) => {
        const useClicked =
            getSettings("panelReferencePoint") === "clickedPoint" &&
            clickedPos !== null;

        const position = useClicked ? clickedPos : selectedPosition;

        try {
            const res = await wpSearchText(selectedText);
            setPanel({ show: true, position });
            setButton((b) => ({ ...b, show: false }));
            setResults(res)
        } catch (error) {
            console.error("Search error: ", error);
        }
    }, [selectedPosition, selectedText]);

    const showButton = useCallback((pos) => {
        setButton({ show: true, position: pos });
    }, []);

    const hidePanel = useCallback(() => {
        setPanel((p) => ({ ...p, show: false }));
    }, []);

    const handleTextSelect = useCallback(
        (pos) => {
            const behavior = getSettings("whenSelectText");
            if (behavior === "dontShowButton") return removeContainer();
            if (behavior === "showButton") return showButton(pos);
            if (behavior === "showPanel") return showPanel(pos);
        },
        [removeContainer, showButton, showPanel]
    );

    /* ---------------- INIT (JAVÍTVA) ---------------- */

    useEffect(() => {
        if (!selectedText) return;
        let isMounted = true;

        const initializeSearch = async () => {
            if (shouldWPSearch) {
                await showPanel();
            } else {
                handleTextSelect(clickedPosition);
            }
        };

        if (!panel.show && !button.show && isMounted) {
            initializeSearch();
        }

        return () => { isMounted = false; };
    }, [
        button.show,
        clickedPosition,
        handleTextSelect,
        panel.show,
        selectedText,
        shouldWPSearch,
        showPanel
    ]);

    const handleButtonClick = (e) => {
        showPanel({ x: e.clientX, y: e.clientY });
    };

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
                results={results}
                hidePanel={hidePanel}
            />
        </div>
    );
}
