import { LogLevel } from "../levels";
import { LoggerAdapter, LogContext } from "../types";

export class ConsoleAdapter implements LoggerAdapter {
  constructor(private min: LogLevel = LogLevel.Info) {}

  private ok(l: LogLevel) {
    return l >= this.min;
  }
  verbose(m: string, c?: LogContext) {
    if (this.ok(LogLevel.Verbose)) console.debug("🔍[VERBOSE]", m, c);
  }
  debug(m: string, c?: LogContext) {
    if (this.ok(LogLevel.Debug)) console.debug("🐛[DEBUG]  ", m, c);
  }
  info(m: string, c?: LogContext) {
    if (this.ok(LogLevel.Info)) console.info("ℹ️ [INFO]  ", m, c);
  }
  warn(m: string, c?: LogContext) {
    if (this.ok(LogLevel.Warn)) console.warn("⚠️ [WARN]  ", m, c);
  }
  error(m: string, c?: LogContext) {
    if (this.ok(LogLevel.Error)) console.error("❌[ERROR]  ", m, c);
  }
}
