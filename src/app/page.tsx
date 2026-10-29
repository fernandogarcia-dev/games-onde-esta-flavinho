import type { Metadata } from "next";
import { HomeApp } from "@/components/home/HomeApp";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
};

export default function Home() {
  return (
    <>
      <noscript>
        <main style={{ maxWidth: 720, margin: "2rem auto", padding: 16 }}>
          <h1>Cadê Flavinho? — jogue grátis e ache ele agora</h1>
          <p>
            Sumiu de novo. Ache o Flavinho na multidão, no Street View ou
            descubra o parça da fuga. Ative o JavaScript para jogar em{" "}
            <a href="https://cadeflavinho.com.br">cadeflavinho.com.br</a>.
          </p>
        </main>
      </noscript>
      {/* Texto cedo no HTML pra Google não inventar snippet das dificuldades */}
      <p className="sr-only">
        {SITE_DESCRIPTION} Jogue Cadê Flavinho grátis no navegador — três modos
        e ranking mundial, sem criar conta.
      </p>
      <HomeApp />
    </>
  );
}
