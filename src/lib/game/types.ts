export type CardType = "any" | "sequence";

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface MatchCard {
  id: string;
  type: CardType;
  pairs: DieFace[];
}

export interface WonCard {
  card: MatchCard;
  perfect: boolean;
}

export interface Player {
  id: string;
  name: string;
  isAi: boolean;
  seat: number;
  marked: boolean[];
  won: WonCard[];
}

export type Screen = "title" | "setup" | "play";

export type PlayPhase =
  | "idle"
  | "rolling"
  | "resolve"
  | "roundOver"
  | "gameOver";

export interface RollResult {
  nextMarked: boolean[];
  highlights: boolean[];
  matchedFaces: DieFace[];
  text: string;
  perfect: boolean;
  completed: boolean;
}

export interface SeatDraft {
  name: string;
  isAi: boolean;
}
