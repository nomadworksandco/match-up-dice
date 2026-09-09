import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/game/types";

const SEAT_TONES = ["bg-seat-1", "bg-seat-2", "bg-seat-3", "bg-seat-4"] as const;

export function PlayerStrip({
  players,
  currentId,
  winTarget,
}: {
  players: Player[];
  currentId?: string;
  winTarget: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {players.map((player) => {
        const active = player.id === currentId;
        const done = player.marked.filter(Boolean).length;
        const need = player.marked.length || 0;
        return (
          <li
            key={player.id}
            className={cn(
              "rounded-lg px-3 py-2.5 shadow-[var(--shadow-border)]",
              active ? "bg-felt-mid" : "bg-felt-deep/40",
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("size-2 shrink-0 rounded-full", SEAT_TONES[player.seat])} />
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{player.name}</p>
              {player.isAi ? (
                <Bot className="size-3.5 text-subtle" />
              ) : (
                <User className="size-3.5 text-subtle" />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted tabular-nums">
                {player.won.length}/{winTarget}
              </p>
              <p className="text-[11px] text-subtle tabular-nums">
                {need ? `${done}/${need}` : ""}
              </p>
            </div>
            <div className="mt-1.5 flex gap-0.5">
              {Array.from({ length: winTarget }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i < player.won.length ? "bg-sage" : "bg-fg/10",
                    player.won[i]?.perfect && "bg-bone",
                  )}
                />
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
