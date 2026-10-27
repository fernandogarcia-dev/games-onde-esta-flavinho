export type CrowdItem = {
  id: string;
  kind: "flavinho" | "decoy" | "prop";
  src: string;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  z: number;
  /** Optional CSS filter — used for near-clone decoys on harder looks. */
  filter?: string;
};

export type GroundBand = {
  yMin: number;
  yMax: number;
  xMin?: number;
  xMax?: number;
};

export type LookTier = "easy" | "medium" | "hard";

/** Undisguised Flavinho — the click target. */
export const FLAVINHO_SRC = "/game/disguises/real.png";

/** Wild costumes — easy to rule out at a glance. */
export const DISGUISE_WILD = [
  "/game/disguises/hippie.png",
  "/game/disguises/sideburns.png",
  "/game/disguises/flute.png",
  "/game/disguises/biker.png",
  "/game/disguises/rasta.png",
  "/game/disguises/chef.png",
  "/game/disguises/fan.png",
  "/game/disguises/doctor.png",
  "/game/disguises/worker.png",
  "/game/disguises/bald.png",
] as const;

/** Mid distance — still different, but same body language. */
export const DISGUISE_MID = [
  "/game/disguises/hoodie.png",
  "/game/disguises/blonde.png",
  "/game/disguises/gag.png",
  "/game/disguises/scarf.png",
  "/game/disguises/beanie.png",
] as const;

/**
 * Subtle — keep the navy blazer / same silhouette.
 * glasses is nearly identical to real (only adds frames).
 */
export const DISGUISE_SUBTLE = [
  "/game/disguises/glasses.png",
  "/game/disguises/glasses.png",
  "/game/disguises/trucker.png",
  "/game/disguises/beanie.png",
  "/game/disguises/scarf.png",
  "/game/disguises/blonde.png",
  "/game/disguises/gag.png",
  "/game/disguises/hoodie.png",
] as const;

/** Soft CSS tweaks so a real.png decoy isn't pixel-identical, just almost. */
const NEAR_CLONE_FILTERS = [
  "brightness(1.05) contrast(0.97)",
  "brightness(0.95) saturate(1.06)",
  "contrast(1.04) saturate(0.94)",
  "hue-rotate(6deg) brightness(1.02)",
  "hue-rotate(-8deg) saturate(1.04)",
  "brightness(1.03) contrast(1.03) saturate(0.9)",
] as const;

