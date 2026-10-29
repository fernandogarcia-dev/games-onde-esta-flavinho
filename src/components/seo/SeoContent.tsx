import Link from "next/link";

/** Conteúdo server-rendered pra crawlers (e pra quem quiser ler). */
export function SeoContent() {
  return (
    <section
      aria-label="Sobre o jogo Cadê Flavinho"
      className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6"
    >
      <article className="rounded-[1.5rem] border-2 border-[var(--ink)]/15 bg-[var(--paper)]/90 px-5 py-6 text-[var(--ink)] shadow-[4px_4px_0_rgba(11,19,32,0.08)] sm:px-8 sm:py-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">
          Cadê Flavinho? Jogue grátis agora
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--muted)]">
          <strong className="text-[var(--ink)]">Cadê Flavinho?</strong> é o
          jogo satírico pra achar o sumido: na multidão de disfarces, no Street
          View da Rua da Amargura ou descobrir quem ele levou na fuga. Ranking
          mundial, zero cadastro — abre e joga no navegador.
        </p>

        <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl">
          Por que jogar
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          <li>Três modos diferentes, uma só obsessão: achar o Flavinho.</li>
          <li>Placar mundial por modo — sobe com apelido e desafia a galera.</li>
          <li>100% grátis, sem login, no celular ou no PC.</li>
        </ul>

        <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl">
          Como começar
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          <li>Escolhe um modo na home (Disfarces, Rua ou Parça).</li>
          <li>Entra no placar com um apelido — ou joga solto e salva depois.</li>
          <li>Acerta, soma pontos e sobe no ranking mundial daquele modo.</li>
        </ol>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Obra ficcional de sátira humorística. Sem vínculo com partidos ou
          campanhas.{" "}
          <Link
            href="/como-jogar"
            className="font-semibold text-[var(--brand)] underline-offset-2 hover:underline"
          >
            Guia de como jogar
          </Link>
          {" · "}
          <Link
            href="/sobre"
            className="font-semibold text-[var(--brand)] underline-offset-2 hover:underline"
          >
            Sobre o projeto
          </Link>
        </p>
      </article>
    </section>
  );
}
