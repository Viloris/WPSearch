import React from "react";
import browser from "webextension-polyfill";
import openUrl from "./openUrl";

export default function InfoBar({ message, onClick }) {
    const settings = browser.i18n.getMessage("settingsLabel");
    const openSettings = () => {
        const url = "../options/index.html#settings";
        openUrl(url);
    };
    return (
        <div style={{ marginBottom: "0.5rem", marginTop: "1rem", width: "100%" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    backgroundColor: "#e5f6fd",
                    borderLeft: "4px solid #6bb9e3",
                    padding: "1rem",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
            >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", flex: 1 }}>
                    <p style={{ margin: 0, color: "#333", fontSize: "0.75rem", backgroundColor: "transparent" }}>
                        {message}
                    </p>
                    <button
                        onClick={onClick}
                        style={{
                            backgroundColor: "transparent",
                            color: "#6bb9e3",
                            border: "none",
                            padding: "0rem",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#5a9fbd"}
                        onMouseLeave={(e) => e.target.style.color = "#6bb9e3"}
                        title="Dsimiss"
                    >
                        ✕
                    </button>
                </div>
                <button
                    onClick={openSettings}
                    style={{
                        backgroundColor: "#6bb9e3",
                        color: "white",
                        border: "none",
                        padding: "0.3rem 0.5rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        transition: "background-color 0.2s",
                        marginTop: "0.5rem"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#5a9fbd"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#6bb9e3"}
                >
                    {settings}
                </button>
            </div>
        </div>
    );
}
