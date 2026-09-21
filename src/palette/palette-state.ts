import { rankTabs } from "../search/rank";
import type { TabCandidate, TabSearchResult } from "../shared/tabs";

const MAX_VISIBLE_RESULTS = 8;

export interface PaletteState {
  readonly candidates: readonly TabCandidate[];
  readonly query: string;
  readonly results: readonly TabSearchResult[];
  readonly activeIndex: number;
}

export function createPaletteState(
  candidates: readonly TabCandidate[],
): PaletteState {
  return stateForQuery(candidates, "");
}

export function updateQuery(state: PaletteState, query: string): PaletteState {
  return stateForQuery(state.candidates, query);
}

export function moveSelection(
  state: PaletteState,
  offset: number,
): PaletteState {
  if (state.results.length === 0) {
    return { ...state, activeIndex: -1 };
  }

  const activeIndex = Math.min(
    Math.max(state.activeIndex + offset, 0),
    state.results.length - 1,
  );
  return { ...state, activeIndex };
}

export function getActiveResult(state: PaletteState): TabSearchResult | null {
  return state.results[state.activeIndex] ?? null;
}

function stateForQuery(
  candidates: readonly TabCandidate[],
  query: string,
): PaletteState {
  const results = rankTabs(query, candidates).slice(0, MAX_VISIBLE_RESULTS);
  return {
    candidates,
    query,
    results,
    activeIndex: results.length === 0 ? -1 : 0,
  };
}
