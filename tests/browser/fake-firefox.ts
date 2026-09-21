import type {
  FirefoxAdapterDependencies,
  FirefoxGroupSnapshot,
  FirefoxTabSnapshot,
} from "../../src/browser/firefox-tabs";

export class FakeFirefox {
  readonly tabs: FirefoxTabSnapshot[];
  readonly groups: FirefoxGroupSnapshot[];
  activeTabId: number | null = null;
  focusedWindowId: number | null = null;
  failGroupExpansion = false;
  failWindowFocus = false;
  failTabActivation = false;

  constructor(
    tabs: readonly FirefoxTabSnapshot[],
    groups: readonly FirefoxGroupSnapshot[] = [],
  ) {
    this.tabs = [...tabs];
    this.groups = [...groups];
  }

  dependencies(): FirefoxAdapterDependencies {
    return {
      noGroupId: -1,
      queryNormalTabs: async () => this.tabs,
      queryGroups: async () => this.groups,
      getTab: async (tabId) => this.tabs.find((tab) => tab.id === tabId),
      expandGroup: async (groupId) => {
        if (this.failGroupExpansion) {
          throw new Error("group expansion failed");
        }

        const group = this.groups.find((candidate) => candidate.id === groupId);
        if (group !== undefined) {
          group.collapsed = false;
        }
      },
      focusWindow: async (windowId) => {
        if (this.failWindowFocus) {
          throw new Error("window focus failed");
        }
        this.focusedWindowId = windowId;
      },
      activateTab: async (tabId) => {
        if (this.failTabActivation) {
          throw new Error("tab activation failed");
        }
        this.activeTabId = tabId;
      },
    };
  }
}
