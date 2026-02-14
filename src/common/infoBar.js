import React from "react";

export default function InfoBar({ message, onClick }) {
    return (
        <div>
            <br />
            <p
                style={{
                    display: "flex",
                    backgroundColor: "#e5f6fd",
                    alignItems: "center",
                    padding: "1em"
                }}
            >
                {message}
                <a
                    onClick={onClick}
                    style={{
                        backgroundColor: "#e5f6fd",
                        padding: "5px",
                        cursor: "pointer",
                        color: "#6bb9e3",
                        fontWeight: 600
                    }}
                >
                    OK
                </a>
            </p>
        </div>
    );
}
