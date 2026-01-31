import React, { useEffect, useState, useMemo } from "react";
import browser from "webextension-polyfill";
import getShortcut from "src/common/getShortcut";
import CategoryContainer from "./CategoryContainer";

export default function KeyboardShortcutPage() {
  const [commands, setCommands] = useState([]);

  /* -------- init -------- */

  useEffect(() => {
    const initCommands = async () => {
      const rawDescription = /^__MSG_(.*)__$/;
      const allCommands = await browser.commands.getAll();

      const normalized = allCommands.map(command => {
        const match = command.description?.match(rawDescription);
        return {
          ...command,
          description: match
            ? browser.i18n.getMessage(match[1])
            : command.description
        };
      });

      setCommands(normalized);
    };

    initCommands();
  }, []);

  /* -------- derived data -------- */

  const commandElements = useMemo(
    () =>
      commands.map(command => ({
        id: command.name,
        title: command.description,
        useRawTitle: true,
        captions: [],
        type: "keyboard-shortcut",
        shortcut: command.shortcut || "",
        defaultValue: getShortcut(command.name)
      })),
    [commands]
  );

  const shortcutCategory = useMemo(
    () => ({
      category: "",
      elements: [
        {
          id: "keyboard",
          title: "keyboardShortcutsLabel",
          captions: ["setKeyboardShortCutsMessage"],
          type: "none",
          childElements: commandElements
        }
      ]
    }),
    [commandElements]
  );

  /* -------- render -------- */

  return (
    <div>
      <p className="contentTitle">
        {browser.i18n.getMessage("keyboardShortcutsLabel")}
      </p>
      <hr />

      {commands.length > 0 && (
        <ul>
          <CategoryContainer {...shortcutCategory} />
        </ul>
      )}
    </div>
  );
}
