import { redactSecrets } from "../safety/redact-secret.js";

type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export function createLogger(level: string = "info"): Logger {
  const order: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
  };
  const minimum = order[(level as LogLevel) ?? "info"] ?? order.info;

  function write(logLevel: LogLevel, message: string, meta?: unknown): void {
    if (order[logLevel] < minimum) {
      return;
    }

    const redactedMeta = meta === undefined ? "" : ` ${JSON.stringify(redactSecrets(meta))}`;
    process.stderr.write(`[${logLevel}] ${message}${redactedMeta}\n`);
  }

  return {
    debug: (message, meta) => write("debug", message, meta),
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta)
  };
}
