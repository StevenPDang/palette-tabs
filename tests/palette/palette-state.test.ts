import { describe, expect, it } from "vitest";

import {
  createPaletteState,
  getActiveResult,
  moveSelection,
  updateQuery,
} from "../../src/palette/palette-state";
import type { TabCandidate } from "../../src/shared/tabs";

function makeTabs(count: number): readonly TabCandidate[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    windowId: 1,
    title: index === 8 ? "Firefox documentation" : `Example tab ${index + 1}`,
    url: `https://example.com/${index + 1}`,
    lastAccessed: index,
    group: null,
  }));
}

describe("palette state", () => {
  it("shows a bounded recent list before the user types", () => {
    const state = createPaletteState(makeTabs(12));

    expect(state.results).toHaveLength(8);
    expect(state.results[0]?.tab.id).toBe(12);
    expect(state.activeIndex).toBe(0);
  });

  it("filters results and resets selection when the query changes", () => {
    const initialState = moveSelection(createPaletteState(makeTabs(12)), 1);
    const searchedState = updateQuery(initialState, "firefox doc");

    expect(searchedState.results.map((result) => result.tab.id)).toEqual([9]);
    expect(searchedState.activeIndex).toBe(0);
  });

  it("keeps keyboard selection within the available results", () => {
    const initialState = createPaletteState(makeTabs(3));

    const atEnd = moveSelection(initialState, 20);
    expect(atEnd.activeIndex).toBe(2);
    expect(moveSelection(atEnd, -20).activeIndex).toBe(0);
  });

  it("returns no active result when a query has no matches", () => {
    const state = updateQuery(createPaletteState(makeTabs(3)), "not present");

    expect(state.activeIndex).toBe(-1);
    expect(getActiveResult(state)).toBeNull();
  });
});