export const DISGUISE_SRCS = [
  ...DISGUISE_WILD,
  ...DISGUISE_MID,
  "/game/disguises/glasses.png",
  "/game/disguises/trucker.png",
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

function pickFrom<T>(pool: readonly T[], rand: () => number): T {
  return pool[Math.floor(rand() * pool.length)];
}

function disguisePoolFor(tier: LookTier): readonly string[] {
  if (tier === "hard") {
    return [
      ...DISGUISE_SUBTLE,
      ...DISGUISE_SUBTLE,
      ...DISGUISE_MID.slice(0, 2),
    ];
  }
  if (tier === "medium") {
    return [
      ...DISGUISE_SUBTLE,
      ...DISGUISE_MID,
      ...DISGUISE_MID,
      ...DISGUISE_WILD.slice(0, 3),
    ];
  }
  return [...DISGUISE_WILD, ...DISGUISE_WILD, ...DISGUISE_MID];
}

function decoyLook(
  tier: LookTier,
  rand: () => number,
): { src: string; filter?: string } {
  if (tier === "hard" && rand() < 0.45) {
    return {
      src: FLAVINHO_SRC,
      filter: pickFrom(NEAR_CLONE_FILTERS, rand),
    };
  }
  if (tier === "medium" && rand() < 0.16) {
    return {
      src: FLAVINHO_SRC,
      filter: pickFrom(NEAR_CLONE_FILTERS, rand),
    };
  }
  return { src: pickFrom(disguisePoolFor(tier), rand) };
}

/** How packed the board gets — Waldo energy. */
export function densityFor(tier: LookTier): {
  overlap: number;
  rows: number;
  depthMin: number;
  depthMax: number;
  baseMin: number;
} {
  if (tier === "hard") {
    return { overlap: 0.32, rows: 9, depthMin: 0.52, depthMax: 1.05, baseMin: 3.4 };
  }
  if (tier === "medium") {
    return { overlap: 0.5, rows: 7, depthMin: 0.58, depthMax: 1.1, baseMin: 4.2 };
  }
  return { overlap: 0.72, rows: 5, depthMin: 0.68, depthMax: 1.18, baseMin: 5.2 };
}

/** Percent size used by CrowdScene (must stay in sync). */
export function spriteBox(
  scale: number,
  kind: CrowdItem["kind"],
  mobileBoost = 1,
  baseMinOverride?: number,
) {
  const baseMin =
    kind === "prop"
      ? Math.min(3.2, (baseMinOverride ?? 5.8) * 0.55)
      : (baseMinOverride ?? 5.8);
  const widthPct = Math.max(scale * 100 * mobileBoost, baseMin * mobileBoost);
  const heightPct = widthPct * (kind === "prop" ? 1.05 : 1.55);
  return { widthPct, heightPct };
}

/** Keep the full sprite inside the board (centered with translate -50/-50). */
export function clampInside(
  x: number,
  y: number,
  widthPct: number,
  heightPct: number,
  pad = 0.4,
) {
  const halfW = widthPct / 2;
  const halfH = heightPct / 2;
  return {
    x: Math.min(100 - halfW - pad, Math.max(halfW + pad, x)),
    y: Math.min(100 - halfH - pad, Math.max(halfH + pad, y)),
  };
}

function tooClose(
  x: number,
  y: number,
  placed: { x: number; y: number; r: number }[],
  minDist: number,
) {
  for (const p of placed) {
    const dx = p.x - x;
    // Vertical stacking is desired in Waldo scenes — weight it less.
    const dy = (p.y - y) * 0.7;
    if (dx * dx + dy * dy < minDist * minDist) return true;
  }
  return false;
}

export function lookTip(tier: LookTier): string {
  if (tier === "hard") {
    return "Multidão lotada. Ache o SEM acessório.";
  }
  if (tier === "medium") {
    return "Tá cheio. Olho no SEM disfarce.";
  }
  return "Ache o SEM disfarce. O resto é camuflagem.";
}

/**
 * Waldo-style scatter: perspective rows, intentional overlap,
 * denser and smaller as difficulty rises.
 */
export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
  ground: GroundBand,
  opts?: { mobileBoost?: number; lookTier?: LookTier },
): CrowdItem[] {
  const mobileBoost = opts?.mobileBoost ?? 1;
  const lookTier = opts?.lookTier ?? "medium";
  const dens = densityFor(lookTier);
  const rand = mulberry32(hashSeed(`${seed}:crowd-v6-waldo:${lookTier}`));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? 4;
  const xMax = ground.xMax ?? 96;
  const yMin = ground.yMin ?? 10;
  const yMax = ground.yMax ?? 92;
  const flavinhoIndex = Math.floor(rand() * crowdCount);
  const placed: { x: number; y: number; r: number }[] = [];
  const rows = dens.rows;

  for (let i = 0; i < crowdCount; i++) {
    const isFlavinho = i === flavinhoIndex;
    // Bias Flavinho toward mid/front rows so he's findable but not giant in front.
    const row = isFlavinho
      ? Math.min(rows - 1, Math.floor(rows * (0.35 + rand() * 0.5)))
      : Math.floor(rand() * rows);
    const depthT = rows <= 1 ? 1 : row / (rows - 1);
    const depthScale =
      dens.depthMin + (dens.depthMax - dens.depthMin) * depthT;
    const twinJitter =
      lookTier === "hard"
        ? isFlavinho
          ? 1 + rand() * 0.02
          : 0.97 + rand() * 0.06
        : lookTier === "medium"
          ? isFlavinho
            ? 1.01 + rand() * 0.05
            : 0.9 + rand() * 0.16
          : isFlavinho
            ? 1.04 + rand() * 0.08
            : 0.82 + rand() * 0.28;
    const scale = flavinhoScale * depthScale * twinJitter;
    const kind: CrowdItem["kind"] = isFlavinho ? "flavinho" : "decoy";
    const { widthPct, heightPct } = spriteBox(
      scale,
      kind,
      mobileBoost,
      dens.baseMin,
    );
    const radius = Math.max(widthPct, heightPct) * 0.34;
    const minDist = Math.max(widthPct * dens.overlap, 2.2);

    const rowY =
      yMin + ((row + 0.45 + (rand() - 0.5) * 0.35) / rows) * (yMax - yMin);

    let x = 50;
    let y = rowY;
    let ok = false;
    for (let attempt = 0; attempt < 70; attempt++) {
      const slot = (i + attempt * 3) % Math.max(8, Math.ceil(crowdCount / rows));
      const slots = Math.max(8, Math.ceil(crowdCount / rows));
      const rawX =
        xMin +
        ((slot + 0.2 + rand() * 0.6) / slots) * (xMax - xMin) +
        (rand() - 0.5) * (lookTier === "hard" ? 10 : 6);
      const rawY = rowY + (rand() - 0.5) * (lookTier === "hard" ? 7 : 5);
      const c = clampInside(rawX, rawY, widthPct, heightPct);
      x = c.x;
      y = c.y;
      const relax = attempt > 40 ? 0.7 : 1;
      if (!tooClose(x, y, placed, minDist * relax)) {
        ok = true;
        break;
      }
    }
    if (!ok) {
      const c = clampInside(
        xMin + rand() * (xMax - xMin),
        rowY + (rand() - 0.5) * 4,
        widthPct,
        heightPct,
      );
      x = c.x;
      y = c.y;
    }
    placed.push({ x, y, r: radius });

    const look = isFlavinho
      ? { src: FLAVINHO_SRC as string, filter: undefined as string | undefined }
      : decoyLook(lookTier, rand);

    const facing: 1 | -1 =
      lookTier === "hard"
        ? rand() > 0.38
          ? 1
          : -1
        : rand() > 0.5
          ? 1
          : -1;

    items.push({
      id: `${seed}-p-${i}`,
      kind,
      src: look.src,
      x,
      y,
      scale,
      facing,
      z: y + rand() * 0.02,
      filter: look.filter,
    });
  }

  const propFactor = lookTier === "hard" ? 10 : lookTier === "medium" ? 12 : 14;
  const propCount = Math.max(3, Math.floor(crowdCount / propFactor));
  for (let i = 0; i < propCount; i++) {
    const row = Math.floor(rand() * rows);
    const depthT = rows <= 1 ? 1 : row / (rows - 1);
    const depthScale =
      dens.depthMin + (dens.depthMax - dens.depthMin) * depthT;
    const scale = flavinhoScale * depthScale * (0.45 + rand() * 0.35);
    const { widthPct, heightPct } = spriteBox(
      scale,
      "prop",
      mobileBoost,
      dens.baseMin,
    );
    const rowY =
      yMin + ((row + 0.5 + (rand() - 0.5) * 0.3) / rows) * (yMax - yMin);
    const c = clampInside(
      xMin + rand() * (xMax - xMin),
      rowY,
      widthPct,
      heightPct,
    );
    items.push({
      id: `${seed}-prop-${i}`,
      kind: "prop",
      src: PROP_SRCS[Math.floor(rand() * PROP_SRCS.length)],
      x: c.x,
      y: c.y,
      scale,
      facing: 1,
      z: c.y * 0.45,
    });
  }

  return items.sort((a, b) => a.z - b.z);
}
