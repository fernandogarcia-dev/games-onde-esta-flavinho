/**
 * Sea-of-Flavinhos finder: no city plate, no props — only disguise sprites
 * packed across the whole board. Difficulty = smaller + denser.
 */

export type CrowdItem = {
  id: string;
  kind: "flavinho" | "decoy";
  src: string;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  z: number;
  filter?: string;
};

export type GroundBand = {
  yMin: number;
  yMax: number;
  xMin?: number;
  xMax?: number;
};

export type LookTier = "easy" | "medium" | "hard";

/** Undisguised Flavinho — the only click target. */
export const FLAVINHO_SRC = "/game/disguises/real.png";

/** Every disguise sprite we shipped — always in play, every difficulty. */
export const ALL_DISGUISES = [
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
  "/game/disguises/hoodie.png",
  "/game/disguises/blonde.png",
  "/game/disguises/gag.png",
  "/game/disguises/scarf.png",
  "/game/disguises/beanie.png",
  "/game/disguises/glasses.png",
  "/game/disguises/trucker.png",
] as const;

/** @deprecated alias — kept for any leftover imports */
export const DISGUISE_SRCS = ALL_DISGUISES;
export const DISGUISE_WILD = ALL_DISGUISES;
export const DISGUISE_MID = ALL_DISGUISES;
export const DISGUISE_SUBTLE = ALL_DISGUISES;
export const PROP_SRCS = [] as const;

/** Full-bleed board — sprites can sit anywhere. */
export const BOARD_GROUND: GroundBand = {
  yMin: 10,
  yMax: 97,
  xMin: 3,
  xMax: 97,
};

export const PERSPECTIVE_GROUND = BOARD_GROUND;

export type CrowdParams = {
  count: number;
  /** Base width as fraction of board (before mild jitter). */
  scale: number;
  maxWidthPct: number;
  minWidthPct: number;
  rows: number;
  /** Feet clearance as fraction of sprite width (lower = denser). */
  overlap: number;
};

/** Harder = smaller + more populous. */
export function crowdParamsFor(tier: LookTier): CrowdParams {
  if (tier === "hard") {
    return {
      count: 128,
      scale: 0.048,
      maxWidthPct: 5.4,
      minWidthPct: 3.2,
      rows: 10,
      overlap: 0.52,
    };
  }
  if (tier === "medium") {
    return {
      count: 64,
      scale: 0.082,
      maxWidthPct: 8.6,
      minWidthPct: 5.2,
      rows: 6,
      overlap: 0.68,
    };
  }
  return {
    count: 28,
    scale: 0.135,
    maxWidthPct: 14,
    minWidthPct: 9,
    rows: 4,
    overlap: 0.88,
  };
}

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

export function densityFor(tier: LookTier): { overlap: number; rows: number } {
  const p = crowdParamsFor(tier);
  return { overlap: p.overlap, rows: p.rows };
}

/**
 * Percent box from scale. Ceiling/floor come from the active difficulty.
 */
export function spriteBox(
  scale: number,
  _kind: CrowdItem["kind"] = "decoy",
  mobileBoost = 1,
  maxWidthPct = 9.5,
  minWidthPct = 0.95,
) {
  const raw = Math.max(scale * 100 * mobileBoost, minWidthPct * mobileBoost);
  const widthPct = Math.min(raw, maxWidthPct);
  const heightPct = widthPct * 1.55;
  return { widthPct, heightPct };
}

export function clampInside(
  x: number,
  y: number,
  widthPct: number,
  heightPct: number,
  ground?: GroundBand,
  pad = 0.25,
) {
  const halfW = widthPct / 2;
  const yMin = ground?.yMin ?? BOARD_GROUND.yMin;
  const yMax = ground?.yMax ?? BOARD_GROUND.yMax;
  const minFeet = Math.max(yMin, heightPct * 0.1 + pad);
  return {
    x: Math.min(100 - halfW - pad, Math.max(halfW + pad, x)),
    y: Math.min(yMax, Math.max(minFeet, y)),
  };
}

function tooClose(
  x: number,
  y: number,
  placed: { x: number; y: number }[],
  minDist: number,
) {
  for (const p of placed) {
    const dx = p.x - x;
    const dy = (p.y - y) * 1.05;
    if (dx * dx + dy * dy < minDist * minDist) return true;
  }
  return false;
}

export function lookTip(tier: LookTier): string {
  if (tier === "hard") {
    return "Mar de Flavinhos. Ache o pequenininho SEM disfarce.";
  }
  if (tier === "medium") {
    return "Tá lotado. Olho no SEM disfarce.";
  }
  return "Ache o SEM disfarce. O resto é camuflagem.";
}

/**
 * Pack Flavinhos across the whole board. One real.png target; every other
 * sprite is a disguise from ALL_DISGUISES (always the full wardrobe).
 */
