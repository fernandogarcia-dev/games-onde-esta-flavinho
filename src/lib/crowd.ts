/**
 * Sea-of-Flavinhos finder: flat board, every disguise in play.
 * Difficulty = smaller + more sprites. Placement is scattered (not a grid),
 * but blue-noise style so big empty pockets don't appear.
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

/** Undisguised Flavinho — the only click target (match the model drawing). */
export const FLAVINHO_SRC = "/game/disguises/real.png";

/** Flavinho face + costume/mask disguises (keep these — player loves them). */
export const FLAVINHO_DISGUISES = [
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

/**
 * Crowd fillers that look NOTHING like Flavinho — age, gender, PCD,
 * profession, culture, queer presentation, etc.
 */
export const CROWD_DECOYS = [
  "/game/crowd/grandma.png",
  "/game/crowd/grandpa.png",
  "/game/crowd/afro-woman.png",
  "/game/crowd/nurse.png",
  "/game/crowd/scientist.png",
  "/game/crowd/skater.png",
  "/game/crowd/wheelchair.png",
  "/game/crowd/blind.png",
  "/game/crowd/nonbinary.png",
  "/game/crowd/hijab.png",
  "/game/crowd/schoolgirl.png",
  "/game/crowd/builder-woman.png",
  "/game/crowd/drag.png",
  "/game/crowd/little-person.png",
  "/game/crowd/rainbow-guy.png",
  "/game/crowd/pregnant.png",
  "/game/crowd/indigenous.png",
] as const;

/** Full decoy wardrobe: diverse crowd + Flavinho-in-costume twins. */
export const ALL_DISGUISES = [
  ...CROWD_DECOYS,
  ...CROWD_DECOYS,
  ...FLAVINHO_DISGUISES,
] as const;

/** @deprecated alias — kept for any leftover imports */
export const DISGUISE_SRCS = ALL_DISGUISES;
export const DISGUISE_WILD = ALL_DISGUISES;
export const DISGUISE_MID = ALL_DISGUISES;
export const DISGUISE_SUBTLE = ALL_DISGUISES;
export const PROP_SRCS = [] as const;

/** Full-bleed board — center-anchored sprites. */
export const BOARD_GROUND: GroundBand = {
  yMin: 5,
  yMax: 95,
  xMin: 5,
  xMax: 95,
};

export const PERSPECTIVE_GROUND = BOARD_GROUND;

export type CrowdParams = {
  count: number;
  /** Base width as fraction of board. */
  scale: number;
  maxWidthPct: number;
  minWidthPct: number;
  /**
   * Target clearance between centers, as a fraction of sprite width.
   * Lower = denser / less white space.
   */
  spacing: number;
  rows: number;
  overlap: number;
};

/** Harder = smaller + more. Spacing keeps the board full without a grid look. */
export function crowdParamsFor(tier: LookTier): CrowdParams {
  if (tier === "hard") {
    return {
      count: 140,
      scale: 0.05,
      maxWidthPct: 6.8,
      minWidthPct: 4.2,
      spacing: 0.78,
      rows: 12,
      overlap: 0.5,
    };
  }
  if (tier === "medium") {
    return {
      count: 72,
      scale: 0.084,
      maxWidthPct: 10.5,
      minWidthPct: 6.5,
      spacing: 0.85,
      rows: 8,
      overlap: 0.6,
    };
  }
  return {
    count: 36,
    scale: 0.125,
    maxWidthPct: 15.5,
    minWidthPct: 10,
    spacing: 0.92,
    rows: 5,
    overlap: 0.7,
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
  pad = 0.15,
) {
  const halfW = widthPct / 2;
  const halfH = heightPct / 2;
  const xMin = ground?.xMin ?? BOARD_GROUND.xMin!;
  const xMax = ground?.xMax ?? BOARD_GROUND.xMax!;
  const yMin = ground?.yMin ?? BOARD_GROUND.yMin;
  const yMax = ground?.yMax ?? BOARD_GROUND.yMax;
  return {
    x: Math.min(xMax - halfW - pad, Math.max(xMin + halfW + pad, x)),
    y: Math.min(yMax - halfH - pad, Math.max(yMin + halfH + pad, y)),
  };
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

function minDistTo(
  x: number,
  y: number,
  placed: { x: number; y: number }[],
) {
  let best = Infinity;
  for (const p of placed) {
    const dx = p.x - x;
    // Slight Y stretch so vertical gaps feel as closed as horizontal ones
    // (sprites are taller than wide).
    const dy = (p.y - y) * 0.85;
    const d = dx * dx + dy * dy;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/**
 * Scattered pack that still fills the board: Mitchell's best-candidate
 * (blue noise). Looks organic — not a grid — but keeps hunting the
 * emptiest pocket so white voids don't survive.
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
  const count = Math.max(1, crowdCount || params.count);

  const rand = mulberry32(hashSeed(`${seed}:sea-scatter-v3:${lookTier}`));
  const items: CrowdItem[] = [];
  const placed: { x: number; y: number }[] = [];

  const xMin = ground.xMin ?? BOARD_GROUND.xMin!;
  const xMax = ground.xMax ?? BOARD_GROUND.xMax!;
  const yMin = ground.yMin ?? BOARD_GROUND.yMin;
  const yMax = ground.yMax ?? BOARD_GROUND.yMax;
  const spanX = xMax - xMin;
  const spanY = yMax - yMin;

  const wardrobe = [...ALL_DISGUISES];
  for (let i = wardrobe.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [wardrobe[i], wardrobe[j]] = [wardrobe[j], wardrobe[i]];
  }

  const flavinhoIndex = Math.floor(rand() * count);

  // Typical sprite width drives minimum center spacing.
  const probeScale = flavinhoScale;
  const probe = spriteBox(
    probeScale,
    "decoy",
    mobileBoost,
    maxWidthPct,
    minWidthPct,
  );
  let minSep = Math.max(probe.widthPct * params.spacing, 2.2);

  // More candidates per point → better void-filling, still organic.
  const candidatesPerPoint =
    lookTier === "hard" ? 28 : lookTier === "medium" ? 34 : 40;

  for (let i = 0; i < count; i++) {
    const isFlavinho = i === flavinhoIndex;
    const jitter = isFlavinho ? 1 : 0.92 + rand() * 0.14;
    const scale = flavinhoScale * jitter;
    const kind: CrowdItem["kind"] = isFlavinho ? "flavinho" : "decoy";
    const box = spriteBox(scale, kind, mobileBoost, maxWidthPct, minWidthPct);

    let bestX = 50;
    let bestY = 50;
    let bestScore = -1;

    // Soften spacing if the board is getting full so we never leave holes
    // just because the hard min-distance can't fit another body.
    const progress = i / count;
    const sep =
      minSep * (progress > 0.7 ? 0.82 : progress > 0.45 ? 0.92 : 1);

    const tries = placed.length === 0 ? 1 : candidatesPerPoint;
    for (let t = 0; t < tries; t++) {
      let rawX: number;
      let rawY: number;
      if (placed.length === 0) {
        // Start near center-ish so the fill spreads outward.
        rawX = xMin + spanX * (0.35 + rand() * 0.3);
        rawY = yMin + spanY * (0.35 + rand() * 0.3);
      } else {
        rawX = xMin + rand() * spanX;
        rawY = yMin + rand() * spanY;
      }
      const c = clampInside(rawX, rawY, box.widthPct, box.heightPct, ground);
      const d =
        placed.length === 0 ? 999 : minDistTo(c.x, c.y, placed);
      // Prefer farthest from neighbors (fills voids). Soft reject if too close.
      const score = d < sep * 0.55 ? d * 0.15 : d;
      if (score > bestScore) {
        bestScore = score;
        bestX = c.x;
        bestY = c.y;
      }
    }

    placed.push({ x: bestX, y: bestY });
    items.push({
      id: `${seed}-p-${i}`,
      kind,
      src: isFlavinho ? FLAVINHO_SRC : wardrobe[i % wardrobe.length],
      x: bestX,
      y: bestY,
      scale,
      facing: rand() > 0.45 ? 1 : -1,
      z: bestY + rand() * 0.02,
    });
  }

  // Pass 2: if any region is still sparse, nudge the last third of decoys
  // toward the emptiest pockets (keeps scatter, kills leftover voids).
  const refineFrom = Math.floor(count * 0.55);
  for (let i = refineFrom; i < items.length; i++) {
    if (items[i].kind === "flavinho") continue;
    const box = spriteBox(
      items[i].scale,
      items[i].kind,
      mobileBoost,
      maxWidthPct,
      minWidthPct,
    );
    const others = placed.filter((_, idx) => idx !== i);
    let bestX = items[i].x;
    let bestY = items[i].y;
    let bestD = minDistTo(bestX, bestY, others);
    for (let t = 0; t < 18; t++) {
      const c = clampInside(
        xMin + rand() * spanX,
        yMin + rand() * spanY,
        box.widthPct,
        box.heightPct,
        ground,
      );
      const d = minDistTo(c.x, c.y, others);
      if (d > bestD) {
        bestD = d;
        bestX = c.x;
        bestY = c.y;
      }
    }
    items[i].x = bestX;
    items[i].y = bestY;
    items[i].z = bestY + rand() * 0.02;
    placed[i] = { x: bestX, y: bestY };
  }

  // Invariant: exactly one undisguised target.
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
    const rescue = items[Math.floor(rand() * items.length)];
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
