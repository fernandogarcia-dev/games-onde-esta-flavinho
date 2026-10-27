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

### Ranking global (Upstash)

Sem Redis o placar funciona **neste aparelho**. Pra ranking mundial:

1. No projeto na Vercel → **Storage** / Marketplace → **Upstash Redis** (plano free).
2. Conecte ao projeto — a Vercel injeta `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
3. Redeploy.

**Não preciso da senha da sua conta Vercel.** Você só importa o repo (ou conecta o GitHub). Se quiser que eu rode `vercel` daqui no futuro, aí sim um token de deploy (`vercel login` / token) — mas o caminho normal é Import no site.

CLI alternativa (se tiver a Vercel CLI logada):

```bash
npx vercel
npx vercel --prod
```

## Pontuação e timer

| Modo | Tempo pra achar | Pontos na mesa |
|---|---|---|
| Fácil | 5 min | começam em 5000 e caem com o relógio |
| Médio | 3 min | idem |
| Difícil | 1 min | idem |
| Surpresa | 3 min | idem |

Ao achar, o que sobrou na mesa **soma** no total do topo. Sequência de achados multiplica. Achado sem clique errado +400. Sem tempo = game over da caçada.

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
