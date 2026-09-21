import type { TabActivationResult } from "../browser/browser-tabs";
import type { TabCandidate } from "./tabs";

export type TabsRequest =
  | { readonly type: "tabs:list" }
  | { readonly type: "tabs:activate"; readonly tabId: number };

export type TabsResponse =
  | { readonly type: "tabs:list"; readonly tabs: readonly TabCandidate[] }
  | {
      readonly type: "tabs:activate";
      readonly result: TabActivationResult;
    }
  | { readonly type: "tabs:error" };

export function isTabsRequest(value: unknown): value is TabsRequest {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  if (value.type === "tabs:list") {
    return true;
  }

  return (
    value.type === "tabs:activate" &&
    "tabId" in value &&
    typeof value.tabId === "number" &&
    Number.isInteger(value.tabId) &&
    value.tabId >= 0
  );
}
