import React, { useMemo } from "react";
import browser from "webextension-polyfill";
import { getSettings } from "src/settings/settings";
import "../styles/SearchButton.scss";

const calcPosition = ({ buttonSize, offset, direction }) => {
    const half = buttonSize / 2;

    const positions = {
        top: { top: -buttonSize - offset, left: -half },
        bottom: { top: offset, left: -half },
        right: { top: -half, left: offset },
        left: { top: -half, left: -buttonSize - offset },
        topRight: { top: -buttonSize - offset, left: offset },
        topLeft: { top: -buttonSize - offset, left: -buttonSize - offset },
        bottomLeft: { top: offset, left: -buttonSize - offset },
        bottomRight: { top: offset, left: offset }
    };

    return positions[direction] || positions.bottomRight;
};

function SearchButton({ handleButtonClick, position, shouldShow }) {
    const settings = useMemo(() => ({
        buttonSize: parseInt(getSettings("buttonSize")),
        offset: parseInt(getSettings("buttonOffset")),
        direction: getSettings("buttonDirection")
    }), []);

    const basePos = useMemo(() => calcPosition(settings), [settings]);

    const iconUrl = useMemo(() => browser.runtime.getURL("icons/512.png"), []);

    const buttonStyle = useMemo(() => ({
        backgroundImage: `url(${iconUrl})`,
        height: settings.buttonSize,
        width: settings.buttonSize,
        top: basePos.top + position.y,
        left: basePos.left + position.x
    }), [iconUrl, settings.buttonSize, basePos, position]);

    return (
        <div
            style={buttonStyle}
            className={`simple-wikipedia-search-button ${shouldShow ? "isShow" : ""}`}
            onClick={handleButtonClick}
        />
    );
}

export default React.memo(SearchButton);
