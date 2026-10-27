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

/** The real (undisguised) Flavinho — what the player must click. */
export const FLAVINHO_SRC = "/game/disguises/real-suit.png";

/** Same face, many disguises — distractors in the crowd. */
export const DISGUISE_SRCS = [
  "/game/disguises/hoodie.png",
  "/game/disguises/trucker.png",
  "/game/disguises/glasses.png",
  "/game/disguises/beanie.png",
  "/game/disguises/scarf.png",
  "/game/disguises/hippie.png",
  "/game/disguises/ears.png",
  "/game/disguises/sideburns.png",
  "/game/disguises/blonde.png",
  "/game/disguises/flute.png",
  "/game/disguises/biker.png",
  "/game/disguises/plumber.png",
  "/game/disguises/bald-green.png",
  "/game/disguises/rasta.png",
] as const;

export const PROP_SRCS = [
  "/game/props/prop-umbrella.png",
  "/game/props/prop-cart.png",
  "/game/props/suitcase.png",
  "/game/props/sign.png",
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

/** Scatter mugshot cards on a flat board (Herald-style disguises). */
export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
  ground: GroundBand,
): CrowdItem[] {
  const rand = mulberry32(hashSeed(seed + ":disguises"));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? 6;
  const xMax = ground.xMax ?? 94;
  const yMin = ground.yMin ?? 10;
  const yMax = ground.yMax ?? 90;
  const flavinhoIndex = Math.floor(rand() * crowdCount);

  const cols = Math.ceil(Math.sqrt(crowdCount * 1.2));
  const rows = Math.ceil(crowdCount / cols);

  for (let i = 0; i < crowdCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = (xMax - xMin) / cols;
    const cellH = (yMax - yMin) / Math.max(rows, 1);
    const x = xMin + col * cellW + cellW * (0.18 + rand() * 0.64);
    const y = yMin + row * cellH + cellH * (0.18 + rand() * 0.64);
    const isFlavinho = i === flavinhoIndex;
    const scale = flavinhoScale * (0.92 + rand() * 0.16);

    items.push({
      id: `${seed}-p-${i}`,
      kind: isFlavinho ? "flavinho" : "decoy",
      src: isFlavinho
        ? FLAVINHO_SRC
        : DISGUISE_SRCS[Math.floor(rand() * DISGUISE_SRCS.length)],
      x,
      y,
      scale,
      facing: 1, // mugshots stay upright
      z: y + rand() * 0.01,
    });
  }

  // A few props only — disguises are the main confusion
  const propCount = Math.max(3, Math.floor(crowdCount / 14));
  for (let i = 0; i < propCount; i++) {
    items.push({
      id: `${seed}-prop-${i}`,
      kind: "prop",
      src: PROP_SRCS[Math.floor(rand() * PROP_SRCS.length)],
      x: xMin + rand() * (xMax - xMin),
      y: yMin + rand() * (yMax - yMin),
      scale: flavinhoScale * (0.55 + rand() * 0.25),
      facing: 1,
      z: 0,
    });
  }

  return items.sort((a, b) => a.z - b.z);
}
