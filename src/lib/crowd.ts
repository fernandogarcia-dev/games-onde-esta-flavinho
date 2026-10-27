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

/** Undisguised Flavinho — the click target. */
export const FLAVINHO_SRC = "/game/disguises/real.png";

export const DISGUISE_SRCS = [
  "/game/disguises/hoodie.png",
  "/game/disguises/trucker.png",
  "/game/disguises/glasses.png",
  "/game/disguises/beanie.png",
  "/game/disguises/scarf.png",
  "/game/disguises/hippie.png",
  "/game/disguises/sideburns.png",
  "/game/disguises/blonde.png",
  "/game/disguises/flute.png",
  "/game/disguises/biker.png",
  "/game/disguises/bald.png",
  "/game/disguises/rasta.png",
  "/game/disguises/gag.png",
  "/game/disguises/chef.png",
  "/game/disguises/fan.png",
  "/game/disguises/doctor.png",
  "/game/disguises/worker.png",
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

/** Percent size used by CrowdScene (must stay in sync). */
export function spriteBox(
  scale: number,
  kind: CrowdItem["kind"],
  mobileBoost = 1,
) {
  const baseMin = kind === "prop" ? 3.2 : 5.8;
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
  pad = 0.8,
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
    // Vertical overlap looks worse on portrait boards — weight it higher.
    const dy = (p.y - y) * 1.15;
    const need = Math.max(minDist, (p.r + minDist) * 0.55);
    if (dx * dx + dy * dy < need * need) return true;
  }
  return false;
}

/** Scatter disguise sprites fully inside a flat board, with real randomness. */
export function buildCrowd(
  seed: string,
  crowdCount: number,
  flavinhoScale: number,
  ground: GroundBand,
  opts?: { mobileBoost?: number },
): CrowdItem[] {
  const mobileBoost = opts?.mobileBoost ?? 1;
  const rand = mulberry32(hashSeed(`${seed}:crowd-v4`));
  const items: CrowdItem[] = [];
  const xMin = ground.xMin ?? 8;
  const xMax = ground.xMax ?? 92;
  const yMin = ground.yMin ?? 12;
  const yMax = ground.yMax ?? 88;
  const flavinhoIndex = Math.floor(rand() * crowdCount);
  const placed: { x: number; y: number; r: number }[] = [];

  // Separation scales with sprite size so big mobile tokens don't pile up.
  const sample = spriteBox(flavinhoScale, "decoy", mobileBoost);
  const sizeAwareMin = Math.max(
    sample.widthPct * 0.72,
    sample.heightPct * 0.42,
  );
  const densityMin = 9.5 / Math.sqrt(Math.max(crowdCount, 1));
  const minDist = Math.max(sizeAwareMin, densityMin);

  for (let i = 0; i < crowdCount; i++) {
    const isFlavinho = i === flavinhoIndex;
    const scale =
      flavinhoScale *
      (isFlavinho ? 1.02 + rand() * 0.1 : 0.78 + rand() * 0.32);
    const kind: CrowdItem["kind"] = isFlavinho ? "flavinho" : "decoy";
    const { widthPct, heightPct } = spriteBox(scale, kind, mobileBoost);
    const radius = Math.max(widthPct, heightPct) * 0.38;

    let x = 50;
    let y = 50;
    let ok = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      // Bias early attempts toward a loose grid so the board fills evenly.
      const cols = Math.max(3, Math.ceil(Math.sqrt(crowdCount * 1.1)));
      const rows = Math.max(3, Math.ceil(crowdCount / cols));
      const cell = i % (cols * rows);
      const col = cell % cols;
      const row = Math.floor(cell / cols);
      const gridX = xMin + ((col + 0.35 + rand() * 0.3) / cols) * (xMax - xMin);
      const gridY = yMin + ((row + 0.35 + rand() * 0.3) / rows) * (yMax - yMin);
      const useGrid = attempt < 40;
      const rawX = useGrid ? gridX : xMin + rand() * (xMax - xMin);
      const rawY = useGrid ? gridY : yMin + rand() * (yMax - yMin);
      const jitterX = (rand() - 0.5) * (useGrid ? 4 : 8);
      const jitterY = (rand() - 0.5) * (useGrid ? 4 : 8);
      const c = clampInside(
        rawX + jitterX,
        rawY + jitterY,
        widthPct,
        heightPct,
      );
      x = c.x;
      y = c.y;
      const relax = attempt > 55 ? 0.78 : 0.92;
      if (!tooClose(x, y, placed, minDist * relax)) {
        ok = true;
        break;
      }
    }
    if (!ok) {
      // Last resort: park on the emptiest-looking edge instead of the center.
      const edgeX = rand() > 0.5 ? xMin + rand() * 12 : xMax - rand() * 12;
      const edgeY = yMin + rand() * (yMax - yMin);
      const c = clampInside(edgeX, edgeY, widthPct, heightPct);
      x = c.x;
      y = c.y;
    }
    placed.push({ x, y, r: radius });

    items.push({
      id: `${seed}-p-${i}`,
      kind,
      src: isFlavinho
        ? FLAVINHO_SRC
        : DISGUISE_SRCS[Math.floor(rand() * DISGUISE_SRCS.length)],
      x,
      y,
      scale,
      facing: rand() > 0.5 ? 1 : -1,
      z: y + rand() * 0.02,
    });
  }

  // Shuffle draw order a bit so Flavinho isn't predictable mid-list by z alone
  for (let i = items.length - 1; i > 0; i--) {
    if (rand() > 0.55) continue;
    const j = Math.floor(rand() * (i + 1));
    const zi = items[i].z;
    items[i].z = items[j].z;
    items[j].z = zi;
  }

  const propCount = Math.max(2, Math.floor(crowdCount / 16));
  for (let i = 0; i < propCount; i++) {
    const scale = flavinhoScale * (0.5 + rand() * 0.35);
    const { widthPct, heightPct } = spriteBox(scale, "prop", mobileBoost);
    const c = clampInside(
      xMin + rand() * (xMax - xMin),
      yMin + rand() * (yMax - yMin),
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
      z: c.y * 0.4,
    });
  }

  return items.sort((a, b) => a.z - b.z);
}
