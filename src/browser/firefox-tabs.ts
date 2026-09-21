import type { BrowserTabs, TabActivationResult } from "./browser-tabs";
import type {
  TabActivationTarget,
  TabCandidate,
  TabGroupContext,
} from "../shared/tabs";

export interface FirefoxTabSnapshot {
  readonly id?: number;
  readonly windowId?: number;
  readonly title?: string;
  readonly url?: string;
  readonly lastAccessed?: number;
  readonly incognito: boolean;
  readonly groupId?: number;
}

export interface FirefoxGroupSnapshot {
  readonly id: number;
  readonly title?: string;
  collapsed: boolean;
}

export interface FirefoxAdapterDependencies {
  noGroupId: number;
  queryNormalTabs(): Promise<readonly FirefoxTabSnapshot[]>;
  queryGroups(): Promise<readonly FirefoxGroupSnapshot[]>;
  getTab(tabId: number): Promise<FirefoxTabSnapshot | undefined>;
  expandGroup(groupId: number): Promise<void>;
  focusWindow(windowId: number): Promise<void>;
  activateTab(tabId: number): Promise<void>;
}

export class FirefoxTabs implements BrowserTabs {
  constructor(private readonly dependencies: FirefoxAdapterDependencies) {}

  async listOpenTabs(): Promise<readonly TabCandidate[]> {
    const [tabs, groups] = await Promise.all([
      this.dependencies.queryNormalTabs(),
      this.queryGroupsSafely(),
    ]);
    const groupsById = new Map(groups.map((group) => [group.id, group]));

    return tabs
      .filter(isSearchableTab)
      .map((tab) => this.toCandidate(tab, groupsById));
  }

  async activateTab(target: TabActivationTarget): Promise<TabActivationResult> {
    let tab: FirefoxTabSnapshot & { id: number; windowId: number };
    try {
      const currentTab = await this.dependencies.getTab(target.tabId);
      if (currentTab === undefined || !isSearchableTab(currentTab)) {
        return { status: "not-found" };
      }
      tab = currentTab;
    } catch {
      return { status: "not-found" };
    }

    const groupId = tab.groupId;
    if (groupId !== undefined && groupId !== this.dependencies.noGroupId) {
      try {
        await this.dependencies.expandGroup(groupId);
      } catch {
        // Group support is auxiliary to reaching the tab, so activation continues.
      }
    }

    try {
      await this.dependencies.focusWindow(tab.windowId);
    } catch {
      return { status: "unavailable", reason: "window" };
    }

    try {
      await this.dependencies.activateTab(target.tabId);
      return { status: "activated" };
    } catch {
      return { status: "unavailable", reason: "tab" };
    }
  }

  private async queryGroupsSafely(): Promise<readonly FirefoxGroupSnapshot[]> {
    try {
      return await this.dependencies.queryGroups();
    } catch {
      return [];
    }
  }

  private toCandidate(
    tab: FirefoxTabSnapshot & { id: number; windowId: number },
    groupsById: ReadonlyMap<number, FirefoxGroupSnapshot>,
  ): TabCandidate {
    const groupId = tab.groupId;
    const group =
      groupId === undefined || groupId === this.dependencies.noGroupId
        ? undefined
        : groupsById.get(groupId);

    return {
      id: tab.id,
      windowId: tab.windowId,
      title: tab.title ?? "",
      url: tab.url ?? "",
      lastAccessed:
        tab.lastAccessed !== undefined && Number.isFinite(tab.lastAccessed)
          ? tab.lastAccessed
          : null,
      group: group === undefined ? null : toGroupContext(group),
    };
  }
}

export function createFirefoxTabs(): BrowserTabs {
  return new FirefoxTabs({
    noGroupId: browser.tabGroups.TAB_GROUP_ID_NONE,
    queryNormalTabs: () => browser.tabs.query({ windowType: "normal" }),
    queryGroups: () => browser.tabGroups.query({}),
    getTab: (tabId) => browser.tabs.get(tabId),
    expandGroup: async (groupId) => {
      await browser.tabGroups.update(groupId, { collapsed: false });
    },
    focusWindow: async (windowId) => {
      await browser.windows.update(windowId, { focused: true });
    },
    activateTab: async (tabId) => {
      await browser.tabs.update(tabId, { active: true });
    },
  });
}

function isSearchableTab(
  tab: FirefoxTabSnapshot,
): tab is FirefoxTabSnapshot & { id: number; windowId: number } {
  return (
    !tab.incognito &&
    Number.isInteger(tab.id) &&
    (tab.id ?? -1) >= 0 &&
    Number.isInteger(tab.windowId) &&
    (tab.windowId ?? -1) >= 0
  );
}

function toGroupContext(group: FirefoxGroupSnapshot): TabGroupContext {
  return {
    id: group.id,
    title: group.title ?? "",
    isCollapsed: group.collapsed,
  };
}
