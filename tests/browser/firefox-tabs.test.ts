import { describe, expect, it } from "vitest";

import { FirefoxTabs } from "../../src/browser/firefox-tabs";
import { FakeFirefox } from "./fake-firefox";

describe("FirefoxTabs", () => {
  it("maps normal tabs and filters private or invalid records", async () => {
    const firefox = new FakeFirefox(
      [
        {
          id: 1,
          windowId: 10,
          title: "<img src=x onerror=alert(1)>",
          url: "https://example.com/path",
          lastAccessed: 500,
          incognito: false,
          groupId: 100,
        },
        {
          id: 2,
          windowId: 10,
          title: "Private",
          url: "https://private.example/",
          lastAccessed: 600,
          incognito: true,
          groupId: -1,
        },
        {
          windowId: 10,
          title: "Missing ID",
          incognito: false,
          groupId: -1,
        },
      ],
      [{ id: 100, title: "Research", collapsed: true }],
    );
    const adapter = new FirefoxTabs(firefox.dependencies());

    await expect(adapter.listOpenTabs()).resolves.toEqual([
      {
        id: 1,
        windowId: 10,
        title: "<img src=x onerror=alert(1)>",
        url: "https://example.com/path",
        lastAccessed: 500,
        group: { id: 100, title: "Research", isCollapsed: true },
      },
    ]);
  });

  it("normalizes missing metadata and tolerates unavailable group lookup", async () => {
    const firefox = new FakeFirefox([
      { id: 1, windowId: 10, incognito: false, groupId: 100 },
    ]);
    const dependencies = firefox.dependencies();
    dependencies.queryGroups = async () => {
      throw new Error("tabGroups API unavailable");
    };
    const adapter = new FirefoxTabs(dependencies);

    await expect(adapter.listOpenTabs()).resolves.toEqual([
      {
        id: 1,
        windowId: 10,
        title: "",
        url: "",
        lastAccessed: null,
        group: null,
      },
    ]);
  });

  it("expands the group, focuses the window, and activates the tab", async () => {
    const firefox = new FakeFirefox(
      [
        {
          id: 1,
          windowId: 10,
          incognito: false,
          groupId: 100,
        },
      ],
      [{ id: 100, title: "Research", collapsed: true }],
    );
    const adapter = new FirefoxTabs(firefox.dependencies());

    await expect(
      adapter.activateTab({ tabId: 1 }),
    ).resolves.toEqual({ status: "activated" });
    expect(firefox.groups[0]?.collapsed).toBe(false);
    expect(firefox.focusedWindowId).toBe(10);
    expect(firefox.activeTabId).toBe(1);
  });

  it("continues activation when group expansion fails", async () => {
    const firefox = new FakeFirefox([
      { id: 1, windowId: 10, incognito: false, groupId: 100 },
    ]);
    firefox.failGroupExpansion = true;
    const adapter = new FirefoxTabs(firefox.dependencies());

    await expect(
      adapter.activateTab({ tabId: 1 }),
    ).resolves.toEqual({ status: "activated" });
    expect(firefox.focusedWindowId).toBe(10);
    expect(firefox.activeTabId).toBe(1);
  });

  it("returns typed outcomes for a closed tab or failed activation step", async () => {
    const closedTabFirefox = new FakeFirefox([]);
    const closedTabAdapter = new FirefoxTabs(closedTabFirefox.dependencies());

    await expect(
      closedTabAdapter.activateTab({ tabId: 9 }),
    ).resolves.toEqual({ status: "not-found" });

    const windowFailureFirefox = new FakeFirefox([
      { id: 1, windowId: 10, incognito: false, groupId: -1 },
    ]);
    windowFailureFirefox.failWindowFocus = true;
    const windowFailureAdapter = new FirefoxTabs(
      windowFailureFirefox.dependencies(),
    );

    await expect(
      windowFailureAdapter.activateTab({ tabId: 1 }),
    ).resolves.toEqual({ status: "unavailable", reason: "window" });
  });
});
