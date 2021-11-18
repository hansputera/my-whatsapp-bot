import pino from 'pino';

/**
 * Use this function to create logger instance.
 * @param {string} serviceName - Service logger name.
 * @return {pino.Logger}
 */
export const createLogger = (serviceName: string) => pino({
  name: serviceName,
  prettyPrint: true,
});
