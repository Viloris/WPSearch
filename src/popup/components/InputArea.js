import React, { useEffect, useRef, useCallback } from "react";
import "../styles/InputArea.scss";
import { getLocaleMessage } from "../../common/i18n";
import ClearIcon from "../../options/icons/clear.svg";

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
function InputArea({ inputText, handleInputText, inputRef }) {
  const textareaRef = useRef(null);

  useAutoResize(textareaRef, inputText);
  useEffect(() => {
    if (inputRef) {
      inputRef.current = textareaRef.current;
    }
    return () => {
      if (inputRef) {
        inputRef.current = null;
      }
    };
  }, [inputRef]);

  const handleInputChange = useCallback((e) => {
    handleInputText(e.target.value);
  }, [handleInputText]);

  const handleClearInput = useCallback(() => {
    handleInputText("");
    textareaRef.current?.focus();
  }, [handleInputText]);

  const getPlaceholder = () => {
    return getLocaleMessage("initialTextArea");
  };

  return (
    <div id="inputArea">
      <textarea
        autoFocus
        dir="auto"
        onChange={handleInputChange}
        placeholder={getPlaceholder()}
        ref={textareaRef}
        spellCheck={false}
        value={inputText}
      />
      {inputText && (
        <button
          aria-label={getLocaleMessage("clear")}
          className="clearInputButton"
          onClick={handleClearInput}
          title={getLocaleMessage("clear")}
          type="button"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.inputText === nextProps.inputText &&
    prevProps.sourceLang === nextProps.sourceLang;
};

export default React.memo(InputArea, arePropsEqual);
