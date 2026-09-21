import { describe, expect, it } from "vitest";

import { rankTabs } from "../../src/search/rank";
import type { TabCandidate } from "../../src/shared/tabs";
import { representativeTabs } from "../fixtures/tabs";

function tab(overrides: Partial<TabCandidate>): TabCandidate {
  return {
    id: 1,
    windowId: 1,
    title: "Example",
    url: "https://example.com/",
    lastAccessed: null,
    group: null,
    ...overrides,
  };
}

describe("rankTabs", () => {
  it("matches multiple fragments across title, domain, and URL", () => {
    const results = rankTabs("github pull", representativeTabs);

    expect(results[0]?.tab.id).toBe(11);
    expect(results[0]?.matchedFields).toEqual(
      expect.arrayContaining(["title", "domain"]),
    );
  });

  it("prefers title and domain matches over deep URL-path matches", () => {
    const titleMatch = tab({
      id: 1,
      title: "Release notes",
      url: "https://example.com/archive",
    });
    const pathMatch = tab({
      id: 2,
      title: "Archive",
      url: "https://example.net/releases/notes",
    });

    expect(rankTabs("release notes", [pathMatch, titleMatch])[0]?.tab.id).toBe(1);
  });

  it("keeps match quality ahead of recency", () => {
    const oldExactMatch = tab({
      id: 1,
      title: "Firefox",
      lastAccessed: 100,
    });
    const recentWeakMatch = tab({
      id: 2,
      title: "Fix errors in foxglove parser",
      lastAccessed: 10_000,
    });

    expect(rankTabs("firefox", [recentWeakMatch, oldExactMatch])[0]?.tab.id).toBe(
      1,
    );
  });

  it("supports ordered fuzzy characters for a roughly remembered tab", () => {
    const results = rankTabs("frfx", representativeTabs);

    expect(results[0]?.tab.title).toBe("Firefox extension workshop");
  });

  it("preserves letters outside basic ASCII while normalizing accents", () => {
    const localizedTabs = [
      tab({ id: 1, title: "Café planning" }),
      tab({ id: 2, title: "東京 travel notes" }),
    ];

    expect(rankTabs("cafe", localizedTabs)[0]?.tab.id).toBe(1);
    expect(rankTabs("東京", localizedTabs)[0]?.tab.id).toBe(2);
  });

  it("uses recency for an empty query and a stable ID tie-breaker", () => {
    const equallyRecent = [
      tab({ id: 9, lastAccessed: 500 }),
      tab({ id: 3, lastAccessed: 500 }),
      tab({ id: 7, lastAccessed: null }),
    ];

    expect(rankTabs("   ", equallyRecent).map((result) => result.tab.id)).toEqual([
      3, 9, 7,
    ]);
  });

  it("omits tabs when any query fragment cannot be matched", () => {
    expect(rankTabs("simple invoices", representativeTabs)).toEqual([]);
  });
});
