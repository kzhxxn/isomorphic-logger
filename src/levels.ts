export enum LogLevel {
  /**
   * 🔍 Most detailed log. Used for debugging traces such as loops, conditions, etc.
   * Should be used only in development; usually disabled in production.
   */
  Verbose = 0,

  /**
   * 🐛 Debug log. Used to track state changes, function calls, etc.
   * Useful in test environments; should not be exposed to end users.
   */
  Debug = 1,

  /**
   * ℹ️ Informational log for meaningful events in normal flow. E.g., login success, order completed.
   * Always recorded in production.
   */
  Info = 2,

  /**
   * ⚠️ Potential issues or abnormal flow. System continues to operate but attention is needed.
   * E.g., cache miss, invalid user input.
   */
  Warn = 3,

  /**
   * ❌ Actual error situation. Exception handling, abnormal termination, etc.
   * Must be sent to monitoring tools (e.g., Sentry) and trigger alerts.
   */
  Error = 4,
}
