import { getSettings } from "./settings";

export const RESULT_FONT_COLOR_LIGHT = "#000000";
export const RESULT_FONT_COLOR_DARK = "#e6e6e6";
export const CANDIDATE_FONT_COLOR_LIGHT = "#737373";
export const CANDIDATE_FONT_COLOR_DARK = "#aaaaaa";
export const BG_COLOR_LIGHT = "#ffffff";
export const BG_COLOR_DARK = "#181818";

function shouldOverrideColors() {
  return getSettings("isOverrideColors");
}

/**
 * @description Return style object if color override is enabled
 * @return {Object|undefined} Style object with color property if override is enabled, otherwise undefined to use default styles
 */
export function getResultFontColor() {
  const isOverrideColors = shouldOverrideColors();

  if (!isOverrideColors) return undefined;

  return { color: getSettings("resultFontColor") };
}

/**
 * @description Return style object if color override is enabled
 * @return {Object|undefined} Style object with color property if override is enabled, otherwise undefined to use default styles
 */
export function getCandidateFontColor() {
  const isOverrideColors = shouldOverrideColors();

  if (!isOverrideColors) return undefined;

  return { color: getSettings("candidateFontColor") };
}


/**
 * @description Return style object if color override is enabled
 * @return {Object|undefined} Style object with backgroundColor property if override is enabled, otherwise undefined to use default styles
 */
export function getBackgroundColor() {
  const isOverrideColors = shouldOverrideColors();

  if (!isOverrideColors) return undefined;

  return { backgroundColor: getSettings("bgColor") };
}
