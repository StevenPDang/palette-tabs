import { describe, expect, it } from "vitest";

import { formatRecency } from "../../src/palette/format-recency";

const NOW = 2_000_000_000_000;

describe("formatRecency", () => {
  it("formats recent access without noisy precision", () => {
    expect(formatRecency(NOW - 20_000, NOW)).toBe("just now");
    expect(formatRecency(NOW - 5 * 60_000, NOW)).toBe("5m ago");
    expect(formatRecency(NOW - 3 * 60 * 60_000, NOW)).toBe("3h ago");
    expect(formatRecency(NOW - 4 * 24 * 60 * 60_000, NOW)).toBe("4d ago");
  });

  it("omits invalid, missing, or future timestamps", () => {
    expect(formatRecency(null, NOW)).toBe("");
    expect(formatRecency(Number.NaN, NOW)).toBe("");
    expect(formatRecency(NOW + 1, NOW)).toBe("");
  });
});
