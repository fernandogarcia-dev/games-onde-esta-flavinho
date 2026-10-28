import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre o jogo",
  description:
    "Sobre o Cadê Flavinho: jogo satírico ficcional e grátis, com ranking mundial e três modos de caçada. Sem cadastro.",
  alternates: { canonical: `${SITE_URL}/sobre` },
  openGraph: {
    title: `Sobre · ${SITE_NAME}`,
    description:
      "Obra ficcional de sátira humorística. Jogo grátis no navegador — cadeflavinho.com.br",
    url: `${SITE_URL}/sobre`,
  },
};

export default function SobrePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
        {SITE_NAME}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
        Sobre o projeto
      </h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--muted)]">
        <p>
          <strong className="text-[var(--ink)]">Cadê Flavinho?</strong> é um
          jogo de navegador, gratuito, de sátira humorística. A proposta é
          simples: seguir o rastro, marcar a cidade e achar o personagem
          ficcional na multidão — com timer, pontuação e ranking.
        </p>
        <p>
          O site não é notícia, denúncia, biografia, campanha eleitoral nem
          afiliação partidária. Qualquer PIX é apoio voluntário destinado à
          infraestrutura técnica e aos custos do desenvolvedor.
        </p>
        <p>
          Domínio oficial:{" "}
          <a
            className="font-semibold text-[var(--brand)] underline-offset-2 hover:underline"
            href={SITE_URL}
          >
            cadeflavinho.com.br
          </a>
          .
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[var(--brand)] px-4 py-2.5 font-[family-name:var(--font-display)] text-white shadow-[4px_4px_0_var(--ink)]"
        >
          Jogar agora
        </Link>
        <Link
          href="/como-jogar"
          className="rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[var(--ink)]"
        >
          Como jogar
        </Link>
      </div>
    </main>
  );
}
