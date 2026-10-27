export type CrowdItem = {
  id: string;
  kind: "flavinho" | "decoy" | "prop";
  src: string;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  z: number;
};

export type GroundBand = {
  yMin: number;
  yMax: number;
  xMin?: number;
  xMax?: number;
};

export const FLAVINHO_SRC = "/game/chars/chr-flavinho.png";

export const DECOY_SRCS = [
  "/game/chars/chr-decoy-01.png",
  "/game/chars/chr-decoy-02.png",
  "/game/chars/chr-decoy-03.png",
  "/game/chars/chr-decoy-04.png",
  "/game/chars/chr-decoy-05.png",
  "/game/chars/chr-decoy-06.png",
  "/game/chars/chr-decoy-07.png",
  "/game/chars/chr-decoy-08.png",
  "/game/chars/chr-decoy-09.png",
  "/game/chars/chr-decoy-10.png",
  "/game/chars/chr-decoy-11.png",
  "/game/chars/chr-decoy-12.png",
] as const;

export const PROP_SRCS = [
  "/game/props/prop-umbrella.png",
  "/game/props/prop-cart.png",
  "/game/props/prop-street.png",
  "/game/props/umbrella.png",
  "/game/props/icecream.png",
  "/game/props/lamp.png",
  "/game/props/sign.png",
  "/game/props/suitcase.png",
] as const;

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Flat board placement: nearly uniform scale so nobody "flies". */
export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
  ground: GroundBand,
): CrowdItem[] {
  const rand = mulberry32(hashSeed(seed + ":flat"));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? 6;
  const xMax = ground.xMax ?? 94;
  const yMin = ground.yMin ?? 10;
  const yMax = ground.yMax ?? 90;
  const flavinhoIndex = Math.floor(rand() * crowdCount);

  // Soft grid jitter so the crowd fills the flat board without stacking.
  const cols = Math.ceil(Math.sqrt(crowdCount * 1.35));
  const rows = Math.ceil(crowdCount / cols);

  for (let i = 0; i < crowdCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = (xMax - xMin) / cols;
    const cellH = (yMax - yMin) / Math.max(rows, 1);
    const x = xMin + col * cellW + cellW * (0.2 + rand() * 0.6);
    const y = yMin + row * cellH + cellH * (0.2 + rand() * 0.6);
    const isFlavinho = i === flavinhoIndex;
    const scale = isFlavinho
      ? flavinhoScale
      : flavinhoScale * (0.88 + rand() * 0.18);

    items.push({
      id: `${seed}-p-${i}`,
      kind: isFlavinho ? "flavinho" : "decoy",
      src: isFlavinho
        ? FLAVINHO_SRC
        : DECOY_SRCS[Math.floor(rand() * DECOY_SRCS.length)],
      x,
      y,
      scale,
      facing: rand() > 0.5 ? 1 : -1,
      z: y + rand() * 0.01,
    });
  }

  const propCount = Math.max(6, Math.floor(crowdCount / 8));
  for (let i = 0; i < propCount; i++) {
    items.push({
      id: `${seed}-prop-${i}`,
      kind: "prop",
      src: PROP_SRCS[Math.floor(rand() * PROP_SRCS.length)],
      x: xMin + rand() * (xMax - xMin),
      y: yMin + rand() * (yMax - yMin),
      scale: flavinhoScale * (0.7 + rand() * 0.35),
      facing: 1,
      z: 0,
    });
  }

  return items.sort((a, b) => a.z - b.z);
}
