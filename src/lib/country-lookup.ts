/** ISO dos países do catálogo (nome no jogo → código). */
export const CATALOG_COUNTRY_ISO: Record<string, string> = {
  "África do Sul": "ZA",
  Alemanha: "DE",
  Argentina: "AR",
  Austrália: "AU",
  Áustria: "AT",
  Bélgica: "BE",
  Bolívia: "BO",
  Brasil: "BR",
  Canadá: "CA",
  Chile: "CL",
  China: "CN",
  Colômbia: "CO",
  "Coreia do Sul": "KR",
  Cuba: "CU",
  Dinamarca: "DK",
  EAU: "AE",
  Egito: "EG",
  Equador: "EC",
  Espanha: "ES",
  EUA: "US",
  Finlândia: "FI",
  França: "FR",
  Grécia: "GR",
  Hungria: "HU",
  Indonésia: "ID",
  Irlanda: "IE",
  Islândia: "IS",
  Itália: "IT",
  Japão: "JP",
  Malásia: "MY",
  México: "MX",
  Noruega: "NO",
  "Países Baixos": "NL",
  Paraguai: "PY",
  Peru: "PE",
  Polônia: "PL",
  Portugal: "PT",
  Quênia: "KE",
  "Reino Unido": "GB",
  Rússia: "RU",
  Singapura: "SG",
  Suécia: "SE",
  Suíça: "CH",
  Tailândia: "TH",
  Taiwan: "CN-TW",
  Tchéquia: "CZ",
  Turquia: "TR",
  Uruguai: "UY",
  Vietnã: "VN",
};

type Ring = [number, number][];

type CountryPoly = {
  iso: string;
  name: string;
  polygons: Ring[][]; // polygon → rings (outer + holes)
};

let index: CountryPoly[] | null = null;
let loading: Promise<CountryPoly[]> | null = null;

/** Singapura não vem no GeoJSON compacto — bbox apertado (evita Johor/MY). */
const SINGAPORE_BBOX = {
  iso: "SG",
  name: "Singapura",
  minLat: 1.2,
  maxLat: 1.45,
  minLng: 103.62,
  maxLng: 104.05,
};

function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lng: number, lat: number, rings: Ring[]): boolean {
  if (!rings.length) return false;
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let h = 1; h < rings.length; h++) {
    if (pointInRing(lng, lat, rings[h])) return false;
  }
  return true;
}

function coordsToRings(coords: number[][][]): Ring[] {
  return coords.map((ring) => ring.map((c) => [c[0], c[1]] as [number, number]));
}

async function buildIndex(): Promise<CountryPoly[]> {
  const res = await fetch("/geo/countries.geojson");
  if (!res.ok) throw new Error("Falha ao carregar países");
  const data = (await res.json()) as {
    features: Array<{
      properties?: { name?: string; iso?: string };
      geometry?: {
        type: string;
        coordinates: number[][][] | number[][][][];
      };
    }>;
  };

  const out: CountryPoly[] = [];
  for (const f of data.features || []) {
    const iso = String(f.properties?.iso || "").trim();
    const name = String(f.properties?.name || "").trim();
    const geom = f.geometry;
    if (!iso || !geom) continue;

    const polygons: Ring[][] = [];
    if (geom.type === "Polygon") {
      polygons.push(coordsToRings(geom.coordinates as number[][][]));
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates as number[][][][]) {
        polygons.push(coordsToRings(poly));
      }
    }
    if (polygons.length) out.push({ iso, name, polygons });
  }
  return out;
}

export async function ensureCountryIndex(): Promise<void> {
  if (index) return;
  if (!loading) {
    loading = buildIndex()
      .then((rows) => {
        index = rows;
        return rows;
      })
      .catch((err) => {
        loading = null;
        throw err;
      });
  }
  await loading;
}

export type CountryHit = { iso: string; name: string };

function lookupAt(lat: number, lng: number): CountryHit | null {
  if (
    lat >= SINGAPORE_BBOX.minLat &&
    lat <= SINGAPORE_BBOX.maxLat &&
    lng >= SINGAPORE_BBOX.minLng &&
    lng <= SINGAPORE_BBOX.maxLng
  ) {
    return { iso: SINGAPORE_BBOX.iso, name: SINGAPORE_BBOX.name };
  }

  if (!index) return null;
  for (const c of index) {
    for (const rings of c.polygons) {
      if (pointInPolygon(lng, lat, rings)) {
        return { iso: c.iso, name: c.name };
      }
    }
  }
  return null;
}

export function countryAtSync(lat: number, lng: number): CountryHit | null {
  const direct = lookupAt(lat, lng);
  if (direct) return direct;
  // Costa simplificada no GeoJSON: tenta offsets curtos (~15–30 km).
  const deltas = [0.15, -0.15, 0.3, -0.3];
  for (const dLat of deltas) {
    for (const dLng of deltas) {
      const hit = lookupAt(lat + dLat, lng + dLng);
      if (hit) return hit;
    }
  }
  return null;
}

export async function countryAt(
  lat: number,
  lng: number,
): Promise<CountryHit | null> {
  await ensureCountryIndex();
  return countryAtSync(lat, lng);
}

export function catalogCountryIso(country: string): string | null {
  return CATALOG_COUNTRY_ISO[country.trim()] || null;
}

export function sameCountry(
  catalogCountry: string,
  guessIso: string | null | undefined,
): boolean {
  const want = catalogCountryIso(catalogCountry);
  if (!want || !guessIso) return false;
  return want === guessIso;
}
