import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/game/store";

export function HowToPlay() {
  const close = useGame((s) => s.closeHowTo);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-ink/55"
        aria-label="Close rules"
        onClick={close}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="relative z-10 flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl sm:rounded-xl bg-paper text-ink shadow-[var(--shadow-lift)]"
      >
        <header className="flex items-center justify-between gap-3 px-5 py-4">
          <h2 id="rules-title" className="font-display text-xl font-semibold tracking-tight">
            How to play
          </h2>
          <Button variant="ghost" size="icon" className="text-ink hover:bg-ink/10" onClick={close}>
            <X />
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-6 text-sm leading-relaxed text-ink/80">
          <p>
            A fast race. Everyone chases the same matchup. Roll pairs that match the card, mark them
            on your sheet, and be first to finish it.
          </p>
          <div>
            <h3 className="mb-1.5 font-semibold text-ink">On your turn</h3>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Roll all six dice.</li>
              <li>Look for pairs of numbers that appear on the round card.</li>
              <li>Matching pairs are marked on your sheet for this round.</li>
              <li>Your turn ends. Play passes left.</li>
            </ol>
          </div>
          <div>
            <h3 className="mb-1.5 font-semibold text-ink">Two kinds of cards</h3>
            <p>
              <span className="font-medium text-ink">Any order</span> — collect the pairs in any
              order.
            </p>
            <p>
              <span className="font-medium text-ink">In sequence</span> — collect them left to right,
              exactly as shown.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-semibold text-ink">Winning a round</h3>
            <p>
              First player to mark every pair on the round card takes it as a victory point. A new
              card flips. The player to their left starts the next round.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-semibold text-ink">Perfect roll</h3>
            <p>
              Finish the entire card on a single roll and you still win the round — plus a Perfect
              Roll mark on that card.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-semibold text-ink">Winning the table</h3>
            <p>First player to collect the race target of round cards wins.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
