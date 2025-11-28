import { describe, it, expect, beforeAll, vi } from "vitest";
import { Logger, initLogger } from "../index";
import { ConsoleAdapter } from "../adapters/ConsoleAdapter";

describe("Logger", () => {
  beforeAll(() => {
    initLogger([new ConsoleAdapter()]);
  });

  it("should log info message", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    Logger.info("test info", { foo: "bar" });
    await new Promise((r) => setTimeout(r, 10));
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[INFO]"),
      "test info",
      expect.objectContaining({ foo: "bar" })
    );
    spy.mockRestore();
  });

  it("should log error message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    Logger.error("test error");
    await new Promise((r) => setTimeout(r, 10));
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR]"),
      "test error",
      expect.anything()
    );
    spy.mockRestore();
  });
});