export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
  ground: GroundBand = BOARD_GROUND,
  opts?: {
    mobileBoost?: number;
    lookTier?: LookTier;
    maxWidthPct?: number;
    minWidthPct?: number;
  },
): CrowdItem[] {
  const mobileBoost = opts?.mobileBoost ?? 1;
  const lookTier = opts?.lookTier ?? "medium";
  const params = crowdParamsFor(lookTier);
  const maxWidthPct = opts?.maxWidthPct ?? params.maxWidthPct;
  const minWidthPct = opts?.minWidthPct ?? params.minWidthPct;
  const dens = { overlap: params.overlap, rows: params.rows };
  const rand = mulberry32(hashSeed(`${seed}:sea-v1:${lookTier}`));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? BOARD_GROUND.xMin!;
  const xMax = ground.xMax ?? BOARD_GROUND.xMax!;
  const yMin = ground.yMin ?? BOARD_GROUND.yMin;
  const yMax = ground.yMax ?? BOARD_GROUND.yMax;

  const count = Math.max(1, crowdCount);
  const flavinhoIndex = Math.floor(rand() * count);
  const placed: { x: number; y: number }[] = [];
  const rows = dens.rows;

  // Shuffle a cycling wardrobe so every disguise shows up evenly.
  const wardrobe = [...ALL_DISGUISES];
  for (let i = wardrobe.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [wardrobe[i], wardrobe[j]] = [wardrobe[j], wardrobe[i]];
  }
  let wardrobeCursor = 0;

  for (let i = 0; i < count; i++) {
    const isFlavinho = i === flavinhoIndex;
    const row = isFlavinho
      ? Math.min(rows - 1, Math.floor(rows * (0.25 + rand() * 0.55)))
      : i % rows;

    // Mild depth cue + tiny jitter — size mostly comes from difficulty scale.
    const depthCue = 0.88 + (row / Math.max(1, rows - 1)) * 0.14;
    const jitter = isFlavinho ? 1 : 0.94 + rand() * 0.1;
    const kind: CrowdItem["kind"] = isFlavinho ? "flavinho" : "decoy";

    const rowY = yMin + ((row + 0.35 + rand() * 0.3) / rows) * (yMax - yMin);

    let x = 50;
    let y = rowY;
    let scale = flavinhoScale * depthCue * jitter;
    let box = spriteBox(scale, kind, mobileBoost, maxWidthPct, minWidthPct);
    let ok = false;

    for (let attempt = 0; attempt < 80; attempt++) {
      const slots = Math.max(6, Math.ceil(count / rows));
      const slot = (i + attempt * 3) % slots;
      const rawX =
        xMin +
        ((slot + 0.1 + rand() * 0.8) / slots) * (xMax - xMin) +
        (rand() - 0.5) * (lookTier === "hard" ? 6 : 3.5);
      const rawY = rowY + (rand() - 0.5) * (lookTier === "hard" ? 5 : 3.5);
      const localDepth =
        0.88 +
        Math.max(0, Math.min(1, (rawY - yMin) / Math.max(1, yMax - yMin))) *
          0.14;
      scale = flavinhoScale * localDepth * jitter;
      box = spriteBox(scale, kind, mobileBoost, maxWidthPct, minWidthPct);
      const c = clampInside(rawX, rawY, box.widthPct, box.heightPct, ground);
      x = c.x;
      y = c.y;
      const minDist = Math.max(box.widthPct * dens.overlap, 1.6);
      const relax = attempt > 55 ? 0.8 : 1;
      if (!tooClose(x, y, placed, minDist * relax)) {
        ok = true;
        break;
      }
    }

    if (!ok && !isFlavinho) continue;
    if (!ok) {
      scale = flavinhoScale * depthCue * jitter;
      box = spriteBox(scale, kind, mobileBoost, maxWidthPct, minWidthPct);
      const c = clampInside(
        xMin + 6 + rand() * (xMax - xMin - 12),
        rowY,
        box.widthPct,
        box.heightPct,
        ground,
      );
      x = c.x;
      y = c.y;
    }

    const localDepth =
      0.88 +
      Math.max(0, Math.min(1, (y - yMin) / Math.max(1, yMax - yMin))) * 0.14;
    scale = flavinhoScale * localDepth * jitter;
    box = spriteBox(scale, kind, mobileBoost, maxWidthPct, minWidthPct);
    placed.push({ x, y });

    let src: string;
    if (isFlavinho) {
      src = FLAVINHO_SRC;
    } else {
      src = wardrobe[wardrobeCursor % wardrobe.length];
      wardrobeCursor += 1;
    }

    const facing: 1 | -1 = rand() > 0.45 ? 1 : -1;

    items.push({
      id: `${seed}-p-${i}`,
      kind,
      src,
      x,
      y,
      scale,
      facing,
      z: y + rand() * 0.02,
    });
  }

  // Invariant: exactly one undisguised target; never leak real.png onto decoys.
  let sawTarget = false;
  for (const item of items) {
    if (item.kind === "flavinho") {
      item.src = FLAVINHO_SRC;
      item.filter = undefined;
      sawTarget = true;
      continue;
    }
    if (item.src === FLAVINHO_SRC) {
      item.src = pickFrom(ALL_DISGUISES, rand);
      item.filter = undefined;
    }
  }
  if (!sawTarget && items.length > 0) {
    const rescue = items[Math.floor(items.length / 2)];
    rescue.kind = "flavinho";
    rescue.src = FLAVINHO_SRC;
    rescue.filter = undefined;
  }

  return items.sort((a, b) => a.z - b.z);
}

export function expectedWidthPct(
  _y: number,
  flavinhoScale: number,
  mobileBoost = 1,
  maxWidthPct = 9.5,
  minWidthPct = 0.95,
) {
  return spriteBox(flavinhoScale, "decoy", mobileBoost, maxWidthPct, minWidthPct)
    .widthPct;
}

export function depthRatio() {
  return 1;
}

export function scaleAtDepth(y: number, flavinhoScale: number) {
  return flavinhoScale * (0.9 + Math.min(1, Math.max(0, y / 100)) * 0.1);
}
