# Cadê Flavinho — 3 modos (local)

> Nada disso sobe online até você falar que está **BOM**.

## Nomes oficiais

| Modo | Nome | Tagline |
|------|------|---------|
| 1 | **O Mestre dos Disfarces** | Ache o Flavinho na multidão |
| 2 | **Rua da Amargura** | Olha a foto. Marca no mapa. |
| 3 | **Diga-me com Quem Andas…** | Quem tava com ele na fuga? |

**Ranking:** 1 placar por modo. O ranking mundial do modo 1 permanece intacto. Modos 2 e 3 usam ranking local (por enquanto).

---

## Modo 2 — Rua da Amargura (MVP)

Sem cadastro, sem Google pago:

1. **Mapa** Leaflet + OpenStreetMap (pin no mapa-múndi).
2. **Foto** por cidade via Wikimedia (estático).
3. Mesmas cidades/tiers do modo 1: Fácil 24 · Médio 56 · Difícil 124.
4. Pontuação por distância (km) do alvo.

Dados: `src/lib/city-geo-data.json`.

---

## Modo 3 — Diga-me com Quem Andas…

- 150 figuras reais conhecidas no Brasil.
- Até 3 dicas fáceis / médias / difíceis por personagem.
- Na partida: libera dicas conforme erros; dificuldade escolhe o tom das dicas.
- Lista: `docs/parcas-draft.json` (= `src/lib/parcas-data.json`).

---

## Cadastro de serviços?

**Não**, para este MVP local. Não precisa Mapillary / Google / nada pago.
