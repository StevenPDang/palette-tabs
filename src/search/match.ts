import { normalizeSearchText } from "./normalize";

export function scoreFragment(fragment: string, rawValue: string): number | null {
  const value = normalizeSearchText(rawValue);
  if (value === "") {
    return null;
  }

  if (value === fragment) {
    return 1_000;
  }

  const words = value.split(" ");
  if (words.includes(fragment)) {
    return 900;
  }

  const prefix = words.find((word) => word.startsWith(fragment));
  if (prefix !== undefined) {
    return 800 - Math.min(prefix.length - fragment.length, 50);
  }

  const substringIndex = value.indexOf(fragment);
  if (substringIndex !== -1) {
    return 650 - Math.min(substringIndex, 100);
  }

  return scoreSubsequence(fragment, value);
}

function scoreSubsequence(fragment: string, value: string): number | null {
  let fragmentIndex = 0;
  let firstMatch = -1;

  for (let valueIndex = 0; valueIndex < value.length; valueIndex += 1) {
    if (value[valueIndex] !== fragment[fragmentIndex]) {
      continue;
    }

    firstMatch = firstMatch === -1 ? valueIndex : firstMatch;
    fragmentIndex += 1;

    if (fragmentIndex === fragment.length) {
      const span = valueIndex - firstMatch + 1;
      const gaps = span - fragment.length;
      return 300 - Math.min(gaps * 5 + firstMatch, 200);
    }
  }

  return null;
}
