import { BookOpen, LogOut, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playTap, setMuted, unlockAudio } from "@/lib/game/audio";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import { Die3D } from "./die-3d";
import { PlayerStrip } from "./player-strip";
import { RoundCard } from "./round-card";

export function PlayTable() {
  const phase = useGame((s) => s.phase);
  const players = useGame((s) => s.players);
  const currentPlayerIndex = useGame((s) => s.currentPlayerIndex);
  const activeCard = useGame((s) => s.activeCard);
  const dice = useGame((s) => s.dice);
  const highlights = useGame((s) => s.highlights);
  const resultText = useGame((s) => s.resultText);
  const winTarget = useGame((s) => s.winTarget);
  const rollNonce = useGame((s) => s.rollNonce);
  const soundEnabled = useGame((s) => s.soundEnabled);
  const roll = useGame((s) => s.roll);
  const setSound = useGame((s) => s.setSound);
  const openHowTo = useGame((s) => s.openHowTo);
  const backToTitle = useGame((s) => s.backToTitle);
  const advanceTurn = useGame((s) => s.advanceTurn);

  const current = players[currentPlayerIndex];
  const rolling = phase === "rolling";
  const canRoll = phase === "idle" && current && !current.isAi;
  const canSkip = phase === "resolve";

  const tap = () => {
    unlockAudio();
    if (soundEnabled) playTap();
  };

  return (
    <div className="felt-ground flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-3 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold tracking-tight">Match Up</p>
          <p className="text-[11px] text-muted tabular-nums">Race to {winTarget}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
          onClick={() => {
            const next = !soundEnabled;
            setSound(next);
            setMuted(!next);
            if (next) playTap();
          }}
        >
          {soundEnabled ? <Volume2 /> : <VolumeX />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label="Rules"
          onClick={() => (tap(), openHowTo())}
        >
          <BookOpen />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label="Leave table"
          onClick={() => (tap(), backToTitle())}
        >
          <LogOut />
        </Button>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pb-28 sm:px-6">
        <PlayerStrip players={players} currentId={current?.id} winTarget={winTarget} />

        {activeCard && current ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-sage uppercase">
              Round card
            </p>
            <RoundCard card={activeCard} player={current} />
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-sage uppercase">
            Shared dice
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-felt-deep/45 px-3 py-5 sm:gap-4">
            {dice.map((value, i) => (
              <Die3D
                key={i}
                value={value}
                rolling={rolling}
                highlight={Boolean(highlights[i])}
                nonce={rollNonce}
                delayMs={i * 40}
              />
            ))}
          </div>
          <p
            className={cn(
              "mt-3 min-h-6 text-center text-sm",
              resultText ? "text-fg" : "text-muted",
            )}
          >
            {rolling
              ? "Rolling…"
              : resultText ||
                (current
                  ? current.isAi
                    ? `${current.name} is up`
                    : `${current.name} — your turn`
                  : "")}
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-felt-deep/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          {canSkip ? (
            <Button variant="secondary" className="w-full" onClick={() => (tap(), advanceTurn())}>
              Pass left
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              disabled={!canRoll}
              onClick={() => {
                unlockAudio();
                roll();
              }}
            >
              {current?.isAi ? `${current.name} is rolling` : "Roll the dice"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
