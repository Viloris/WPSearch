import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/SideBar.scss";
import { menuList } from "./sideMenuItems";
import config from "../../config.json";
import { getLocaleMessage } from "../../common/utils";

const { EXT_NAME } = config;

const selected = "selected";

/**
 *
 * @returns {JSX.element} Component to display the sidebar of the settings page,
 * which includes a logo, title, and a list of navigation links to different
 * sections of the settings, with the currently active section highlighted based on the current route
 */
const SideBar = () => {
  const { pathname } = useLocation();

  return (
    <div className="sideBar">
      <div className="titleContainer">
        <img src="/icons/64.png" className="logo" />
        <span className="logoTitle">{EXT_NAME}</span>
      </div>

      <ul>
        {menuList
          .filter((menu) => menu.show)
          .map(({ to, pathName, label }) => (
            <li
              key={to}
              className={`sideBarItem ${pathName.includes(pathname) ? selected : ""}`}
            >
              <Link to={to}>{getLocaleMessage(label)}</Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default SideBar;
