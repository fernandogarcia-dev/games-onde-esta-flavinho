"use client";

import { ModePicker } from "@/components/home/ModePicker";
import { SeoContent } from "@/components/seo/SeoContent";

/** Home geral — compartilhar `/` usa o OG geral do layout. */
export function HomeApp() {
  return (
    <>
      <ModePicker />
      <SeoContent />
    </>
  );
}
