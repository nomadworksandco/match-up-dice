import { useEffect } from "react";
import {
  playDiceRoll,
  playMatch,
  playMiss,
  playPerfect,
  playWin,
  setMuted,
  unlockAudio,
} from "@/lib/game/audio";
import { prefersReducedMotion } from "@/lib/game/engine";
import { AI_THINK_MS, RESOLVE_MS, ROLL_MS, useGame } from "@/lib/game/store";
import { HowToPlay } from "./how-to-play";
import { GameOverOverlay, RoundOverOverlay } from "./overlays";
import { PlayTable } from "./play-table";
import { SetupScreen } from "./setup-screen";
import { TitleScreen } from "./title-screen";

export function GameApp() {
  const screen = useGame((s) => s.screen);
  const phase = useGame((s) => s.phase);
  const howToPlay = useGame((s) => s.howToPlay);
  const soundEnabled = useGame((s) => s.soundEnabled);
  const currentPlayerIndex = useGame((s) => s.currentPlayerIndex);
  const players = useGame((s) => s.players);
  const resultText = useGame((s) => s.resultText);
  const lastPerfect = useGame((s) => s.lastPerfect);
  const hydrateSettings = useGame((s) => s.hydrateSettings);
  const roll = useGame((s) => s.roll);
  const settleRoll = useGame((s) => s.settleRoll);
  const advanceTurn = useGame((s) => s.advanceTurn);

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    setMuted(!soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (screen !== "play" || phase !== "rolling") return;
    if (soundEnabled) playDiceRoll();
    const ms = prefersReducedMotion() ? 160 : ROLL_MS;
    const t = window.setTimeout(() => settleRoll(), ms);
    return () => window.clearTimeout(t);
  }, [screen, phase, settleRoll, soundEnabled]);

  useEffect(() => {
    if (screen !== "play" || phase !== "resolve") return;
    if (soundEnabled) {
      if (resultText.startsWith("Matched")) playMatch();
      else playMiss();
    }
    const t = window.setTimeout(() => advanceTurn(), RESOLVE_MS);
    return () => window.clearTimeout(t);
  }, [screen, phase, advanceTurn, resultText, soundEnabled]);

  useEffect(() => {
    if (screen !== "play") return;
    if (phase !== "roundOver" && phase !== "gameOver") return;
    if (!soundEnabled) return;
    if (lastPerfect) playPerfect();
    else playWin();
  }, [screen, phase, lastPerfect, soundEnabled]);

  useEffect(() => {
    if (screen !== "play" || phase !== "idle") return;
    const current = players[currentPlayerIndex];
    if (!current?.isAi) return;
    const t = window.setTimeout(() => roll(), AI_THINK_MS);
    return () => window.clearTimeout(t);
  }, [screen, phase, currentPlayerIndex, players, roll]);

  useEffect(() => {
    if (screen !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      const state = useGame.getState();
      const player = state.players[state.currentPlayerIndex];
      if (state.phase === "idle" && player && !player.isAi) {
        unlockAudio();
        roll();
      } else if (state.phase === "resolve") {
        advanceTurn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, roll, advanceTurn]);

  return (
    <main className="min-h-dvh">
      {screen === "title" ? <TitleScreen /> : null}
      {screen === "setup" ? <SetupScreen /> : null}
      {screen === "play" ? <PlayTable /> : null}
      {howToPlay ? <HowToPlay /> : null}
      {phase === "roundOver" ? <RoundOverOverlay /> : null}
      {phase === "gameOver" ? <GameOverOverlay /> : null}
    </main>
  );
}
