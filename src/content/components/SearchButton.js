import React, { useMemo } from "react";
import browser from "webextension-polyfill";
import { getSettings } from "src/settings/settings";
import "../styles/SearchButton.scss";
import { calcPosition } from "./searchButtonUtils";

const ICON_URL = browser.runtime.getURL("icons/512.png");

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
