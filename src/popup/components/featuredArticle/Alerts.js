import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";

export function ErrorMessage({ retry, language }) {
    return <div className="featuredArticleStatus" role="alert">
        <p lang={getFeedSectionLanguage(language)}>
            {getFeedSectionMessage(language, "dailyFeaturedArticleError")}
        </p>
        <button lang={getFeedSectionLanguage(language)} onClick={retry} type="button">
            {getFeedSectionMessage(language, "dailyFeaturedArticleRetryLabel")}
        </button>
    </div>;
}