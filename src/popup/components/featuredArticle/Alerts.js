import { getLocaleMessage } from "../../../common/i18n";

export function ErrorMessage({ retry }) {
    return <div className="featuredArticleStatus" role="alert">
        <p>{getLocaleMessage("dailyFeaturedArticleError")}</p>
        <button onClick={retry} type="button">
            {getLocaleMessage("dailyFeaturedArticleRetryLabel")}
        </button>
    </div>;
}