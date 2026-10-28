"use client";

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
  className?: string;
};

let mapsConfigured = false;

function ensureMapsOptions() {
  if (mapsConfigured) return;
  setOptions({
    key: getGoogleMapsApiKey(),
    v: "weekly",
  });
  mapsConfigured = true;
}

export function StreetView({ lat, lng, seed, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "nokey">(
    hasGoogleMapsKey() ? "loading" : "nokey",
  );

  useEffect(() => {
    if (!hasGoogleMapsKey()) {
      setStatus("nokey");
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
        const result = await service.getPanorama({
          location: { lat, lng },
          radius: 2500,
          source: StreetViewSource.OUTDOOR,
        });

        if (cancelled || !hostRef.current) return;

        const location = result?.data?.location;
        if (!location?.latLng || !location.pano) {
          setStatus("empty");
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
        if (!cancelled) setStatus("empty");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, seed]);

  useEffect(() => {
    return () => {
      panoramaRef.current = null;
    };
  }, []);

  if (status === "nokey") {
    return (
      <div
        className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-[var(--sand)] px-4 text-center ${className}`}
      >
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          Falta a chave do Street View
        </p>
        <p className="max-w-sm text-sm text-[var(--muted)]">
          Cria uma API key no Google Cloud (Maps JavaScript API), coloca em{" "}
          <code className="rounded bg-white px-1">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          e reinicia o server. O crédito mensal grátis costuma bastar.
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
            Essa cidade ficou sem panorama perto. Pula pra próxima ou tenta de
            novo.
          </p>
        </div>
      )}
    </div>
  );
}
