import React from "react";
import { createRoot } from "react-dom/client";
import PopupPage from "./components/PopupPage";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<PopupPage />);
