import { describe, expect, it } from "vitest";

import { isTabsRequest } from "../../src/shared/messages";

describe("isTabsRequest", () => {
  it("accepts only known runtime messages with valid tab IDs", () => {
    expect(isTabsRequest({ type: "tabs:list" })).toBe(true);
    expect(isTabsRequest({ type: "tabs:activate", tabId: 42 })).toBe(true);

    expect(isTabsRequest({ type: "tabs:activate", tabId: -1 })).toBe(false);
    expect(isTabsRequest({ type: "tabs:activate", tabId: "42" })).toBe(false);
    expect(isTabsRequest({ type: "tabs:delete", tabId: 42 })).toBe(false);
    expect(isTabsRequest(null)).toBe(false);
  });
});
