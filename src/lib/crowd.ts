import {
  PERSPECTIVE,
  PERSPECTIVE_GROUND,
  depthRatio,
  scaleAtDepth,
  type PerspectiveGround,
} from "@/lib/perspective";

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

export type GroundBand = PerspectiveGround;

export type LookTier = "easy" | "medium" | "hard";

/** Undisguised Flavinho — the click target. */
export const FLAVINHO_SRC = "/game/disguises/real.png";

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

export const DISGUISE_MID = [
  "/game/disguises/hoodie.png",
  "/game/disguises/blonde.png",
  "/game/disguises/gag.png",
  "/game/disguises/scarf.png",
  "/game/disguises/beanie.png",
] as const;

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

/**
 * Decoys may reuse the same disguise — never the undisguised real.png.
 * Hard/medium can tint disguises so twins feel similar without cloning the target.
 */
function decoyLook(
  tier: LookTier,
  rand: () => number,
): { src: string; filter?: string } {
  const src = pickFrom(disguisePoolFor(tier), rand);
  if (src === FLAVINHO_SRC) {
    // Belt-and-suspenders: disguise pools must never include the target art.
    return { src: pickFrom(DISGUISE_WILD, rand) };
  }
  if (tier === "hard" && rand() < 0.4) {
    return { src, filter: pickFrom(NEAR_CLONE_FILTERS, rand) };
  }
  if (tier === "medium" && rand() < 0.18) {
    return { src, filter: pickFrom(NEAR_CLONE_FILTERS, rand) };
  }
  return { src };
}

/** Packing density only — size always comes from Y perspective. */
export function densityFor(tier: LookTier): {
  overlap: number;
  rows: number;
} {
  if (tier === "hard") return { overlap: 0.34, rows: 9 };
  if (tier === "medium") return { overlap: 0.58, rows: 6 };
  return { overlap: 0.92, rows: 3 };
}

function twinJitter(tier: LookTier, isFlavinho: boolean, rand: () => number) {
  // Keep microscopic — depth Y owns the size, jitter must not invent tiers.
  if (tier === "hard") {
    return isFlavinho ? 1 : 0.985 + rand() * 0.03;
  }
  if (tier === "medium") {
    return isFlavinho ? 1.01 : 0.97 + rand() * 0.05;
  }
  return isFlavinho ? 1.02 : 0.94 + rand() * 0.1;
}

/**
 * Percent box from scale. NO large baseMin — that was flattening perspective.
 * Must stay in sync with CrowdScene.
 */
export function spriteBox(
  scale: number,
  kind: CrowdItem["kind"],
  mobileBoost = 1,
) {
  const floor =
    kind === "prop" ? PERSPECTIVE.propMinWidthPct : PERSPECTIVE.minWidthPct;
  const widthPct = Math.max(scale * 100 * mobileBoost, floor * mobileBoost);
  const heightPct = widthPct * (kind === "prop" ? 1.05 : 1.55);
  return { widthPct, heightPct };
}

/**
 * Clamp with FEET as the anchor (y = ground contact).
 * Sprite extends upward by heightPct from the feet.
 */
export function clampInside(
  x: number,
  y: number,
  widthPct: number,
  heightPct: number,
  ground?: GroundBand,
  pad = 0.35,
) {
  const halfW = widthPct / 2;
  const yMin = ground?.yMin ?? PERSPECTIVE.yMin;
  const yMax = ground?.yMax ?? PERSPECTIVE.yMax;
  // Keep most of the body on-canvas; tiny head clip at the far back is OK.
  const minFeet = Math.max(yMin, heightPct * 0.12 + pad);
  return {
    x: Math.min(100 - halfW - pad, Math.max(halfW + pad, x)),
    y: Math.min(yMax, Math.max(minFeet, y)),
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
    const dy = (p.y - y) * 0.65;
    if (dx * dx + dy * dy < minDist * minDist) return true;
  }
  return false;
}

export function lookTip(tier: LookTier): string {
  if (tier === "hard") return "Multidão lotada. Ache o SEM acessório.";
  if (tier === "medium") return "Tá cheio. Olho no SEM disfarce.";
  return "Ache o SEM disfarce. O resto é camuflagem.";
}

/**
 * Place sprites on perspective rows. Y = feet on the ground plane.
 * Final scale is locked from that feet Y (vanish-point curve).
 */
