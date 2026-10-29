"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Pin = { lat: number; lng: number };

type Props = {
  guess: Pin | null;
  answer?: Pin | null;
  locked?: boolean;
  onGuess: (pin: Pin) => void;
  className?: string;
};

type CountryProps = {
  name?: string;
  iso?: string;
};

const BORDER_STYLE: L.PathOptions = {
  color: "#0b1320",
  weight: 1,
  opacity: 0.45,
  fillColor: "#1d6fd8",
  fillOpacity: 0.02,
};

const HOVER_STYLE: L.PathOptions = {
  color: "#1d6fd8",
  weight: 2,
  opacity: 0.9,
  fillColor: "#1d6fd8",
  fillOpacity: 0.12,
};

export function GuessMap({
  guess,
  answer,
  locked = false,
  onGuess,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const guessMarkerRef = useRef<L.CircleMarker | null>(null);
  const answerMarkerRef = useRef<L.CircleMarker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);
  const onGuessRef = useRef(onGuess);
  const lockedRef = useRef(locked);

  useEffect(() => {
    onGuessRef.current = onGuess;
  }, [onGuess]);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      worldCopyJump: true,
      minZoom: 1,
      maxZoom: 12,
      zoomControl: true,
    }).setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.createPane("countryBorders");
    const borderPane = map.getPane("countryBorders");
    if (borderPane) borderPane.style.zIndex = "350";

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (lockedRef.current) return;
      onGuessRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/geo/countries.geojson");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as GeoJSON.FeatureCollection;
        if (cancelled || !mapRef.current) return;

        L.geoJSON(data, {
          pane: "countryBorders",
          style: () => BORDER_STYLE,
          onEachFeature: (feature, layer) => {
            const props = (feature.properties || {}) as CountryProps;
            const name = props.name?.trim() || "País";

            layer.bindTooltip(name, {
              sticky: true,
              direction: "top",
              opacity: 0.95,
              className: "cade-country-tip",
            });

            layer.on({
              mouseover: (e) => {
                const target = e.target as L.Path;
                target.setStyle(HOVER_STYLE);
                target.bringToFront();
              },
              mouseout: (e) => {
                const target = e.target as L.Path;
                target.setStyle(BORDER_STYLE);
              },
              click: (e) => {
                // Keep country hover clicks as map guesses.
                L.DomEvent.stopPropagation(e);
                if (lockedRef.current) return;
                const ll = (e as L.LeafletMouseEvent).latlng;
                onGuessRef.current({ lat: ll.lat, lng: ll.lng });
              },
            });
          },
        }).addTo(map);
      } catch (err) {
        console.error("[guess-map] borders", err);
      }
    })();

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      cancelled = true;
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      guessMarkerRef.current = null;
      answerMarkerRef.current = null;
      lineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (guessMarkerRef.current) {
      guessMarkerRef.current.remove();
      guessMarkerRef.current = null;
    }
    if (guess) {
      guessMarkerRef.current = L.circleMarker([guess.lat, guess.lng], {
        radius: 8,
        color: "#0b1320",
        weight: 2,
        fillColor: "#1d6fd8",
        fillOpacity: 1,
      }).addTo(map);
    }

    if (answerMarkerRef.current) {
      answerMarkerRef.current.remove();
      answerMarkerRef.current = null;
    }
    if (lineRef.current) {
      lineRef.current.remove();
      lineRef.current = null;
    }

    if (answer) {
      answerMarkerRef.current = L.circleMarker([answer.lat, answer.lng], {
        radius: 9,
        color: "#0b1320",
        weight: 2,
        fillColor: "#00a868",
        fillOpacity: 1,
      }).addTo(map);

      if (guess) {
        lineRef.current = L.polyline(
          [
            [guess.lat, guess.lng],
            [answer.lat, answer.lng],
          ],
          { color: "#c2410c", weight: 3, dashArray: "6 8" },
        ).addTo(map);
        map.fitBounds(
          L.latLngBounds([
            [guess.lat, guess.lng],
            [answer.lat, answer.lng],
          ]).pad(0.35),
          { animate: true, maxZoom: 6 },
        );
      } else {
        map.setView([answer.lat, answer.lng], 4, { animate: true });
      }
    }
  }, [guess, answer]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border-[3px] border-[var(--ink)] shadow-[5px_5px_0_var(--ink)] ${className}`}
    >
      <div
        ref={containerRef}
        className="h-[min(52svh,520px)] w-full sm:h-[420px] lg:h-[460px]"
      />
    </div>
  );
}
