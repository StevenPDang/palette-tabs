export interface TabGroupContext {
  readonly id: number;
  readonly title: string;
  readonly isCollapsed: boolean;
}
export interface TabCandidate {
  readonly id: number;
  readonly windowId: number;
  readonly title: string;
  readonly url: string;
  readonly lastAccessed: number | null;
  readonly group: TabGroupContext | null;
}

export interface TabActivationTarget {
  readonly tabId: number;
  readonly windowId: number;
  readonly groupId: number | null;
}

export type TabMatchField = "title" | "domain" | "url";

export interface TabSearchResult {
  readonly tab: TabCandidate;
  readonly score: number;
  readonly matchedFields: readonly TabMatchField[];
}
