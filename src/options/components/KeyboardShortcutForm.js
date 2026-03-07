import React, { useState, useMemo, useCallback, useEffect } from "react";
import browserInfo from "browser-info";
import browser from "webextension-polyfill";
import ClearIcon from "../icons/clear.svg";
import ResetIcon from "../icons/reset.svg";
import { getLocaleMessage } from "../../common/utils";

/* ---------------- utils ---------------- */

const normalizeKey = (key, keyCode) => {
  if (/^[a-z]$/i.test(key)) return key.toUpperCase();
  if (/^[0-9]$/.test(key)) return key;
  if (/^F([0-9]|1[0-2])$/.test(key)) return key;
  if (/^(Home|End|PageUp|PageDown|Insert|Delete)$/.test(key)) return key;

  if (/^\s$/.test(key)) return "Space";

  if (/^Arrow/.test(key)) return key.replace("Arrow", "");

  if (/^Media(PlayPause|Stop)$/.test(key)) return key;
  if (key === "MediaTrackNext") return "MediaNextTrack";
  if (key === "MediaTrackPrevious") return "MediaPrevTrack";

  if (keyCode >= 48 && keyCode <= 57) return String(keyCode - 48);
  if (keyCode === 188) return "Comma";
  if (keyCode === 190) return "Period";

  return "";
};

/* ---------------- component ---------------- */

/**
 *
 * @param {number} id
 * @param {string} initialShortcut
 * @param {string} defaultValue
 * @returns {JSX.Element}
 */
export default function KeyboardShortcutForm({
  id,
  initialShortcut,
  defaultValue
}) {
  const isMac = useMemo(() => browserInfo().os === "OS X", []);

  const [shortcut, setShortcut] = useState(initialShortcut || "");
  const [value, setValue] = useState(initialShortcut || "");
  const [error, setError] = useState("");

  /* -------- focus handling -------- */

  useEffect(() => {
    return () => {
      document.onkeydown = null;
      document.onkeypress = null;
    };
  }, []);

  const handleFocus = useCallback((e) => {
    e.target.select();
    document.onkeydown = () => false;
    document.onkeypress = () => false;
  }, []);

  const handleBlur = useCallback(() => {
    setError("");
    setValue(shortcut);
    document.onkeydown = null;
    document.onkeypress = null;
  }, [shortcut]);

  const updateShortcut = useCallback(
    async (newShortcut) => {
      try {
        await browser.commands.update({ name: id, shortcut: newShortcut });
        setShortcut(newShortcut);
      } catch {
        setError(getLocaleMessage("invalidShortcutMessage"));
      }
    },
    [id]
  );

  /* -------- keyboard handling -------- */

  const handleKeyDown = useCallback(
    (e) => {
      if (e.repeat) return;

      if (e.key === "Tab") {
        document.activeElement.blur();
        return;
      }

      const normalizedKey = normalizeKey(e.key, e.keyCode);
      let nextError = "";

      const mediaKeys =
        /^(MediaPlayPause|MediaStop|MediaNextTrack|MediaPrevTrack)$/;
      const funcKeys = /^F([0-9]|1[0-2])$/;
      const modifierKeys = /^(Control|Alt|Shift|Meta)$/;

      if (mediaKeys.test(normalizedKey) || funcKeys.test(normalizedKey)) {
        nextError = "";
      } else if (modifierKeys.test(e.key)) {
        nextError = getLocaleMessage("typeLetterMessage");
      } else if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        nextError = getLocaleMessage(
          isMac ? "includeMacModifierKeysMessage" : "includeModifierKeysMessage"
        );
      } else if (!normalizedKey) {
        nextError = getLocaleMessage("invalidLetterMessage");
      }

      const nextValue =
        `${e.ctrlKey ? (isMac ? "MacCtrl+" : "Ctrl+") : ""}` +
        `${e.metaKey && isMac ? "Command+" : ""}` +
        `${e.altKey ? "Alt+" : ""}` +
        `${e.shiftKey ? "Shift+" : ""}` +
        normalizedKey;

      setError(nextError);
      setValue(nextValue);

      if (nextValue && !nextError) {
        updateShortcut(nextValue);
      }
    },
    [isMac, updateShortcut]
  );

  const handleKeyUp = useCallback(() => {
    if (error) setValue("");
  }, [error]);

  /* -------- shortcut actions -------- */

  const clearShortcut = async () => {
    await browser.commands.reset(id).catch(() => {});
    setShortcut("");
    setValue("");
  };

  const resetShortcut = () => {
    updateShortcut(defaultValue);
    setValue(defaultValue || "");
  };

  /* -------- render -------- */

  return (
    <div className={`keyboardShortcut ${error ? "isError" : ""}`}>
      <div className="row">
        <input
          type="text"
          id={id}
          value={value}
          placeholder={getLocaleMessage("typeShortcutMessage")}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly
        />

        <button
          className="clearButton"
          title={getLocaleMessage("clear")}
          onClick={clearShortcut}
        >
          <ClearIcon />
        </button>

        <button
          className="resetButton"
          title={getLocaleMessage("reset")}
          onClick={resetShortcut}
        >
          <ResetIcon />
        </button>
      </div>

      <p className="error">{error}</p>
    </div>
  );
}
