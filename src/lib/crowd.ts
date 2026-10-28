/**
 * Sea-of-Flavinhos finder: flat board, every disguise in play.
 * Difficulty = smaller sprites + denser grid that fills the whole area.
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

/** Full-bleed board — center-anchored sprites fill edge to edge. */
export const BOARD_GROUND: GroundBand = {
  yMin: 4,
  yMax: 96,
  xMin: 4,
  xMax: 96,
};

export const PERSPECTIVE_GROUND = BOARD_GROUND;

export type CrowdParams = {
  /** Exact grid — count = cols * rows so the board stays full. */
  cols: number;
  rows: number;
  count: number;
  /** Base width as fraction of board. */
  scale: number;
  maxWidthPct: number;
  minWidthPct: number;
  /** Legacy fields kept for callers. */
  overlap: number;
};

/** Harder = smaller + more cells. Grid always fills the board. */
export function crowdParamsFor(tier: LookTier): CrowdParams {
  if (tier === "hard") {
    const cols = 10;
    const rows = 13;
    return {
      cols,
      rows,
      count: cols * rows,
      scale: 0.052,
      maxWidthPct: 7.2,
      minWidthPct: 4.4,
      overlap: 0.5,
    };
  }
  if (tier === "medium") {
    const cols = 7;
    const rows = 9;
    return {
      cols,
      rows,
      count: cols * rows,
      scale: 0.088,
      maxWidthPct: 11.5,
      minWidthPct: 7,
      overlap: 0.6,
    };
  }
  const cols = 5;
  const rows = 6;
  return {
    cols,
    rows,
    count: cols * rows,
    scale: 0.14,
    maxWidthPct: 17,
    minWidthPct: 11,
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
  pad = 0.2,
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

/**
 * Jittered lattice that covers the whole board — no dropped cells, no big holes.
 * (x, y) are the visual CENTER of each sprite (CrowdScene uses translate -50%/-50%).
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
    cols?: number;
    rows?: number;
  },
): CrowdItem[] {
  const mobileBoost = opts?.mobileBoost ?? 1;
  const lookTier = opts?.lookTier ?? "medium";
  const params = crowdParamsFor(lookTier);
  const maxWidthPct = opts?.maxWidthPct ?? params.maxWidthPct;
  const minWidthPct = opts?.minWidthPct ?? params.minWidthPct;

  // Prefer an exact grid that fills the board; fall back to sqrt layout.
  let cols = opts?.cols ?? params.cols;
  let rows = opts?.rows ?? params.rows;
  const want = Math.max(1, crowdCount);
  if (want !== cols * rows) {
    cols = Math.max(3, Math.round(Math.sqrt(want * 0.85)));
    rows = Math.max(3, Math.ceil(want / cols));
  }
  const count = cols * rows;

  const rand = mulberry32(hashSeed(`${seed}:sea-grid-v2:${lookTier}:${cols}x${rows}`));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? BOARD_GROUND.xMin!;
  const xMax = ground.xMax ?? BOARD_GROUND.xMax!;
  const yMin = ground.yMin ?? BOARD_GROUND.yMin;
  const yMax = ground.yMax ?? BOARD_GROUND.yMax;
  const spanX = xMax - xMin;
  const spanY = yMax - yMin;

  const flavinhoIndex = Math.floor(rand() * count);

  const wardrobe = [...ALL_DISGUISES];
  for (let i = wardrobe.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [wardrobe[i], wardrobe[j]] = [wardrobe[j], wardrobe[i]];
  }

  // Shuffle cell visit order so the target isn't always mid-grid.
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Keep flavinhoIndex as the kind flag by remapping after shuffle:
  // place kinds by original index; positions by shuffled lattice cell.
  const cellOf = order; // cellOf[i] = lattice index for item i

  for (let i = 0; i < count; i++) {
    const isFlavinho = i === flavinhoIndex;
    const cell = cellOf[i];
    const col = cell % cols;
    const row = Math.floor(cell / cols);

    // Cell center + light jitter (stay inside the cell so gaps stay closed).
    const jitterAmp = lookTier === "hard" ? 0.28 : lookTier === "medium" ? 0.22 : 0.18;
    const jx = (rand() - 0.5) * jitterAmp;
    const jy = (rand() - 0.5) * jitterAmp;
    const rawX = xMin + ((col + 0.5 + jx) / cols) * spanX;
    const rawY = yMin + ((row + 0.5 + jy) / rows) * spanY;

    const jitter = isFlavinho ? 1 : 0.93 + rand() * 0.12;
    // Mild size variation by row so it doesn't look stamped.
    const rowCue = 0.94 + (row / Math.max(1, rows - 1)) * 0.1;
    const scale = flavinhoScale * rowCue * jitter;
    const kind: CrowdItem["kind"] = isFlavinho ? "flavinho" : "decoy";
    const box = spriteBox(scale, kind, mobileBoost, maxWidthPct, minWidthPct);
    const c = clampInside(rawX, rawY, box.widthPct, box.heightPct, ground);

    const src = isFlavinho
      ? FLAVINHO_SRC
      : wardrobe[i % wardrobe.length];

    items.push({
      id: `${seed}-p-${i}`,
      kind,
      src,
      x: c.x,
      y: c.y,
      scale,
      facing: rand() > 0.45 ? 1 : -1,
      z: c.y + rand() * 0.02,
    });
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
