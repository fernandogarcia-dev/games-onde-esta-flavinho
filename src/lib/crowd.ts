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

export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
  ground: GroundBand,
): CrowdItem[] {
  const rand = mulberry32(hashSeed(seed));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? 4;
  const xMax = ground.xMax ?? 96;
  const ySpan = Math.max(8, ground.yMax - ground.yMin);
  const flavinhoIndex = Math.floor(rand() * crowdCount);

  for (let i = 0; i < crowdCount; i++) {
    const depth = rand(); // 0 = farther, 1 = closer
    const x = xMin + rand() * (xMax - xMin);
    const y = ground.yMin + depth * ySpan;
    const isFlavinho = i === flavinhoIndex;
    const base = 0.045 + depth * 0.055;
    const scale = isFlavinho
      ? Math.min(flavinhoScale, base + 0.008)
      : base + rand() * 0.01;

    items.push({
      id: `${seed}-p-${i}`,
      kind: isFlavinho ? "flavinho" : "decoy",
      src: isFlavinho
        ? FLAVINHO_SRC
        : DECOY_SRCS[Math.floor(rand() * DECOY_SRCS.length)],
      x,
      y,
      scale,
      facing: rand() > 0.45 ? 1 : -1,
      z: y,
    });
  }

  const propCount = Math.max(5, Math.floor(crowdCount / 7));
  for (let i = 0; i < propCount; i++) {
    const depth = rand();
    const y = ground.yMin + depth * ySpan;
    items.push({
      id: `${seed}-prop-${i}`,
      kind: "prop",
      src: PROP_SRCS[Math.floor(rand() * PROP_SRCS.length)],
      x: xMin + rand() * (xMax - xMin),
      y,
      scale: 0.04 + depth * 0.05,
      facing: 1,
      z: y - 0.01,
    });
  }

  return items.sort((a, b) => a.z - b.z);
}
