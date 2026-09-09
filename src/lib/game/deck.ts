import type { DieFace, MatchCard } from "./types";

let seq = 0;

function id(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

const TEMPLATES: { type: MatchCard["type"]; pairs: DieFace[] }[] = [
  { type: "any", pairs: [1, 6] },
  { type: "any", pairs: [2, 5] },
  { type: "any", pairs: [3, 4] },
  { type: "any", pairs: [1, 2] },
  { type: "any", pairs: [5, 6] },
  { type: "any", pairs: [2, 3] },
  { type: "any", pairs: [1, 3, 5] },
  { type: "any", pairs: [2, 4, 6] },
  { type: "any", pairs: [1, 2, 3] },
  { type: "any", pairs: [4, 5, 6] },
  { type: "any", pairs: [2, 3, 5] },
  { type: "any", pairs: [1, 4, 6] },
  { type: "any", pairs: [3, 4, 5] },
  { type: "any", pairs: [1, 2, 5, 6] },
  { type: "any", pairs: [2, 3, 4, 5] },
  { type: "any", pairs: [1, 3, 4, 6] },
  { type: "sequence", pairs: [1, 2, 3] },
  { type: "sequence", pairs: [6, 5, 4] },
  { type: "sequence", pairs: [2, 4, 6] },
  { type: "sequence", pairs: [1, 3, 5] },
  { type: "sequence", pairs: [6, 4, 2] },
  { type: "sequence", pairs: [3, 2, 1] },
  { type: "sequence", pairs: [1, 2, 3, 4] },
  { type: "sequence", pairs: [6, 5, 4, 3] },
  { type: "sequence", pairs: [1, 6, 2, 5] },
  { type: "sequence", pairs: [2, 3, 4, 5] },
];

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

export function buildDeck(): MatchCard[] {
  return shuffle(
    TEMPLATES.map((template) => ({
      ...template,
      id: id("card"),
    })),
  );
}

export function drawCard(deck: MatchCard[]): {
  card: MatchCard;
  rest: MatchCard[];
} {
  const pile = deck.length > 0 ? deck : buildDeck();
  const card = pile[0];
  if (!card) {
    const fresh = buildDeck();
    return { card: fresh[0]!, rest: fresh.slice(1) };
  }
  return { card, rest: pile.slice(1) };
}

export const AI_NAMES = ["Reed", "Marlowe", "Quinn", "Ellis", "Sable", "Wren"];
