import React from "react";
import HomeIcon from "../icons/home-solar.svg";
import SearchIcon from "../icons/search-solar.svg";
import HistoryIcon from "../icons/history-solar.svg";
import FavoritesIcon from "../icons/bookmark-solar.svg";
import "../styles/MainNavigation.scss";

export const navigationItems = [
    {
        id: "home",
        label: "mainMenuLabel",
        icon: (
            <HomeIcon />
        )
    },
    {
        id: "search",
        label: "searchLabel",
        icon: (<SearchIcon />
        )
    },
    {
        id: "history",
        label: "searchHistoryLabel",
        icon: (
            <HistoryIcon />
        )
    },
    {
        id: "favorites",
        label: "favoritesLabel",
        icon: (
            <FavoritesIcon />
        )
    }
];