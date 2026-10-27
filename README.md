# Onde Está Flavinho?

Jogo satírico / meme: siga o rastro, marque a cidade, ache ele na multidão.

1. Recortes e pistas levam a uma cidade.
2. Se o mapa fechar, ele ainda está escondido na multidão.
3. Apoio voluntário via PIX (opcional). Dicas também.

> Humor/sátira. Não é notícia, denúncia, campanha eleitoral nem afiliação política.

## PIX e legalidade (resumo prático)

Isso **não** é aconselhamento jurídico. Em linhas gerais, no Brasil:

- **Apoio voluntário / “café” via PIX** pra conteúdo de humor costuma ser tratado como liberalidade entre adultos, desde que não se finja ser instituição de caridade, rifa, aposta ou doação eleitoral.
- O jogo deve continuar **jogável de graça** (o app já é).
- Se o volume crescer, fale com contador (declaração IR / possível MEI) e, se quiser blindagem, com advogado (sátira política + responsabilidade civil).
- Evite: sorteio sem autorização, prometer prêmio, se passar por ONG, ou cobrar como se fosse serviço essencial sem entrega clara.

## Rodar local

```bash
npm install
cp .env.example .env.local
# edite NEXT_PUBLIC_PIX_KEY com sua chave PIX real
npm run dev -- --port 43127
```

Abra [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Deploy na Vercel (rápido)

1. Suba o repo na Vercel (Import Git Repository).
2. Em **Environment Variables**, coloque:
   - `NEXT_PUBLIC_PIX_KEY` = sua chave PIX
   - `NEXT_PUBLIC_PIX_NAME` = nome que aparece no painel
3. Deploy.
4. Em **Domains**, aponte o domínio que você comprou.

## Domínios recomendados (baratos e bons)

Checados via RDAP como **disponíveis** neste momento (confirme no registrador antes de pagar):

| Prioridade | Domínio | Por quê | Preço aproximado |
|---|---|---|---|
| 1 | **ondeestaflavinho.com** | Melhor marca, fácil de falar no Zap | ~US$ 10–15/ano |
| 2 | **cadeflavinho.lol** | Barato, meme, BR demais | ~US$ 1.50–2 no 1º ano |
| 3 | **ondeestaflavinho.fun** | Barato e claro | ~US$ 2.50–4 no 1º ano |
| 4 | **achaflavinho.fun** | CTA no domínio | ~US$ 2.50–4 no 1º ano |
| 5 | **flavinhofugiu.lol** | Hook da notícia | ~US$ 1.50–2 no 1º ano |

**Onde comprar:** [Porkbun](https://porkbun.com) ou [Namecheap](https://www.namecheap.com).  
**Sugestão prática agora:** compre `cadeflavinho.lol` (barato) **e** `ondeestaflavinho.com` (marca). Aponte os dois pra Vercel.

DNS na Vercel: adicione o domínio no projeto → copie os nameservers/records que a Vercel mostrar → cole no registrador.

## Monetização em minutos (sem esperar AdSense)

AdSense demora dias pra aprovar. Pra dinheiro **hoje**:

1. **PIX** (já no app): copie a chave, peça apoio / dica R$ 2.
2. Compartilhamento WhatsApp (viral loop).
3. Depois: Mercado Pago Checkout / Stripe Payment Link pra dica automática.
4. Mais tarde: AdSense / Taboola nos slots.

Fluxo sugerido nas primeiras horas:

1. Deploy Vercel + PIX real.
2. Compre o domínio.
3. Poste em Twitter/X, TikTok, Stories, grupos: “Cadê o Flavinho? Eu fiz o jogo”.
4. CTA fixo: “Se riu, manda um PIX”.

## Stack

- Next.js + TypeScript + Tailwind
- Cenas cartoon geradas + overlay procedural de multidão (níveis rejogáveis)
- Sem banco / sem login (ship rápido)

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servir build
npm run lint     # lint
```
