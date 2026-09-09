import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/game/store";
import { RoundCard } from "./round-card";

function Burst() {
  const dots = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 48 + (i % 3) * 22;
    return {
      i,
      dx: `${Math.cos(angle) * dist}px`,
      dy: `${Math.sin(angle) * dist}px`,
    };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.i}
          className="burst-dot"
          style={
            {
              "--dx": d.dx,
              "--dy": d.dy,
              animationDelay: `${d.i * 12}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function RoundOverOverlay() {
  const players = useGame((s) => s.players);
  const roundWinnerId = useGame((s) => s.roundWinnerId);
  const lastPerfect = useGame((s) => s.lastPerfect);
  const continueAfterRound = useGame((s) => s.continueAfterRound);
  const winner = players.find((p) => p.id === roundWinnerId);
  const lastCard = winner?.won[winner.won.length - 1]?.card;

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-5">
      <div className="absolute inset-0 bg-ink/55" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="round-title"
        className="relative w-full max-w-sm overflow-hidden rounded-xl bg-paper px-5 py-6 text-ink shadow-[var(--shadow-lift)]"
      >
        {lastPerfect ? <Burst /> : null}
        <p className="text-[11px] font-semibold tracking-[0.2em] text-subtle uppercase">
          {lastPerfect ? "Perfect roll" : "Round won"}
        </p>
        <h2 id="round-title" className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {winner.name} takes the card
        </h2>
        <p className="mt-1 text-sm text-ink/70">
          {winner.won.length} {winner.won.length === 1 ? "card" : "cards"} so far.
        </p>
        {lastCard ? (
          <div className="mt-4">
            <RoundCard card={lastCard} player={{ ...winner, marked: lastCard.pairs.map(() => true) }} compact />
          </div>
        ) : null}
        <Button className="mt-5 w-full bg-ink text-paper hover:bg-felt-deep" onClick={continueAfterRound}>
          Flip the next card
        </Button>
      </section>
    </div>
  );
}

export function GameOverOverlay() {
  const players = useGame((s) => s.players);
  const championId = useGame((s) => s.championId);
  const playAgain = useGame((s) => s.playAgain);
  const backToTitle = useGame((s) => s.backToTitle);
  const champion = players.find((p) => p.id === championId);
  if (!champion) return null;

  const ranked = [...players].sort((a, b) => b.won.length - a.won.length);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-5">
      <div className="absolute inset-0 bg-ink/60" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="champ-title"
        className="relative w-full max-w-sm overflow-hidden rounded-xl bg-paper px-5 py-6 text-ink shadow-[var(--shadow-lift)]"
      >
        <Burst />
        <p className="text-[11px] font-semibold tracking-[0.2em] text-subtle uppercase">Table closed</p>
        <h2 id="champ-title" className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {champion.name} wins
        </h2>
        <p className="mt-1 text-sm text-ink/70">First to collect the race.</p>
        <ul className="mt-4 space-y-2">
          {ranked.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-md bg-ink/5 px-3 py-2 text-sm">
              <span className="font-medium">{p.name}</span>
              <span className="tabular-nums text-ink/70">
                {p.won.length}
                {p.won.some((w) => w.perfect) ? " · W" : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2">
          <Button className="w-full bg-ink text-paper hover:bg-felt-deep" onClick={playAgain}>
            Play again
          </Button>
          <Button variant="ghost" className="w-full text-ink hover:bg-ink/10" onClick={backToTitle}>
            Back to title
          </Button>
        </div>
      </section>
    </div>
  );
}
