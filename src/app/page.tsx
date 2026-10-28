import { HomeApp } from "@/components/home/HomeApp";

export default function Home() {
  return (
    <>
      <noscript>
        <main style={{ maxWidth: 720, margin: "2rem auto", padding: 16 }}>
          <h1>Cadê Flavinho? — jogo satírico grátis</h1>
          <p>
            Ache o Flavinho na multidão, explore a Rua da Amargura no Street
            View ou descubra o parça da fuga. Ative o JavaScript para jogar em{" "}
            <a href="https://cadeflavinho.com.br">cadeflavinho.com.br</a>.
          </p>
        </main>
      </noscript>
      <HomeApp />
    </>
  );
}
