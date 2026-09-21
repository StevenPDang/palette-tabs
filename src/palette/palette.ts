import { getUrlDomain } from "../search/normalize";
import type { TabsRequest, TabsResponse } from "../shared/messages";
import type { TabCandidate, TabSearchResult } from "../shared/tabs";
import {
  createPaletteState,
  getActiveResult,
  moveSelection,
  updateQuery,
} from "./palette-state";

const searchInput = getRequiredElement<HTMLInputElement>("#tab-search");
const resultsElement = getRequiredElement<HTMLUListElement>("#tab-results");
const emptyState = getRequiredElement<HTMLElement>("#empty-state");
const statusElement = getRequiredElement<HTMLElement>("#palette-status");

let state = createPaletteState([]);
let windowLabels = new Map<number, string>();

searchInput.focus();
bindEvents();
await loadTabs();

async function loadTabs(): Promise<void> {
  const response = await sendTabsRequest({ type: "tabs:list" });
  if (response?.type !== "tabs:list") {
    statusElement.textContent = "Could not read open tabs";
    emptyState.textContent = "Try closing and reopening Simple Tabs";
    emptyState.hidden = false;
    return;
  }

  state = createPaletteState(response.tabs);
  windowLabels = createWindowLabels(response.tabs);
  render();
}

function bindEvents(): void {
  searchInput.addEventListener("input", () => {
    state = updateQuery(state, searchInput.value);
    render();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      state = moveSelection(state, event.key === "ArrowDown" ? 1 : -1);
      render();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const result = getActiveResult(state);
      if (result !== null) {
        void activate(result);
      }
      return;
    }

    if (event.key === "Escape") {
      window.close();
    }
  });
}

function render(): void {
  resultsElement.replaceChildren();

  state.results.forEach((result, index) => {
    const option = createResultOption(result, index);
    resultsElement.append(option);
  });

  const activeResult = getActiveResult(state);
  if (activeResult === null) {
    searchInput.removeAttribute("aria-activedescendant");
  } else {
    const activeId = optionId(activeResult.tab.id);
    searchInput.setAttribute("aria-activedescendant", activeId);
    document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }

  emptyState.hidden = state.results.length !== 0;
  emptyState.textContent = "No matching open tabs";
  statusElement.textContent = formatResultCount(state.results.length);
}

function createResultOption(
  result: TabSearchResult,
  index: number,
): HTMLLIElement {
  const option = document.createElement("li");
  const isActive = index === state.activeIndex;
  option.id = optionId(result.tab.id);
  option.className = "result";
  option.role = "option";
  option.setAttribute("aria-selected", String(isActive));

  const title = document.createElement("span");
  title.className = "result-title";
  title.textContent = result.tab.title || "Untitled tab";

  const context = document.createElement("span");
  context.className = "result-context";
  context.textContent = formatContext(result.tab);

  option.append(title, context);
  option.addEventListener("mousedown", (event) => event.preventDefault());
  option.addEventListener("click", () => void activate(result));
  return option;
}

async function activate(result: TabSearchResult): Promise<void> {
  searchInput.disabled = true;
  statusElement.textContent = "Opening tab…";
  const response = await sendTabsRequest({
    type: "tabs:activate",
    tabId: result.tab.id,
  });

  if (response?.type === "tabs:activate" && response.result.status === "activated") {
    window.close();
    return;
  }

  searchInput.disabled = false;
  statusElement.textContent =
    response?.type === "tabs:activate" && response.result.status === "not-found"
      ? "That tab was just closed"
      : "Could not open that tab";
  searchInput.focus();
}

async function sendTabsRequest(
  request: TabsRequest,
): Promise<TabsResponse | undefined> {
  try {
    return (await browser.runtime.sendMessage(request)) as TabsResponse | undefined;
  } catch {
    return undefined;
  }
}

function formatContext(tab: TabCandidate): string {
  const parts = [
    getUrlDomain(tab.url) || tab.url || "Restricted page",
    windowLabels.get(tab.windowId) ?? "Window",
    tab.group?.title || null,
  ];
  return parts.filter((part): part is string => part !== null).join(" · ");
}

function createWindowLabels(
  candidates: readonly TabCandidate[],
): Map<number, string> {
  const labels = new Map<number, string>();
  for (const candidate of candidates) {
    if (!labels.has(candidate.windowId)) {
      labels.set(candidate.windowId, `Window ${labels.size + 1}`);
    }
  }
  return labels;
}

function formatResultCount(count: number): string {
  if (count === 0) {
    return "No results";
  }
  return `${count} ${count === 1 ? "result" : "results"}`;
}

function optionId(tabId: number): string {
  return `tab-result-${tabId}`;
}

function getRequiredElement<ElementType extends Element>(
  selector: string,
): ElementType {
  const element = document.querySelector<ElementType>(selector);
  if (element === null) {
    throw new Error(`Missing palette element: ${selector}`);
  }
  return element;
}
