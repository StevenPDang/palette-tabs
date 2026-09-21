export {};

const searchInput = document.querySelector<HTMLInputElement>("#tab-search");
const statusElement = document.querySelector<HTMLElement>("#platform-status");

if (searchInput === null || statusElement === null) {
  throw new Error("The palette shell is missing required elements.");
}

searchInput.focus();

const tabs = await browser.tabs.query({ windowType: "normal" });
const groupSupport = browser.tabGroups === undefined ? "unavailable" : "available";

statusElement.textContent = `${tabs.length} open tabs · Tab groups ${groupSupport}`;

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.close();
  }
});
