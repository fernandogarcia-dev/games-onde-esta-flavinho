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

## Modo 2 — Rua da Amargura

1. **Street View** (Google Maps JavaScript API) — panorama 360°, sem labels de rua.
2. **Mapa de chute** Leaflet + OpenStreetMap.
3. Mesmas cidades/tiers do modo 1: Fácil 24 · Médio 56 · Difícil 124.
4. Pontuação por distância (km) do alvo.

Dados de cidade: `src/lib/city-geo-data.json`.  
Chave: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (ver README).

---

## Modo 3 — Diga-me com Quem Andas…

- 150 figuras reais conhecidas no Brasil.
- Até 3 dicas fáceis / médias / difíceis por personagem.
- Na partida: libera dicas conforme erros; dificuldade escolhe o tom das dicas.
- Lista: `docs/parcas-draft.json` (= `src/lib/parcas-data.json`).

---

## Cadastro de serviços?

- Modo 1 e 3: não.
- Modo 2 (Street View): **sim** — API key no Google Cloud (Maps JavaScript API). Billing ligado no projeto; uso típico cabe no crédito grátis.
