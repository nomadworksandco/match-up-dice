import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchCard, Player } from "@/lib/game/types";
import { DieFaceToken } from "./die-face";

export function RoundCard({
  card,
  player,
  compact = false,
}: {
  card: MatchCard;
  player?: Player;
  compact?: boolean;
}) {
  const marked = player?.marked ?? [];
  const nextOpen = marked.findIndex((slot) => !slot);
  const isSequence = card.type === "sequence";

  return (
    <article
      className={cn(
        "paper-card relative overflow-hidden rounded-xl",
        compact ? "px-3 py-3" : "px-5 py-5 sm:px-6 sm:py-6",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-subtle uppercase">
          {isSequence ? "In sequence" : "Any order"}
        </p>
        <p className="text-[11px] font-medium tracking-wide text-subtle tabular-nums">
          {card.pairs.length} pairs
        </p>
      </div>
      <div className={cn("flex items-center", compact ? "gap-1.5" : "gap-2 sm:gap-3")}>
        {card.pairs.map((face, i) => (
          <div key={`${card.id}-${i}`} className="flex items-center gap-1.5 sm:gap-2">
            {i > 0 && isSequence ? (
              <ArrowRight
                className={cn("text-subtle", compact ? "size-3" : "size-4")}
                strokeWidth={1.75}
              />
            ) : null}
            <DieFaceToken
              value={face}
              size={compact ? "sm" : "lg"}
              marked={Boolean(marked[i])}
              next={isSequence && nextOpen === i}
              dimmed={isSequence && nextOpen !== -1 && i > nextOpen && !marked[i]}
            />
          </div>
        ))}
      </div>
      {isSequence && !compact ? (
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Collect left to right. Later pairs wait until the next one lands.
        </p>
      ) : null}
    </article>
  );
}
