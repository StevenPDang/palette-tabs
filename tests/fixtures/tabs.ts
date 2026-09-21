import type { TabCandidate } from "../../src/shared/tabs";

export const representativeTabs = [
  {
    id: 11,
    windowId: 1,
    title: "Pull requests · simple-tabs",
    url: "https://github.com/example/simple-tabs/pulls",
    lastAccessed: 1_750_000_000_000,
    group: {
      id: 101,
      title: "Development",
      isCollapsed: true,
    },
  },
  {
    id: 12,
    windowId: 1,
    title: "Issues · simple-tabs",
    url: "https://github.com/example/simple-tabs/issues",
    lastAccessed: 1_749_999_000_000,
    group: {
      id: 101,
      title: "Development",
      isCollapsed: true,
    },
  },
  {
    id: 21,
    windowId: 2,
    title: "Pull requests · browser-extension",
    url: "https://github.com/example/browser-extension/pulls",
    lastAccessed: 1_749_998_000_000,
    group: null,
  },
  {
    id: 22,
    windowId: 2,
    title: "Firefox extension workshop",
    url: "https://extensionworkshop.com/documentation/develop/",
    lastAccessed: 1_749_997_000_000,
    group: null,
  },
  {
    id: 23,
    windowId: 2,
    title: "",
    url: "about:blank",
    lastAccessed: null,
    group: null,
  },
] as const satisfies readonly TabCandidate[];
