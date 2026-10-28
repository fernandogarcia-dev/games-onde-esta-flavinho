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
          Cadê Flavinho? — jogo satírico grátis
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--muted)]">
          <strong className="text-[var(--ink)]">Cadê Flavinho?</strong> é um
          jogo de humor no navegador: siga as pistas, marque a cidade no mapa e
          ache o Flavinho escondido na multidão antes do tempo zerar. Tem
          ranking mundial, três modos de caçada e não precisa criar conta.
        </p>

        <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl">
          Como jogar
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          <li>Escolha a dificuldade (Fácil, Médio ou Difícil).</li>
          <li>Leia as pistas e chute a cidade — errar libera a próxima dica.</li>
          <li>Quando o mapa fecha, ache o Flavinho na multidão no relógio.</li>
          <li>Entre no ranking com um apelido único e desafie a galera.</li>
        </ol>

        <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl">
          Modos
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          <li>
            <strong className="text-[var(--ink)]">O Mestre dos Disfarces</strong>{" "}
            — clássico: pistas + mar de Flavinhos.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Rua da Amargura</strong> —
            Street View e um único pin no mapa-múndi.
          </li>
          <li>
            <strong className="text-[var(--ink)]">
              Diga-me com Quem Andas…
            </strong>{" "}
            — descubra quem o Flavinho levou na fuga.
          </li>
        </ul>

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
