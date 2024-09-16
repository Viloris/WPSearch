import React from "react";

export function ErrorSection(props) {
    const { errorMessage, isError } = props;
    if (isError) return <p className="error">{errorMessage}</p>;
    return null;
}
