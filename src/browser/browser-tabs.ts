import type { TabActivationTarget, TabCandidate } from "../shared/tabs";

export type TabActivationResult =
  | { readonly status: "activated" }
  | { readonly status: "not-found" }
  | {
      readonly status: "unavailable";
      readonly reason: "group" | "tab" | "window" | "unknown";
    };

export interface BrowserTabs {
  listOpenTabs(): Promise<readonly TabCandidate[]>;
  activateTab(target: TabActivationTarget): Promise<TabActivationResult>;
}
