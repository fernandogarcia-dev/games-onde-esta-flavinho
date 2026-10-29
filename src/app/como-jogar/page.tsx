import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Como jogar",
  description:
    "Como jogar Cadê Flavinho: pistas da cidade, multidão com timer, Street View na Rua da Amargura e o modo Diga-me com Quem Andas. Guia rápido.",
  alternates: { canonical: `${SITE_URL}/como-jogar` },
  openGraph: {
    title: `Como jogar · ${SITE_NAME}`,
    description:
      "Guia rápido dos três modos do Cadê Flavinho — grátis no navegador.",
    url: `${SITE_URL}/como-jogar`,
  },
};

export default function ComoJogarPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
        Guia rápido
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
        Como jogar Cadê Flavinho
      </h1>
      <p className="mt-4 text-lg text-[var(--muted)]">
        Três caçadas. Um sumiço. Escolhe o modo e vai atrás — sem criar conta.
      </p>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          1. O Mestre dos Disfarces
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--muted)]">
          <li>Escolha Fácil, Médio ou Difícil.</li>
          <li>Leia as pistas e chute a cidade no mapa.</li>
          <li>Errou? Libera a próxima pista (e perde vida).</li>
          <li>Mapa fechou: ache o Flavinho na multidão antes do relógio zerar.</li>
          <li>Entre no ranking mundial com um apelido que ainda ninguém usou.</li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          2. Rua da Amargura
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          Uma rua no Street View. Gira, anda um pouco e marca{" "}
          <strong>um único chute</strong> no mapa-múndi. País errado = erro
          (mesmo perto da fronteira). País certo = acerto, e a distância diz se
          você cravou a rua, a cidade, a região ou só o país.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          3. Diga-me com Quem Andas…
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          O Flavinho não sumiu sozinho: ele{" "}
          <strong>levou um parça</strong> na fuga. Uma rodada, um suspeito
          certo. Menos dicas abertas = mais pontos.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[var(--brand)] px-4 py-2.5 font-[family-name:var(--font-display)] text-white shadow-[4px_4px_0_var(--ink)]"
        >
          Quero jogar
        </Link>
        <Link
          href="/sobre"
          className="rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[var(--ink)]"
        >
          Sobre
        </Link>
      </div>
    </main>
  );
}
