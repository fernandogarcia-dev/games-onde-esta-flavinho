"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  getGoogleMapsApiKey,
  hasGoogleMapsKey,
  streetHeading,
} from "@/lib/google-maps";

type Props = {
  lat: number;
  lng: number;
  seed: string;
  /** Wikimedia (or other) city photo used when Street View fails. */
  fallbackPhoto?: string;
  className?: string;
};

type Status = "loading" | "ready" | "empty" | "nokey" | "denied" | "photo";

let mapsConfigured = false;

function ensureMapsOptions() {
  if (mapsConfigured) return;
  setOptions({
    key: getGoogleMapsApiKey(),
    v: "weekly",
  });
  mapsConfigured = true;
}

function errText(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function isDenied(err: unknown): boolean {
  const t = errText(err).toLowerCase();
  return (
    t.includes("request_denied") ||
    t.includes("not activated") ||
    t.includes("api project") ||
    t.includes("billing") ||
    t.includes("referer") ||
    t.includes("referrer") ||
    t.includes("denied")
  );
}

async function findNearestPanorama(
  service: google.maps.StreetViewService,
  StreetViewSource: typeof google.maps.StreetViewSource,
  lat: number,
  lng: number,
): Promise<google.maps.StreetViewResponse> {
  const attempts: google.maps.StreetViewLocationRequest[] = [
    { location: { lat, lng }, radius: 5000, source: StreetViewSource.OUTDOOR },
    { location: { lat, lng }, radius: 20000, source: StreetViewSource.OUTDOOR },
    { location: { lat, lng }, radius: 50000 },
    { location: { lat, lng }, radius: 100000 },
  ];

  let lastErr: unknown;
  for (const req of attempts) {
    try {
      return await service.getPanorama(req);
    } catch (err) {
      lastErr = err;
      if (isDenied(err)) throw err;
    }
  }
  throw lastErr ?? new Error("ZERO_RESULTS");
}

function PhotoFallback({
  src,
  reason,
  className,
}: {
  src: string;
  reason: "denied" | "empty" | "nokey";
  className: string;
}) {
  const tip =
    reason === "denied"
      ? "Street View do Google ainda bloqueado — jogando com foto da cidade."
      : reason === "nokey"
        ? "Sem chave do Maps — usando foto da cidade."
        : "Sem panorama por perto — usando foto da cidade.";

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden bg-[var(--sand)] ${className}`}
    >
      <Image
        src={src}
        alt="Pista visual da cidade onde o Flavinho sumiu"
        fill
        unoptimized
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-3 pt-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
          Pista visual
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{tip}</p>
      </div>
    </div>
  );
}

export function StreetView({
  lat,
  lng,
  seed,
  fallbackPhoto,
  className = "",
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [status, setStatus] = useState<Status>(
    hasGoogleMapsKey() ? "loading" : fallbackPhoto ? "photo" : "nokey",
  );
  const [failReason, setFailReason] = useState<"denied" | "empty" | "nokey">(
    hasGoogleMapsKey() ? "empty" : "nokey",
  );

  useEffect(() => {
    if (!hasGoogleMapsKey()) {
      setFailReason("nokey");
      setStatus(fallbackPhoto ? "photo" : "nokey");
      return;
    }
    if (!hostRef.current) return;

    let cancelled = false;
    const heading = streetHeading(seed);

    (async () => {
      setStatus("loading");
      try {
        ensureMapsOptions();
        const { StreetViewService, StreetViewPanorama, StreetViewSource } =
          (await importLibrary(
            "streetView",
          )) as google.maps.StreetViewLibrary;

        if (cancelled || !hostRef.current) return;

        const service = new StreetViewService();
        const result = await findNearestPanorama(
          service,
          StreetViewSource,
          lat,
          lng,
        );

        if (cancelled || !hostRef.current) return;

        const location = result?.data?.location;
        if (!location?.latLng || !location.pano) {
          setFailReason("empty");
          setStatus(fallbackPhoto ? "photo" : "empty");
          return;
        }

        const options: google.maps.StreetViewPanoramaOptions = {
          pano: location.pano,
          position: location.latLng,
          pov: { heading, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false,
          linksControl: true,
          panControl: true,
          zoomControl: true,
          fullscreenControl: false,
          enableCloseButton: false,
          motionTracking: false,
          motionTrackingControl: false,
          clickToGo: true,
        };

        if (!panoramaRef.current) {
          panoramaRef.current = new StreetViewPanorama(
            hostRef.current,
            options,
          );
        } else {
          panoramaRef.current.setOptions(options);
        }

        setStatus("ready");
      } catch (err) {
        console.error("[streetview]", err);
        if (cancelled) return;
        const denied = isDenied(err);
        setFailReason(denied ? "denied" : "empty");
        setStatus(fallbackPhoto ? "photo" : denied ? "denied" : "empty");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, seed, fallbackPhoto]);

  useEffect(() => {
    return () => {
      panoramaRef.current = null;
    };
  }, []);

  if (status === "photo" && fallbackPhoto) {
    return (
      <PhotoFallback
        src={fallbackPhoto}
        reason={failReason}
        className={className}
      />
    );
  }

  if (status === "nokey") {
    return (
      <div
        className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-[var(--sand)] px-4 text-center ${className}`}
      >
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          Falta a chave do Street View
        </p>
        <p className="max-w-sm text-sm text-[var(--muted)]">
          Defina{" "}
          <code className="rounded bg-white px-1">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          e reinicie o server.
        </p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div
        className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-[var(--sand)] px-4 text-center ${className}`}
      >
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          Google bloqueou o Street View
        </p>
        <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
          Ative no Google Cloud a{" "}
          <strong className="text-[var(--ink)]">Maps JavaScript API</strong> e a{" "}
          <strong className="text-[var(--ink)]">Street View Static API</strong>,
          com billing ligado.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-[4/3] w-full bg-[var(--sand)] ${className}`}
    >
      <div ref={hostRef} className="absolute inset-0 h-full w-full" />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--sand)]/80">
          <p className="text-sm font-semibold text-[var(--muted)]">
            Abrindo a rua…
          </p>
        </div>
      )}
      {status === "empty" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--sand)] px-4 text-center">
          <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            Sem Street View aqui
          </p>
          <p className="text-sm text-[var(--muted)]">
            Raro — não achamos panorama num raio grande. Pula pra próxima.
          </p>
        </div>
      )}
    </div>
  );
}
