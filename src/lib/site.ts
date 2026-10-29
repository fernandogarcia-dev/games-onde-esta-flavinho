import type { Metadata } from "next";
import { getMode, type GameModeId } from "@/lib/modes";

export const SITE_URL = "https://cadeflavinho.com.br";
export const SITE_NAME = "Cadê Flavinho";
export const SITE_TITLE = "Cadê Flavinho? — Jogue grátis e ache ele agora";
export const SITE_DESCRIPTION =
  "Sumiu de novo. Ache o Flavinho na multidão, no Street View ou descubra o parça da fuga. 3 modos, ranking mundial, sem cadastro — clica e joga agora.";

export const SITE_KEYWORDS = [
  "Cadê Flavinho",
  "Cade Flavinho",
  "Cadê Flavinho jogo",
  "jogo Cadê Flavinho",
  "onde está Flavinho",
  "achar Flavinho",
  "jogo satírico",
  "jogo de achar",
  "where is waldo brasil",
  "Flavinho jogo grátis",
  "cadeflavinho",
] as const;

/** OG geral da home — compartilhar `/` manda esta arte. */
export const OG_IMAGE = {
  url: "/og-share.jpg?v=5",
  width: 1200,
  height: 1200,
  alt: "Cadê Flavinho? — jogo satírico: ache ele na multidão",
} as const;

/** Metadata + Open Graph de um modo (URL própria + imagem do modo). */
export function modePageMetadata(id: GameModeId): Metadata {
  const mode = getMode(id);
  const url = `${SITE_URL}${mode.path}`;
  const title = mode.name;
  const description = mode.seoDescription;
  const image = {
    url: mode.ogImage,
    width: mode.ogWidth,
    height: mode.ogHeight,
    alt: mode.artAlt,
  };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title: `${mode.name} · ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${mode.name} · ${SITE_NAME}`,
      description,
      images: [image.url],
    },
  };
}
