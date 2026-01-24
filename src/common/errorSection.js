import React from "react";

export function ErrorSection({ message }) {
    return (
        <p className="error">
            {message}
        </p>
    );
}
