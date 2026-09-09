import { create } from "zustand";
import { AI_NAMES, buildDeck, drawCard } from "./deck";
import { applyRoll, emptyMarks, nextIndex, rollDice } from "./engine";
import { loadSettings, saveSettings } from "./settings";
import type {
  DieFace,
  MatchCard,
  PlayPhase,
  Player,
  Screen,
  SeatDraft,
} from "./types";

export const ROLL_MS = 980;
export const RESOLVE_MS = 1500;
export const AI_THINK_MS = 850;

interface GameState {
  screen: Screen;
  phase: PlayPhase;
  howToPlay: boolean;
  soundEnabled: boolean;
  players: Player[];
  currentPlayerIndex: number;
  roundStarterIndex: number;
  deck: MatchCard[];
  activeCard: MatchCard | null;
  dice: DieFace[];
  highlights: boolean[];
  resultText: string;
  lastPerfect: boolean;
  winTarget: number;
  roundWinnerId: string | null;
  championId: string | null;
  rollNonce: number;
}

interface GameActions {
  hydrateSettings: () => void;
  setSound: (on: boolean) => void;
  openHowTo: () => void;
  closeHowTo: () => void;
  openSetup: () => void;
  backToTitle: () => void;
  quickPlay: () => void;
  startCustom: (seats: SeatDraft[], winTarget: number) => void;
  roll: () => void;
  settleRoll: () => void;
  advanceTurn: () => void;
  continueAfterRound: () => void;
  playAgain: () => void;
}

const REST_DICE: DieFace[] = [1, 2, 3, 4, 5, 6];

function makePlayer(draft: SeatDraft, seat: number, card: MatchCard | null): Player {
  return {
    id: `p${seat + 1}`,
    name:
      draft.name.trim() ||
      (draft.isAi ? (AI_NAMES[seat] ?? `Bot ${seat + 1}`) : `Player ${seat + 1}`),
    isAi: draft.isAi,
    seat,
    marked: card ? emptyMarks(card) : [],
    won: [],
  };
}

function dealTable(seats: SeatDraft[], winTarget: number): Partial<GameState> {
  const deck0 = buildDeck();
  const { card, rest } = drawCard(deck0);
  const players = seats.map((seat, i) => makePlayer(seat, i, card));
  saveSettings({ names: seats.filter((s) => !s.isAi).map((s) => s.name) });
  return {
    screen: "play",
    phase: "idle",
    players,
    currentPlayerIndex: 0,
    roundStarterIndex: 0,
    deck: rest,
    activeCard: card,
    dice: REST_DICE,
    highlights: REST_DICE.map(() => false),
    resultText: "",
    lastPerfect: false,
    winTarget,
    roundWinnerId: null,
    championId: null,
    rollNonce: 0,
  };
}

export const useGame = create<GameState & GameActions>((set, get) => ({
  screen: "title",
  phase: "idle",
  howToPlay: false,
  soundEnabled: true,
  players: [],
  currentPlayerIndex: 0,
  roundStarterIndex: 0,
  deck: [],
  activeCard: null,
  dice: REST_DICE,
  highlights: REST_DICE.map(() => false),
  resultText: "",
  lastPerfect: false,
  winTarget: 6,
  roundWinnerId: null,
  championId: null,
  rollNonce: 0,

  hydrateSettings: () => {
    const s = loadSettings();
    set({ soundEnabled: s.sound });
  },

  setSound: (on) => {
    set({ soundEnabled: on });
    saveSettings({ sound: on });
  },

  openHowTo: () => set({ howToPlay: true }),
  closeHowTo: () => set({ howToPlay: false }),
  openSetup: () => set({ screen: "setup" }),
  backToTitle: () =>
    set({
      screen: "title",
      phase: "idle",
      howToPlay: false,
      players: [],
      activeCard: null,
      resultText: "",
      roundWinnerId: null,
      championId: null,
    }),

  quickPlay: () => {
    const names = loadSettings().names;
    const you = names[0]?.trim() || "You";
    set(
      dealTable(
        [
          { name: you, isAi: false },
          { name: "Reed", isAi: true },
        ],
        6,
      ),
    );
  },

  startCustom: (seats, winTarget) => {
    set(dealTable(seats, winTarget));
  },

  roll: () => {
    const { phase, screen } = get();
    if (screen !== "play" || phase !== "idle") return;
    set({
      phase: "rolling",
      dice: rollDice(),
      highlights: REST_DICE.map(() => false),
      resultText: "",
      rollNonce: get().rollNonce + 1,
    });
  },

  settleRoll: () => {
    const { phase, activeCard, players, currentPlayerIndex, dice, winTarget } = get();
    if (phase !== "rolling" || !activeCard) return;
    const player = players[currentPlayerIndex];
    if (!player) return;

    const result = applyRoll(activeCard, player.marked, dice);
    const nextPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? { ...p, marked: result.nextMarked } : p,
    );

    if (result.completed) {
      const winner = nextPlayers[currentPlayerIndex];
      if (!winner) return;
      const won = [...winner.won, { card: activeCard, perfect: result.perfect }];
      const withWin = nextPlayers.map((p, i) =>
        i === currentPlayerIndex ? { ...p, marked: result.nextMarked, won } : p,
      );
      const isChampion = won.length >= winTarget;
      set({
        players: withWin,
        highlights: result.highlights,
        resultText: result.perfect ? "Perfect roll" : result.text,
        lastPerfect: result.perfect,
        roundWinnerId: winner.id,
        championId: isChampion ? winner.id : null,
        phase: isChampion ? "gameOver" : "roundOver",
      });
      return;
    }

    set({
      players: nextPlayers,
      highlights: result.highlights,
      resultText: result.text,
      lastPerfect: false,
      phase: "resolve",
    });
  },

  advanceTurn: () => {
    const { phase, players, currentPlayerIndex } = get();
    if (phase !== "resolve") return;
    set({
      phase: "idle",
      currentPlayerIndex: nextIndex(currentPlayerIndex, players.length),
      highlights: REST_DICE.map(() => false),
      resultText: "",
    });
  },

  continueAfterRound: () => {
    const { phase, players, roundWinnerId, deck } = get();
    if (phase !== "roundOver" || !roundWinnerId) return;
    const winnerIndex = players.findIndex((p) => p.id === roundWinnerId);
    const starter = nextIndex(Math.max(winnerIndex, 0), players.length);
    const { card, rest } = drawCard(deck);
    set({
      phase: "idle",
      activeCard: card,
      deck: rest,
      currentPlayerIndex: starter,
      roundStarterIndex: starter,
      roundWinnerId: null,
      lastPerfect: false,
      resultText: "",
      highlights: REST_DICE.map(() => false),
      dice: REST_DICE,
      players: players.map((p) => ({ ...p, marked: emptyMarks(card) })),
    });
  },

  playAgain: () => {
    const { players, winTarget } = get();
    const seats: SeatDraft[] = players.map((p) => ({ name: p.name, isAi: p.isAi }));
    if (seats.length === 0) {
      get().quickPlay();
      return;
    }
    set(dealTable(seats, winTarget));
  },
}));

export function selectCurrentPlayer(state: GameState): Player | undefined {
  return state.players[state.currentPlayerIndex];
}

if (typeof window !== "undefined") {
  (window as Window & { __matchUp?: typeof useGame }).__matchUp = useGame;
}
