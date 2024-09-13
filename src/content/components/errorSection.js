import "../styles/ResultPanel.scss";

export function ErrorSection(props) {
    const { errorMessage, isError } = props;
    if (isError)
        return <p className="simple-wikipedia-search-error">{errorMessage}</p>;
    return null;
}
