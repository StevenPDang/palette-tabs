browser.runtime.onInstalled.addListener(() => {
  if (browser.tabGroups === undefined) {
    console.warn("Simple Tabs: tab group support is unavailable.");
  }
});
