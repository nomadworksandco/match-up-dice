import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DieFace } from "@/lib/game/types";

const PIPS: Record<DieFace, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function PipGrid({ value, className }: { value: DieFace; className?: string }) {
  const active = new Set(PIPS[value]);
  return (
    <div className={cn("grid h-full w-full grid-cols-3 grid-rows-3 place-items-center", className)}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={cn("pip", !active.has(i) && "opacity-0")} />
      ))}
    </div>
  );
}

export function DieFaceToken({
  value,
  marked,
  next,
  dimmed,
  size = "md",
}: {
  value: DieFace;
  marked?: boolean;
  next?: boolean;
  dimmed?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-md bg-bone text-pip shadow-[0_0_0_1px_rgb(20_23_20/0.1)]",
        size === "sm" && "size-8",
        size === "md" && "size-11",
        size === "lg" && "size-14",
        next && "ring-2 ring-sage-deep ring-offset-2 ring-offset-paper",
        dimmed && "opacity-45",
      )}
      aria-label={marked ? `Pair of ${value}s, marked` : `Pair of ${value}s`}
    >
      <div className={cn(size === "sm" ? "size-6" : size === "lg" ? "size-11" : "size-8")}>
        <PipGrid value={value} />
      </div>
      {marked ? (
        <span className="absolute inset-0 grid place-items-center rounded-md bg-ink/45 text-paper">
          <Check className={cn(size === "sm" ? "size-3.5" : "size-5")} strokeWidth={2.5} />
        </span>
      ) : null}
    </div>
  );
}
