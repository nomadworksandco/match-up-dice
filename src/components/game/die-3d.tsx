import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/game/engine";
import type { DieFace } from "@/lib/game/types";
import { PipGrid } from "./die-face";

const FACE_ROT: Record<DieFace, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

const FACE_TRANSFORM: Record<string, string> = {
  1: "rotateY(0deg) translateZ(calc(var(--die-size) / 2))",
  6: "rotateY(180deg) translateZ(calc(var(--die-size) / 2))",
  2: "rotateY(90deg) translateZ(calc(var(--die-size) / 2))",
  5: "rotateY(-90deg) translateZ(calc(var(--die-size) / 2))",
  3: "rotateX(90deg) translateZ(calc(var(--die-size) / 2))",
  4: "rotateX(-90deg) translateZ(calc(var(--die-size) / 2))",
};

export function Die3D({
  value,
  rolling,
  highlight,
  nonce,
  delayMs = 0,
}: {
  value: DieFace;
  rolling: boolean;
  highlight: boolean;
  nonce: number;
  delayMs?: number;
}) {
  const [spins, setSpins] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (nonce === 0) return;
    const extraX = 360 * (2 + Math.floor(Math.random() * 3));
    const extraY = 360 * (2 + Math.floor(Math.random() * 3));
    setSpins((prev) => ({ x: prev.x + extraX, y: prev.y + extraY }));
  }, [nonce]);

  const reduce = prefersReducedMotion();
  const face = FACE_ROT[value];
  const transform = `rotateX(${spins.x + face.x}deg) rotateY(${spins.y + face.y}deg)`;

  const faces = useMemo(() => [1, 2, 3, 4, 5, 6] as DieFace[], []);

  return (
    <div
      className={cn("die-scene", highlight && !rolling && "die-highlight")}
      style={{ transitionDelay: `${delayMs}ms` }}
      aria-label={`Die showing ${value}`}
    >
      <div
        className={cn("die-cube", rolling && !reduce && "animate-pulse")}
        style={{
          transform,
          transitionDelay: `${delayMs}ms`,
        }}
      >
        {faces.map((faceValue) => (
          <div
            key={faceValue}
            className="die-face"
            style={{ transform: FACE_TRANSFORM[String(faceValue)] }}
          >
            <div className="die-face-inner">
              <PipGrid value={faceValue} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
