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

/** Pack characters so they feel like a crowd without stacking on the exact same spot. */
export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
): CrowdItem[] {
  const rand = mulberry32(hashSeed(seed));
  const items: CrowdItem[] = [];

  const flavinhoIndex = Math.floor(rand() * crowdCount);

  // Prefer mid/back rows so the target is not a giant sticker in the front.
  for (let i = 0; i < crowdCount; i++) {
    const depth = 0.12 + rand() * 0.78;
    const x = 4 + rand() * 92;
    const y = 32 + depth * 60;
    const isFlavinho = i === flavinhoIndex;
    const base = 0.038 + depth * 0.095;
    const scale = isFlavinho
      ? Math.min(flavinhoScale, base + 0.01)
      : base + rand() * 0.012;

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

  // Props sprinkled to break silhouette scanning
  const propCount = Math.max(6, Math.floor(crowdCount / 5));
  for (let i = 0; i < propCount; i++) {
    const depth = 0.2 + rand() * 0.7;
    items.push({
      id: `${seed}-prop-${i}`,
      kind: "prop",
      src: PROP_SRCS[Math.floor(rand() * PROP_SRCS.length)],
      x: 5 + rand() * 90,
      y: 38 + depth * 55,
      scale: 0.05 + depth * 0.07 + rand() * 0.03,
      facing: 1,
      z: 38 + depth * 55,
    });
  }

  return items.sort((a, b) => a.z - b.z);
}
