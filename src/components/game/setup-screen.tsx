import { useState } from "react";
import { ArrowLeft, Bot, Minus, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_NAMES } from "@/lib/game/deck";
import { loadSettings } from "@/lib/game/settings";
import { unlockAudio, playTap } from "@/lib/game/audio";
import { useGame } from "@/lib/game/store";
import type { SeatDraft } from "@/lib/game/types";
import { cn } from "@/lib/utils";

const SEAT_TONES = ["bg-seat-1", "bg-seat-2", "bg-seat-3", "bg-seat-4"] as const;

function defaultSeats(count: number): SeatDraft[] {
  const saved = loadSettings().names;
  const you = saved[0]?.trim() || "You";
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return { name: you, isAi: false };
    return { name: AI_NAMES[i - 1] ?? `Player ${i + 1}`, isAi: true };
  });
}

export function SetupScreen() {
  const backToTitle = useGame((s) => s.backToTitle);
  const startCustom = useGame((s) => s.startCustom);
  const soundEnabled = useGame((s) => s.soundEnabled);

  const [seats, setSeats] = useState<SeatDraft[]>(() => defaultSeats(2));
  const [winTarget, setWinTarget] = useState(6);

  const tap = () => {
    unlockAudio();
    if (soundEnabled) playTap();
  };

  const setCount = (n: number) => {
    tap();
    const next = Math.min(4, Math.max(1, n));
    setSeats((prev) => {
      if (next <= prev.length) return prev.slice(0, next);
      const extra = defaultSeats(next).slice(prev.length);
      return [...prev, ...extra];
    });
  };

  const updateSeat = (i: number, patch: Partial<SeatDraft>) => {
    setSeats((prev) => prev.map((seat, idx) => (idx === i ? { ...seat, ...patch } : seat)));
  };

  return (
    <div className="felt-ground min-h-dvh px-5 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => (tap(), backToTitle())} aria-label="Back">
            <ArrowLeft />
          </Button>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-sage uppercase">Table</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Set up the race</h1>
          </div>
        </div>

        <section className="rounded-xl bg-felt-mid/70 p-4 shadow-[var(--shadow-border)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Seats</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => setCount(seats.length - 1)}
                disabled={seats.length <= 1}
                aria-label="Fewer players"
              >
                <Minus />
              </Button>
              <span className="w-6 text-center tabular-nums">{seats.length}</span>
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => setCount(seats.length + 1)}
                disabled={seats.length >= 4}
                aria-label="More players"
              >
                <Plus />
              </Button>
            </div>
          </div>
          <ul className="space-y-2">
            {seats.map((seat, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg bg-felt-deep/50 p-2 pl-3"
              >
                <span className={cn("size-2.5 shrink-0 rounded-full", SEAT_TONES[i])} />
                <input
                  value={seat.name}
                  onChange={(e) => updateSeat(i, { name: e.target.value })}
                  maxLength={16}
                  aria-label={`Player ${i + 1} name`}
                  className="h-10 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm text-fg outline-none placeholder:text-subtle"
                />
                <button
                  type="button"
                  onClick={() => (tap(), updateSeat(i, { isAi: !seat.isAi }))}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted hover:bg-fg/10 hover:text-fg"
                >
                  {seat.isAi ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                  {seat.isAi ? "AI" : "Human"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded-xl bg-felt-mid/70 p-4 shadow-[var(--shadow-border)]">
          <h2 className="mb-3 text-sm font-medium">Race to</h2>
          <div className="grid grid-cols-2 gap-2">
            {[3, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => (tap(), setWinTarget(n))}
                className={cn(
                  "h-11 rounded-md text-sm font-medium transition-colors duration-150",
                  winTarget === n ? "bg-bone text-ink" : "bg-felt-deep/50 text-muted hover:text-fg",
                )}
              >
                {n} cards
              </button>
            ))}
          </div>
        </section>

        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            tap();
            startCustom(seats, winTarget);
          }}
        >
          Deal the first card
        </Button>
      </div>
    </div>
  );
}
