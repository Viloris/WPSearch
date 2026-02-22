import React, { useEffect, useRef, useCallback } from "react";
import browser from "webextension-polyfill";
import "../styles/InputArea.scss";

/**
 * 
 * @param {Object} textareaRef
 * @param {string} inputText 
 * @returns 
 */
const useAutoResize = (textareaRef, inputText) => {
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "1px";
            textarea.style.height = `${textarea.scrollHeight + 2}px`;
        }
    }, [textareaRef, inputText]);
};

/**
 * 
 * @param {string} inputText
 * @param {function} handleInputText 
 * @returns {JSX.Element}
 */
function InputArea({ inputText, handleInputText }) {

    const textareaRef = useRef(null);

    useAutoResize(textareaRef, inputText);

    const handleInputChange = useCallback((e) => {
        handleInputText(e.target.value);
    }, [handleInputText]);

    const getPlaceholder = () => {
        return browser.i18n.getMessage("initialTextArea");
    };

    return (
        <div id="inputArea">
            <textarea
                value={inputText}
                ref={textareaRef}
                placeholder={getPlaceholder()}
                onChange={handleInputChange}
                autoFocus
                spellCheck={false}
                dir="auto"
            />
        </div>
    );
}

const arePropsEqual = (prevProps, nextProps) => {
    return (
        prevProps.inputText === nextProps.inputText &&
        prevProps.sourceLang === nextProps.sourceLang
    );
};

export default React.memo(InputArea, arePropsEqual);