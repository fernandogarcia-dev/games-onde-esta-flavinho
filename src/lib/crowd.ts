export type CrowdPerson = {
  id: string;
  x: number;
  y: number;
  scale: number;
  hue: number;
  shirt: string;
  hair: string;
  facing: 1 | -1;
  isFlavinho: boolean;
};

const SHIRTS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#64748b",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

const HAIRS = ["#1c1917", "#44403c", "#78350f", "#0f172a", "#57534e", "#92400e"];

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildCrowd(
  seed: string,
  count: number,
  flavinhoScale: number,
): CrowdPerson[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = mulberry32(h >>> 0);

  const people: CrowdPerson[] = [];
  const flavinhoIndex = Math.floor(rand() * count);

  for (let i = 0; i < count; i++) {
    const isFlavinho = i === flavinhoIndex;
    const depth = 0.2 + rand() * 0.75;
    people.push({
      id: `${seed}-${i}`,
      x: 4 + rand() * 92,
      y: 28 + depth * 62,
      scale: isFlavinho
        ? flavinhoScale
        : 0.045 + depth * 0.07 + rand() * 0.02,
      hue: Math.floor(rand() * 360),
      shirt: isFlavinho ? "#f5d547" : SHIRTS[Math.floor(rand() * SHIRTS.length)],
      hair: HAIRS[Math.floor(rand() * HAIRS.length)],
      facing: rand() > 0.5 ? 1 : -1,
      isFlavinho,
    });
  }

  // Draw farther people first
  return people.sort((a, b) => a.y - b.y);
}
