/** Public browser key — Maps Embed / JavaScript (Street View). */
export function getGoogleMapsApiKey(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
}

export function hasGoogleMapsKey(): boolean {
  return getGoogleMapsApiKey().length > 10;
}

/** Stable heading 0–360 from a seed (city id + episode). */
export function streetHeading(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}
