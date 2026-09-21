import { describe, expect, it } from "vitest";

import { rankTabs } from "../../src/search/rank";
import type { TabCandidate } from "../../src/shared/tabs";

function createTabs(count: number): readonly TabCandidate[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    windowId: (index % 4) + 1,
    title:
      index === 73
        ? "Quarterly invoice design review"
        : `Reference document ${index + 1}`,
    url:
      index === 73
        ? "https://design.example.com/finance/q3"
        : `https://docs.example.com/reference/${index + 1}`,
    lastAccessed: 1_750_000_000_000 + index,
    group:
      index % 5 === 0
        ? { id: index + 1_000, title: "Reference", isCollapsed: true }
        : null,
  }));
}

describe("ranking at MVP scale", () => {
  it("retrieves the intended tab from 100 representative candidates", () => {
    const tabs = createTabs(100);

    const results = rankTabs("design invoice", tabs);

    expect(results[0]?.tab.id).toBe(74);
    expect(results).toHaveLength(1);
  });
});
