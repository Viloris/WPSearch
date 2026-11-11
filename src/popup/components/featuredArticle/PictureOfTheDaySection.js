import React from "react";
import { getLocaleMessage } from "../../../common/i18n";
import { getFeedSectionLanguage, getFeedSectionMessage } from "./feedSectionMessages";

export function PictureOfTheDaySection({ imageOfDay, failedImages, setFailedImages, retry, language }) {
    return (
        <section className="featuredArticleSupplement">
            <h3 lang={getFeedSectionLanguage(language)}>{getFeedSectionMessage(language, "dailyImageOfDayLabel")}</h3>
            <figure className="featuredArticleImageOfDay">
                {imageOfDay.thumbnailUrl && !failedImages.imageOfDay && (
                    <a
                        href={imageOfDay.filePageUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <img
                            src={imageOfDay.thumbnailUrl}
                            alt={imageOfDay.description}
                            onError={() => setFailedImages((current) => ({
                                ...current,
                                imageOfDay: true
                            }))} />
                    </a>
                )}
                {failedImages.imageOfDay && (
                    <p className="featuredArticleStatus" role="alert">
                        {getLocaleMessage("dailyImageOfDayError")}
                        <button onClick={retry} type="button">
                            {getLocaleMessage("dailyFeaturedArticleRetryLabel")}
                        </button>
                    </p>
                )}
                {imageOfDay.description && (
                    <figcaption>{imageOfDay.description}</figcaption>
                )}
                {(imageOfDay.artist || imageOfDay.licenseName) && (
                    <p className="featuredArticleImageCredit">
                        {imageOfDay.artist && (
                            <>
                                {getLocaleMessage("dailyImageArtistLabel")}: {imageOfDay.artist}
                            </>
                        )}
                        {imageOfDay.artist && imageOfDay.licenseName && " · "}
                        {imageOfDay.licenseName && (
                            <>
                                {getLocaleMessage("dailyImageLicenseLabel")}:{" "}
                                {imageOfDay.licenseUrl ? (
                                    <a
                                        href={imageOfDay.licenseUrl}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        style={{ textDecoration: "none" }}
                                    >
                                        {imageOfDay.licenseName}
                                    </a>
                                ) : (
                                    imageOfDay.licenseName
                                )}
                            </>
                        )}
                    </p>
                )}
            </figure>
        </section>
    );
}