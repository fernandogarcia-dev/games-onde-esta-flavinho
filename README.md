# Onde Está Flavinho?

Jogo satírico / meme: siga o rastro, marque a cidade, ache ele na multidão.

1. Recortes e pistas levam a uma cidade.
2. Se o mapa fechar, ele ainda está escondido na multidão.
3. Apoio voluntário via PIX (opcional). Dicas também.

> Humor/sátira. Não é notícia, denúncia, campanha eleitoral nem afiliação política.

## PIX é legal?

**Resposta curta:** apoio voluntário (“manda um café”) via PIX pra um jogo de humor/sátira, **jogável de graça**, costuma ser ok na prática no Brasil. Isso **não** é aconselhamento jurídico.

Em linhas gerais:

- PIX de apoio entre adultos ≠ rifa, aposta, crowdfunding de caridade nem doação eleitoral.
- Não finja ser ONG, não prometa prêmio, não cobre como se fosse obrigação.
- Se o volume crescer: fale com contador (IR / MEI) e, se quiser blindagem, com advogado (sátira política + responsabilidade civil).

## Rodar local

```bash
npm install
cp .env.example .env.local
# edite NEXT_PUBLIC_PIX_KEY com sua chave PIX real
npm run dev -- --port 43127
```

Abra [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Como subir na Vercel

1. Crie o repo no GitHub/GitLab (se ainda não tiver) e faça push deste código.
2. Em [vercel.com/new](https://vercel.com/new) → **Import** o repositório.
3. Framework: Next.js (detecta sozinho). Build: `npm run build`.
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_PIX_KEY` = sua chave PIX real
   - `NEXT_PUBLIC_PIX_NAME` = nome que aparece no painel
5. Clique **Deploy**. Em ~1 minuto você ganha uma URL `*.vercel.app`.
6. (Opcional) Settings → Domains → Add → cole o domínio que **você** comprou e siga o DNS.

CLI alternativa (se tiver a Vercel CLI logada):

```bash
npx vercel
npx vercel --prod
```

## Domínio: eu NÃO comprei

Nenhum domínio foi comprado daqui. Só listei opções baratas e disponíveis na época (veja `DOMAINS.md`). Compra = cartão/PayPal seu no registrador.

| Prioridade | Domínio | Por quê | Preço aproximado |
|---|---|---|---|
| 1 | **ondeestaflavinho.com** | Melhor marca, fácil de falar no Zap | ~US$ 10–15/ano |
| 2 | **cadeflavinho.lol** | Barato, meme, BR demais | ~US$ 1.50–2 no 1º ano |
| 3 | **ondeestaflavinho.fun** | Barato e claro | ~US$ 2.50–4 no 1º ano |

**Onde comprar:** [Porkbun](https://porkbun.com) ou [Namecheap](https://www.namecheap.com).  
Sugestão: `cadeflavinho.lol` (barato) + `ondeestaflavinho.com` (marca). Aponte os dois pra Vercel.

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
