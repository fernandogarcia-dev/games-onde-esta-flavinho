const PRESS_LINKS = [
  {
    label: "Agência Brasil",
    href: "https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/policia-federal-cancela-passaportes-de-flavio-bolsonaro",
  },
  {
    label: "G1",
    href: "https://g1.globo.com/mundo/noticia/2026/10/27/suspeita-de-fuga-de-flavio-bolsonaro-repercute-na-imprensa-internacional.ghtml",
  },
] as const;

/** Rodapé jurídico: sátira / animus jocandi + fontes de amplo conhecimento público. */
export function LegalNotice() {
  return (
    <footer className="relative z-10 mt-6 border-t border-[var(--ink)]/10 bg-[var(--paper)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-3xl px-4 py-6 text-left text-xs leading-relaxed text-[var(--muted)] sm:px-6 sm:text-center">
        <p className="font-bold uppercase tracking-[0.14em] text-[var(--ink)]/70">
          Aviso de natureza artística e sátira humorística
        </p>
        <p className="mt-2">
          Este site é uma obra ficcional, lúdica e de sátira política/social,
          baseada exclusivamente em fatos e suspeitas de amplo conhecimento
          público, amplamente divulgados pela imprensa nacional e internacional
          (
          {PRESS_LINKS.map((link, i) => (
            <span key={link.href}>
              {i > 0 ? "; " : null}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--ink)]/25 underline-offset-2 hover:text-[var(--ink)]"
              >
                {link.label}
              </a>
            </span>
          ))}
          ).
        </p>
        <p className="mt-2">
          Não constitui veículo de notícia oficial, denúncia jurídica,
          biografia, campanha eleitoral ou manifestação partidária. O conteúdo
          está estritamente amparado pelo direito constitucional à paródia, à
          liberdade de expressão e à atividade artística (Art. 5º, IX, da
          Constituição Federal). Este projeto não possui a intenção ou o escopo
          de ofender a honra objetiva ou subjetiva de qualquer indivíduo
          retratado em formato de caricatura.
        </p>
        <p className="mt-2">
          Qualquer PIX é contribuição voluntária exclusiva à infraestrutura
          técnica e aos custos operacionais do desenvolvedor — sem vínculo com
          imagem de terceiros, partidos ou campanhas. Jogar é grátis.
        </p>
        <p className="mt-2 text-[10px] text-[var(--muted)]">
          Ilustração satírica / caricatura ficcional.
        </p>
      </div>
    </footer>
  );
}
