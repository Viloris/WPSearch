import React, { useEffect, useRef } from "react";
import { getLocaleMessage } from "../../common/i18n";

export default function NextResults({
    children,
    isLoading,
    pageId,
    rangeStart,
    rangeEnd,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
    onClose
}) {
    const closeLabel = getLocaleMessage("closeNextResultsLabel");
    const previousLabel = getLocaleMessage("previousResultsLabel");
    const nextLabel = getLocaleMessage("moreResultsLabel");
    const contentRef = useRef(null);

    useEffect(() => {
        if (!isLoading && pageId !== null) {
            contentRef.current?.scrollTo({ top: 0 });
        }
    }, [isLoading, pageId]);

    return (
        <section className="next-results">
            <div className="next-results__header">
                <div className="mediaButtons">
                    <button
                        className="resultFooterButton"
                        type="button"
                        onClick={onPrevious}
                        disabled={!canGoPrevious || isLoading}
                    >
                        {previousLabel}
                    </button>
                </div>
                <span className="next-results__range">
                    {getLocaleMessage("resultsRangeLabel", [String(rangeStart), String(rangeEnd)])}
                </span>
                <div className="mediaButtons">
                    <button
                        className="resultFooterButton"
                        type="button"
                        onClick={onNext}
                        disabled={!canGoNext || isLoading}
                    >
                        {nextLabel}
                    </button>
                </div>
                <button
                    className="next-results__close"
                    type="button"
                    onClick={onClose}
                    aria-label={closeLabel}
                    title={closeLabel}
                >
                    ×
                </button>
            </div>
            <div
                ref={contentRef}
                className="next-results__content"
                aria-busy={isLoading}
            >
                {children}
            </div>
        </section>
    );
}