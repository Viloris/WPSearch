import React, { useEffect, useRef, useState } from "react";
import { getSettings, setSettings } from "src/settings/settings";
import "../styles/ResultPanel.scss";
import { getBackgroundColor } from "../../settings/defaultColors";
import ResultArea from "../../common/ResultArea";

/**
 * 
 * @param {boolean} shouldShow
 * @param {number} position
 * @param {Array} results
 * @returns {JSX.Element}
 */
export default function ResultPanel({ shouldShow, position, results }) {
    const panelRef = useRef(null);
    const wrapperRef = useRef(null);

    const [layout, setLayout] = useState({
        x: 0,
        y: 0,
        width: parseInt(getSettings("width")),
        height: parseInt(getSettings("height")),
        isOverflow: false
    });

    const [hideInfoLabel, setHideInfoLabel] = useState(
        getSettings("hideInformationLabel")
    );

    /* ---------------- DRAG ---------------- */

    useEffect(() => {
        let dragging = false;
        let offset = { x: 0, y: 0 };

        const start = (e) => {
            if (e.target.className !== "simple-wikipedia-search-move") return;
            dragging = true;
            const rect = panelRef.current.getBoundingClientRect();
            offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            e.dataTransfer.setData("text/plain", "");
        };

        const move = (e) => {
            if (!dragging) return;
            e.preventDefault();
            panelRef.current.style.top = `${e.clientY - offset.y}px`;
            panelRef.current.style.left = `${e.clientX - offset.x}px`;
        };

        const end = (e) => {
            if (!dragging) return;
            dragging = false;
            e.preventDefault();
        };

        document.addEventListener("dragstart", start);
        document.addEventListener("dragover", move);
        document.addEventListener("drop", end);

        return () => {
            document.removeEventListener("dragstart", start);
            document.removeEventListener("dragover", move);
            document.removeEventListener("drop", end);
        };
    }, []);

    /* ---------------- MEASURE + POSITION ---------------- */

    useEffect(() => {
        if (!shouldShow) return;

        requestAnimationFrame(() => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const maxWidth = parseInt(getSettings("width"));
            const maxHeight = parseInt(getSettings("height"));
            const offset = parseInt(getSettings("panelOffset"));

            const width = Math.min(wrapper.clientWidth, maxWidth);
            const height = Math.min(wrapper.clientHeight, maxHeight);

            const isOverflow = wrapper.clientHeight >= maxHeight;

            const winW = document.documentElement.clientWidth;
            const winH = document.documentElement.clientHeight;

            let x = position.x - width / 2;
            let y = position.y + offset;

            x = Math.max(offset, Math.min(x, winW - width - offset));
            y = Math.max(offset, Math.min(y, winH - height - offset));

            setLayout({ x, y, width, height, isOverflow });
        });
    }, [shouldShow, position, results]);

    /* ---------------- UI ---------------- */

    const dismissHint = () => {
        setSettings("hideInformationLabel", true);
        setHideInfoLabel(true);
    };

    const panelStyles = {
        width: layout.width,
        height: layout.height,
        top: layout.y,
        left: layout.x,
        fontSize: parseInt(getSettings("fontSize")),
        ...(getBackgroundColor() || {})
    };

    const wrapperStyles = {
        overflow: layout.isOverflow ? "auto" : "hidden"
    };

    return (
        <div
            className={`simple-wikipedia-search-panel ${shouldShow ? "isShow" : ""}`}
            ref={panelRef}
            style={panelStyles}
        >
            <div
                className="simple-wikipedia-search-result-wrapper"
                ref={wrapperRef}
                style={wrapperStyles}
            >
                <div className="simple-wikipedia-search-move" draggable />
                <div className="simple-wikipedia-search-result-contents">
                    <ResultArea
                        results={results}
                        hideInformationLabel={hideInfoLabel}
                        dismissHint={dismissHint}
                    />
                </div>
            </div>
        </div>
    );
}
