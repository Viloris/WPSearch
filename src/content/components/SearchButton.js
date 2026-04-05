import React, { useMemo } from "react";
import browser from "webextension-polyfill";
import { getSettings } from "src/settings/settings";
import "../styles/SearchButton.scss";

const ICON_URL = browser.runtime.getURL("icons/512.png");

const calcPosition = (buttonSize, offset, direction) => {
  const half = buttonSize / 2;
  const position = -buttonSize - offset;
  const map = {
    top: { top: position, left: -half },
    bottom: { top: offset, left: -half },
    right: { top: -half, left: offset },
    left: { top: -half, left: position },
    topRight: { top: position, left: offset },
    topLeft: { top: position, left: position },
    bottomLeft: { top: offset, left: position },
    bottomRight: { top: offset, left: offset }
  };

  return map[direction] || map.bottomRight;
};

/**
 *
 * @param {function()} handleButtonClick
 * @param {number} position
 * @param {boolean} shouldShow
 * @returns {JSX.Element}
 */
function SearchButton({ handleButtonClick, position, shouldShow }) {
  const buttonSize = parseInt(getSettings("buttonSize"));
  const offset = parseInt(getSettings("buttonOffset"));
  const direction = getSettings("buttonDirection");

  const buttonStyle = useMemo(() => {
    const base = calcPosition(buttonSize, offset, direction);

    return {
      backgroundImage: `url(${ICON_URL})`,
      width: buttonSize,
      height: buttonSize,
      top: base.top + position.y,
      left: base.left + position.x
    };
  }, [buttonSize, offset, direction, position]);

  return (
    <div
      className={`simple-wikipedia-search-button ${shouldShow ? "isShow" : ""}`}
      style={buttonStyle}
      onClick={handleButtonClick}
    />
  );
}

export default React.memo(SearchButton);
