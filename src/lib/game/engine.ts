import type { DieFace, MatchCard, RollResult } from "./types";

export const DIE_COUNT = 6;
export const DEFAULT_WIN_TARGET = 6;

export function rollDie(): DieFace {
  return (Math.floor(Math.random() * 6) + 1) as DieFace;
}

export function rollDice(): DieFace[] {
  return Array.from({ length: DIE_COUNT }, () => rollDie());
}

export function pairCounts(dice: DieFace[]): Record<DieFace, number> {
  const counts: Record<DieFace, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const face of dice) counts[face] += 1;
  return {
    1: Math.floor(counts[1] / 2),
    2: Math.floor(counts[2] / 2),
    3: Math.floor(counts[3] / 2),
    4: Math.floor(counts[4] / 2),
    5: Math.floor(counts[5] / 2),
    6: Math.floor(counts[6] / 2),
  };
}

function joinFaces(faces: DieFace[]): string {
  if (faces.length === 0) return "";
  if (faces.length === 1) return String(faces[0]);
  if (faces.length === 2) return `${faces[0]} and ${faces[1]}`;
  return `${faces.slice(0, -1).join(", ")}, and ${faces[faces.length - 1]}`;
}

export function applyRoll(
  card: MatchCard,
  marked: boolean[],
  dice: DieFace[],
): RollResult {
  const available = pairCounts(dice);
  const nextMarked = [...marked];
  const matchedFaces: DieFace[] = [];

  if (card.type === "any") {
    for (let i = 0; i < card.pairs.length; i++) {
      if (nextMarked[i]) continue;
      const face = card.pairs[i];
      if (face && available[face] > 0) {
        nextMarked[i] = true;
        available[face] -= 1;
        matchedFaces.push(face);
      }
    }
  } else {
    for (let i = 0; i < card.pairs.length; i++) {
      if (nextMarked[i]) continue;
      const face = card.pairs[i];
      if (face && available[face] > 0) {
        nextMarked[i] = true;
        available[face] -= 1;
        matchedFaces.push(face);
      } else {
        break;
      }
    }
  }

  const need: Record<number, number> = {};
  for (const face of matchedFaces) need[face] = (need[face] ?? 0) + 2;
  const highlights = dice.map((face) => {
    if ((need[face] ?? 0) > 0) {
      need[face] -= 1;
      return true;
    }
    return false;
  });

  const completed = nextMarked.length > 0 && nextMarked.every(Boolean);
  const hadNothing = marked.every((slot) => !slot);
  const perfect = completed && hadNothing;

  let text: string;
  if (matchedFaces.length > 0) {
    text = `Matched ${joinFaces(matchedFaces)}`;
  } else if (card.type === "sequence") {
    const nextSlot = marked.findIndex((slot) => !slot);
    const nextFace = card.pairs[nextSlot] ?? card.pairs[0];
    text = `Need a pair of ${nextFace}s first`;
  } else {
    text = "No matching pairs this roll";
  }

  return { nextMarked, highlights, matchedFaces, text, perfect, completed };
}

export function emptyMarks(card: MatchCard): boolean[] {
  return card.pairs.map(() => false);
}

export function nextIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
