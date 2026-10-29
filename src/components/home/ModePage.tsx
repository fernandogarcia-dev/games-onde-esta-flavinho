"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GameApp } from "@/components/game/GameApp";
import { ParcaApp } from "@/components/parca/ParcaApp";
import { RuaApp } from "@/components/rua/RuaApp";
import { trackModeSelect } from "@/lib/analytics";
import type { GameModeId } from "@/lib/modes";
import { scrollToTop } from "@/lib/scroll";

export function ModePage({ mode }: { mode: GameModeId }) {
  const router = useRouter();

  useEffect(() => {
    trackModeSelect(mode);
    scrollToTop();
  }, [mode]);

  function goHome() {
    scrollToTop();
    router.push("/");
  }

  if (mode === "mestre") {
    return <GameApp onBackToModes={goHome} />;
  }
  if (mode === "rua") {
    return <RuaApp onBack={goHome} />;
  }
  return <ParcaApp onBack={goHome} />;
}
