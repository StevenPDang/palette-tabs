import { describe, expect, it } from "vitest";

import type {
  BrowserTabs,
  TabActivationResult,
} from "../../src/browser/browser-tabs";
import type { TabActivationTarget } from "../../src/shared/tabs";
import { representativeTabs } from "../fixtures/tabs";

class FakeBrowserTabs implements BrowserTabs {
  async listOpenTabs() {
    return representativeTabs;
  }

  async activateTab(
    target: TabActivationTarget,
  ): Promise<TabActivationResult> {
    const tabExists = representativeTabs.some((tab) => tab.id === target.tabId);
    return tabExists ? { status: "activated" } : { status: "not-found" };
  }
}

describe("shared tab contracts", () => {
  it("represents grouped, cross-window, similar, and missing-title tabs", () => {
    const windowIds = new Set(representativeTabs.map((tab) => tab.windowId));
    const groupedTabs = representativeTabs.filter((tab) => tab.group !== null);
    const githubTabs = representativeTabs.filter((tab) =>
      tab.url.startsWith("https://github.com/"),
    );

    expect(windowIds.size).toBeGreaterThan(1);
    expect(groupedTabs.some((tab) => tab.group.isCollapsed)).toBe(true);
    expect(githubTabs.length).toBeGreaterThan(1);
    expect(representativeTabs.some((tab) => tab.title === "")).toBe(true);
  });

  it("uses explicit activation outcomes at the browser boundary", async () => {
    const browserTabs: BrowserTabs = new FakeBrowserTabs();

    await expect(
      browserTabs.activateTab({ tabId: 11, windowId: 1, groupId: 101 }),
    ).resolves.toEqual({ status: "activated" });
    await expect(
      browserTabs.activateTab({ tabId: 999, windowId: 1, groupId: null }),
    ).resolves.toEqual({ status: "not-found" });
  });
});
