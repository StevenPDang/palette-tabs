import { createFirefoxTabs } from "../browser/firefox-tabs";
import {
  isTabsRequest,
  type TabsResponse,
} from "../shared/messages";

const firefoxTabs = createFirefoxTabs();

browser.runtime.onMessage.addListener(
  (message: unknown): Promise<TabsResponse> | undefined => {
    if (!isTabsRequest(message)) {
      return undefined;
    }

    if (message.type === "tabs:list") {
      return firefoxTabs
        .listOpenTabs()
        .then((tabs) => ({ type: "tabs:list" as const, tabs }))
        .catch(() => ({ type: "tabs:error" as const }));
    }

    return firefoxTabs
      .activateTab({ tabId: message.tabId })
      .then((result) => ({ type: "tabs:activate" as const, result }))
      .catch(() => ({ type: "tabs:error" as const }));
  }
);
