export type Runtime = "server" | "edge" | "client";

export interface LogContext {
  runtime?: Runtime;
  tags?: Record<string, string>;
  [k: string]: unknown;
}

export interface LoggerAdapter {
  verbose?: (msg: string, ctx?: LogContext) => void;
  debug?: (msg: string, ctx?: LogContext) => void;
  info?: (msg: string, ctx?: LogContext) => void;
  warn?: (msg: string, ctx?: LogContext) => void;
  error?: (msg: string, ctx?: LogContext) => void;
}
