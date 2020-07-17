import * as winston from 'winston'

/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param loggerName - a name of a logger that will be added to all messages
 */
export function createLogger(loggerName: string) {
  return winston.createLogger({
    level: 'info', // logging level for transport => 2: info
    format: winston.format.json(), // logging in JSON format
    defaultMeta: { name: loggerName },
    // instantiate new Winston logger instance with Console transport
    // Transport: refer to the storage/output mechanisms used for the logs
    transports: [
      new winston.transports.Console()
    ]
  })
}