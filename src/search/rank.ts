import type {
  TabCandidate,
  TabMatchField,
  TabSearchResult,
} from "../shared/tabs";
import { scoreFragment } from "./match";
import { getUrlDomain, splitQuery } from "./normalize";

const FIELD_BONUS: Readonly<Record<TabMatchField, number>> = {
  title: 100,
  domain: 70,
  url: 0,
};

interface ScoredField {
  readonly field: TabMatchField;
  readonly score: number;
}

export function rankTabs(
  query: string,
  candidates: readonly TabCandidate[],
): readonly TabSearchResult[] {
  const fragments = splitQuery(query);
  const results = candidates
    .map((candidate) => scoreCandidate(candidate, fragments))
    .filter((result): result is TabSearchResult => result !== null);

  return results.sort(compareResults);
}

function scoreCandidate(
  tab: TabCandidate,
  fragments: readonly string[],
): TabSearchResult | null {
  if (fragments.length === 0) {
    return { tab, score: 0, matchedFields: [] };
  }

  const fields: Readonly<Record<TabMatchField, string>> = {
    title: tab.title,
    domain: getUrlDomain(tab.url),
    url: tab.url,
  };
  const matchedFields = new Set<TabMatchField>();
  let score = 0;

  for (const fragment of fragments) {
    const bestMatch = getBestFieldMatch(fragment, fields);
    if (bestMatch === null) {
      return null;
    }

    matchedFields.add(bestMatch.field);
    score += bestMatch.score;
  }

  return { tab, score, matchedFields: [...matchedFields] };
}

function getBestFieldMatch(
  fragment: string,
  fields: Readonly<Record<TabMatchField, string>>,
): ScoredField | null {
  let bestMatch: ScoredField | null = null;

  for (const field of Object.keys(fields) as TabMatchField[]) {
    const fieldScore = scoreFragment(fragment, fields[field]);
    if (fieldScore === null) {
      continue;
    }

    const match = { field, score: fieldScore + FIELD_BONUS[field] };
    if (bestMatch === null || match.score > bestMatch.score) {
      bestMatch = match;
    }
  }

  return bestMatch;
}

function compareResults(left: TabSearchResult, right: TabSearchResult): number {
  if (left.score !== right.score) {
    return right.score - left.score;
  }

  const leftAccessed = left.tab.lastAccessed ?? Number.NEGATIVE_INFINITY;
  const rightAccessed = right.tab.lastAccessed ?? Number.NEGATIVE_INFINITY;
  if (leftAccessed !== rightAccessed) {
    return rightAccessed - leftAccessed;
  }

  return left.tab.id - right.tab.id;
}
