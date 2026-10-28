"use client";

import { useState } from "react";
import { GameApp } from "@/components/game/GameApp";
import { ModePicker } from "@/components/home/ModePicker";
import { ParcaApp } from "@/components/parca/ParcaApp";
import { RuaApp } from "@/components/rua/RuaApp";
import { SeoContent } from "@/components/seo/SeoContent";
import { useScrollTop } from "@/hooks/useScrollTop";
import type { GameModeId } from "@/lib/modes";
import { scrollToTop } from "@/lib/scroll";

export function HomeApp() {
  const [mode, setMode] = useState<GameModeId | null>(null);
  useScrollTop([mode]);

  function goHome() {
    scrollToTop();
    setMode(null);
  }

  function pickMode(next: GameModeId) {
    scrollToTop();
    setMode(next);
  }

  if (mode === "mestre") {
    return <GameApp onBackToModes={goHome} />;
  }
  if (mode === "rua") {
    return <RuaApp onBack={goHome} />;
  }
  if (mode === "parca") {
    return <ParcaApp onBack={goHome} />;
  }

  return (
    <>
      <ModePicker onPick={pickMode} />
      <SeoContent />
    </>
  );
}
