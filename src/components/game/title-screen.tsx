import { BookOpen, Dices, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unlockAudio, playTap } from "@/lib/game/audio";
import { useGame } from "@/lib/game/store";
import { Die3D } from "./die-3d";
import { DieFaceToken } from "./die-face";

export function TitleScreen() {
  const quickPlay = useGame((s) => s.quickPlay);
  const openSetup = useGame((s) => s.openSetup);
  const openHowTo = useGame((s) => s.openHowTo);
  const soundEnabled = useGame((s) => s.soundEnabled);

  const go = (fn: () => void) => {
    unlockAudio();
    if (soundEnabled) playTap();
    fn();
  };

  return (
    <div className="felt-ground relative flex min-h-dvh flex-col px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="stagger-in flex flex-col items-center text-center">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-sage uppercase">
            A fast race
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.03em] text-fg sm:text-6xl">
            Match Up
          </h1>
          <p className="mt-1 font-display text-2xl italic font-medium text-sage">Dice</p>
          <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-muted">
            Roll pairs that match the card. Mark your sheet. First to finish it takes the point.
          </p>
        </div>

        <div className="mt-8 flex items-end justify-center gap-3">
          <Die3D value={2} rolling={false} highlight={false} nonce={0} />
          <Die3D value={5} rolling={false} highlight={false} nonce={0} />
          <Die3D value={2} rolling={false} highlight={false} nonce={0} />
        </div>

        <div className="paper-card mx-auto mt-8 w-full max-w-xs rounded-xl px-4 py-3">
          <p className="mb-2 text-center text-[10px] font-semibold tracking-[0.18em] text-subtle uppercase">
            Sample card
          </p>
          <div className="flex items-center justify-center gap-2">
            <DieFaceToken value={2} />
            <DieFaceToken value={5} />
            <DieFaceToken value={3} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => go(quickPlay)}>
            <Dices />
            Play
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => go(openSetup)}>
            <Users />
            Set up table
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => go(openHowTo)}>
            <BookOpen />
            How to play
          </Button>
        </div>
      </div>
    </div>
  );
}
