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

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (lockedRef.current) return;
      onGuessRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
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
      <div ref={containerRef} className="h-[300px] w-full sm:h-[420px]" />
    </div>
  );
}
