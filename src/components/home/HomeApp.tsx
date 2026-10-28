"use client";

import { useState } from "react";
import { GameApp } from "@/components/game/GameApp";
import { ModePicker } from "@/components/home/ModePicker";
import { ParcaApp } from "@/components/parca/ParcaApp";
import { RuaApp } from "@/components/rua/RuaApp";
import type { GameModeId } from "@/lib/modes";

export function HomeApp() {
  const [mode, setMode] = useState<GameModeId | null>(null);

  if (mode === "mestre") {
    return <GameApp onBackToModes={() => setMode(null)} />;
  }
  if (mode === "rua") {
    return <RuaApp onBack={() => setMode(null)} />;
  }
  if (mode === "parca") {
    return <ParcaApp onBack={() => setMode(null)} />;
  }

  return <ModePicker onPick={setMode} />;
}
