import { LogLevel } from "./levels";
import { LogContext, LoggerAdapter, Runtime } from "./types";

type Entry = { level: LogLevel; msg: string; ctx?: LogContext };

const KEY = "__repo_logger_registry__";
// Typed global accessor for the logger registry without using `any`
interface GlobalWithRegistry {
  __repo_logger_registry__?: Registry;
}
const g = globalThis as unknown as GlobalWithRegistry;

type ContextProvider =
  | (() => Partial<LogContext> | Promise<Partial<LogContext>> | undefined)
  | null;

type Registry = {
  initialized: boolean;
  adapters: LoggerAdapter[];
  buffer: Entry[];
  runtime?: Runtime;
  contextProvider?: ContextProvider;
};

export const registry: Registry =
  g[KEY] ??
  (g[KEY] = {
    initialized: false,
    adapters: [],
    buffer: [],
    contextProvider: null,
  });

export function setContextProvider(fn: ContextProvider) {
  registry.contextProvider = fn;
}

function methodOf(level: LogLevel) {
  return (["verbose", "debug", "info", "warn", "error"] as const)[level];
}

export function initLogger(adapters: LoggerAdapter[], runtime?: Runtime) {
  if (registry.initialized) return;
  registry.adapters = adapters;
  registry.runtime = runtime;
  registry.initialized = true;
  // 🔄 Flush buffer (dispatch asynchronously)
  for (const e of registry.buffer)
    queueMicrotask(() => {
      void dispatchAsync(e.level, e.msg, e.ctx);
    });
  registry.buffer.length = 0;
}

export function addAdapters(...adapters: LoggerAdapter[]) {
  registry.adapters.push(...adapters);
}

export function setRuntime(runtime: Runtime) {
  registry.runtime = runtime;
}

function currentRuntime(): Runtime {
  const isBrowser = typeof window !== "undefined";
  const isEdge =
    typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !==
    "undefined";
  if (isBrowser) return "client";
  if (isEdge) return "edge";
  return "server";
}

// Safely resolve provider result
async function resolveProvided(): Promise<Partial<LogContext>> {
  try {
    const v = registry.contextProvider?.();
    if (
      v &&
      typeof (v as unknown as Promise<Partial<LogContext>>).then === "function"
    ) {
      // v is a Promise returning Partial<LogContext>
      return await (v as Promise<Partial<LogContext>>);
    }
    return v ?? {};
  } catch {
    return {};
  }
}

// Keep legacy withBaseContext (for compatibility). Use internally if needed.
// New async version
async function withBaseContextAsync(ctx?: LogContext): Promise<LogContext> {
  const provided = await resolveProvided();
  return {
    runtime: ctx?.runtime ?? currentRuntime(),
    ts: ctx?.ts ?? Date.now(),
    ...provided,
    ...ctx,
  };
}

async function dispatchAsync(level: LogLevel, msg: string, ctx?: LogContext) {
  const m = methodOf(level);
  const merged = await withBaseContextAsync(ctx);
  for (const a of registry.adapters) {
    try {
      a[m]?.(msg, merged);
    } catch (err) {
      // Isolate adapter exceptions
      // Optionally log adapter errors for debugging
      if (process?.env?.NODE_ENV === "development") {
        console.warn("Logger adapter error:", err);
      }
    }
  }
}

/* -------------------- Public Logger API (signature unchanged) -------------------- */

function fire(level: LogLevel, msg: string, ctx?: LogContext) {
  if (registry.initialized) {
    queueMicrotask(() => {
      void dispatchAsync(level, msg, ctx);
    });
  } else {
    registry.buffer.push({ level, msg, ctx });
  }
}

export class Logger {
  static verbose(msg: string, ctx?: LogContext) {
    fire(LogLevel.Verbose, msg, ctx);
  }
  static debug(msg: string, ctx?: LogContext) {
    fire(LogLevel.Debug, msg, ctx);
  }
  static info(msg: string, ctx?: LogContext) {
    fire(LogLevel.Info, msg, ctx);
  }
  static warn(msg: string, ctx?: LogContext) {
    fire(LogLevel.Warn, msg, ctx);
  }
  static error(msg: string, ctx?: LogContext) {
    fire(LogLevel.Error, msg, ctx);
  }
}