export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
  ground: GroundBand = PERSPECTIVE_GROUND,
  opts?: { mobileBoost?: number; lookTier?: LookTier },
): CrowdItem[] {
  const mobileBoost = opts?.mobileBoost ?? 1;
  const lookTier = opts?.lookTier ?? "medium";
  const dens = densityFor(lookTier);
  const rand = mulberry32(hashSeed(`${seed}:crowd-v9-unique:${lookTier}`));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? PERSPECTIVE.xMin;
  const xMax = ground.xMax ?? PERSPECTIVE.xMax;
  const yMin = ground.yMin ?? PERSPECTIVE.yMin;
  const yMax = ground.yMax ?? PERSPECTIVE.yMax;
  // Exactly one clickable target — never clone real.png on decoys.
  const flavinhoIndex = Math.floor(rand() * Math.max(1, crowdCount));
  const placed: { x: number; y: number; r: number }[] = [];
  const rows = dens.rows;

  for (let i = 0; i < crowdCount; i++) {
    const isFlavinho = i === flavinhoIndex;
    // Spread across depth more evenly (avoid carpet only at the front).
    const row = isFlavinho
      ? Math.min(rows - 1, Math.floor(rows * (0.3 + rand() * 0.55)))
      : i % rows;
    const jitterOnce = twinJitter(lookTier, isFlavinho, rand);
    const kind: CrowdItem["kind"] = isFlavinho ? "flavinho" : "decoy";

    const rowY =
      yMin + ((row + 0.4 + rand() * 0.2) / rows) * (yMax - yMin);

    let x = 50;
    let y = rowY;
    let scale = scaleAtDepth(rowY, flavinhoScale, ground) * jitterOnce;
    let box = spriteBox(scale, kind, mobileBoost);
    let ok = false;

    for (let attempt = 0; attempt < 70; attempt++) {
      const slots = Math.max(8, Math.ceil(crowdCount / rows));
      const slot = (i + attempt * 3) % slots;
      const rawX =
        xMin +
        ((slot + 0.15 + rand() * 0.7) / slots) * (xMax - xMin) +
        (rand() - 0.5) * (lookTier === "hard" ? 7 : 4);
      const rawY = rowY + (rand() - 0.5) * (lookTier === "hard" ? 4.5 : 3);
      scale = scaleAtDepth(rawY, flavinhoScale, ground) * jitterOnce;
      box = spriteBox(scale, kind, mobileBoost);
      const c = clampInside(rawX, rawY, box.widthPct, box.heightPct, ground);
      x = c.x;
      y = c.y;
      // Collision uses feet distance; scale with local width.
      const minDist = Math.max(box.widthPct * dens.overlap, 1.4);
      const relax = attempt > 40 ? 0.72 : 1;
      if (!tooClose(x, y, placed, minDist * relax)) {
        ok = true;
        break;
      }
    }
    if (!ok) {
      scale = scaleAtDepth(rowY, flavinhoScale, ground) * jitterOnce;
      box = spriteBox(scale, kind, mobileBoost);
      const c = clampInside(
        xMin + rand() * (xMax - xMin),
        rowY,
        box.widthPct,
        box.heightPct,
        ground,
      );
      x = c.x;
      y = c.y;
    }

    // Hard lock: size is ONLY f(feetY) × one jitter sampled above.
    scale = scaleAtDepth(y, flavinhoScale, ground) * jitterOnce;
    box = spriteBox(scale, kind, mobileBoost);
    placed.push({ x, y, r: Math.max(box.widthPct, box.heightPct) * 0.3 });

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

  // Invariant: one unique undisguised Flavinho — rewrite any leaked clones.
  let sawTarget = false;
  for (const item of items) {
    if (item.kind === "flavinho") {
      item.src = FLAVINHO_SRC;
      item.filter = undefined;
      sawTarget = true;
      continue;
    }
    if (item.src === FLAVINHO_SRC) {
      item.src = pickFrom(DISGUISE_WILD, rand);
      item.filter = undefined;
    }
  }
  if (!sawTarget && items.length > 0) {
    const rescue = items.find((it) => it.kind !== "prop") ?? items[0];
    rescue.kind = "flavinho";
    rescue.src = FLAVINHO_SRC;
    rescue.filter = undefined;
  }

  const propFactor = lookTier === "hard" ? 10 : lookTier === "medium" ? 12 : 14;
  const propCount = Math.max(3, Math.floor(crowdCount / propFactor));
  for (let i = 0; i < propCount; i++) {
    const row = Math.floor(rand() * rows);
    const rowY =
      yMin + ((row + 0.5 + (rand() - 0.5) * 0.2) / rows) * (yMax - yMin);
    const propJitter = 0.4 + rand() * 0.28;
    let scale = scaleAtDepth(rowY, flavinhoScale, ground) * propJitter;
    let box = spriteBox(scale, "prop", mobileBoost);
    const c = clampInside(
      xMin + rand() * (xMax - xMin),
      rowY,
      box.widthPct,
      box.heightPct,
      ground,
    );
    scale = scaleAtDepth(c.y, flavinhoScale, ground) * propJitter;
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

/** Debug helper: expected width% at a depth. */
export function expectedWidthPct(
  y: number,
  flavinhoScale: number,
  mobileBoost = 1,
  ground?: PerspectiveGround,
) {
  return spriteBox(scaleAtDepth(y, flavinhoScale, ground), "decoy", mobileBoost)
    .widthPct;
}

export { depthRatio, scaleAtDepth, PERSPECTIVE_GROUND };
