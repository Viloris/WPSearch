import React from "react";

export function ErrorSection(props) {
    const { message, show } = props;
    if (show) return (
        <p className="error">
            {message}
        </p>
    );
    return null;
}
