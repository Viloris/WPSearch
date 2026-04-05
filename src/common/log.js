import log from "loglevel";
import { getSettings } from "src/settings/settings";

let isInited = false;

/**
 * 
 * @description Overrides loglevel's methodFactory to include log level and log directory in log messages
 * @returns {void} Overrides loglevel's methodFactory to include log level and log directory in log messages
 */
export const overWriteLogLevel = () => {
  if (isInited) return;
  isInited = true;

  const originalFactory = log.methodFactory;
  log.methodFactory = (methodName, logLevel, loggerName) => {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return (logDir, ...args) => {
      rawMethod(`[${methodName}]`, `${logDir}:`, ...args);
    };
  };
};

/**
 * 
 * @description Updates log level based on the isDebugMode setting, enabling all logs if isDebugMode is true and disabling all logs if isDebugMode is false
 * @returns {void} Updates log level based on the isDebugMode setting
 */
export const updateLogLevel = () => {
  const isDebugMode = getSettings("isDebugMode");
  if (isDebugMode) log.enableAll(false);
  else log.disableAll(false);
};
