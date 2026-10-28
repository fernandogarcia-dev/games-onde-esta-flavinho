# Cadê Flavinho?

Jogo satírico / meme com **três modos**:

1. **O Mestre dos Disfarces** — pistas da cidade + ache ele na multidão.
2. **Rua da Amargura** — foto da rua → marca no mapa (Leaflet + OSM, sem cadastro).
3. **Diga-me com Quem Andas…** — dicas meme pra achar o parça da fuga (150 nomes).

Site publicado (modo clássico): [cadeflavinho.com.br](https://cadeflavinho.com.br)

> Os modos 2 e 3 estão em teste **local**. Não sobem online até OK explícito.

> Obra ficcional de sátira humorística. Não é notícia, denúncia, biografia, campanha eleitoral nem afiliação partidária.
> Qualquer PIX cobre só infraestrutura/custos do desenvolvedor — sem vínculo com imagem de terceiros, partidos ou campanhas.
> Ilustração satírica / caricatura ficcional.

## PIX

Chave: `cadeflavinho@gmail.com`  
Contribuição voluntária (valor livre) para manutenção do servidor e custos operacionais do desenvolvedor.
Sem valores predefinidos, sem cobrança por dica. O jogo continua 100% gratuito.

## Rodar local

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 43127
```

Abra [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Deploy na Vercel

1. Repo: `fernandogarcia-dev/games-onde-esta-flavinho`
2. [vercel.com/new](https://vercel.com/new) → Import o repositório
3. Environment Variables:
   - `NEXT_PUBLIC_PIX_KEY` = `cadeflavinho@gmail.com`
   - `NEXT_PUBLIC_PIX_NAME` = `Cadê Flavinho`
   - `NEXT_PUBLIC_GA_ID` = `G-5C6WTLVDH2`
4. Deploy
5. Domains → Add `cadeflavinho.com.br` (+ `www` se quiser)

### Ranking global (Supabase)

Projeto: **CadeFlavinho** → `https://elpxkbcnaexbkyynclaf.supabase.co`

1. No Supabase → **SQL Editor** → cole e rode `supabase/migrations/001_leaderboard.sql`
2. **Project Settings → API** → copie:
   - `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (só server / Vercel env — nunca no browser)
3. Na Vercel (e no `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL=https://elpxkbcnaexbkyynclaf.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
4. Redeploy

A API `/api/rank` grava/lê a tabela `leaderboard` (nome + pontuação). É ranking **mundial**, não por aparelho.

## DNS no Registro.br (`cadeflavinho.com.br`)

Depois de adicionar o domínio no projeto Vercel, use **um** destes caminhos:

### Opção A — Nameservers da Vercel (mais simples)

No Registro.br → Domínio → DNS / Servidores DNS → troque para os nameservers que a Vercel mostrar (exemplo típico):

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

(Confirme os valores exatos na tela Domains da Vercel.)

### Opção B — Manter DNS no Registro.br (registros)

Na zona DNS do Registro.br, crie:

| Tipo | Nome / Host | Valor |
|---|---|---|
| **A** | `@` (em branco / domínio raiz) | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

Se a Vercel pedir um registro de verificação (TXT ou CNAME `_vercel`), copie exatamente o que ela mostrar.

Propagação: minutos a algumas horas.

## Dificuldade e cidades

| Modo | Cidades no mapa | Observação |
|---|---|---|
| Fácil | 24 | países distintos |
| Médio (padrão) | 56 | pode repetir país em países grandes |
| Difícil | 124 | países podem ou não se repetir |

Pistas usam marcas famosas e reconhecíveis (nunca charadas).

## Pontuação e timer

| Modo | Tempo pra achar | Pontos na mesa (t=0) |
|---|---|---|
| Fácil | 5 min | 1000 (caem com o relógio) |
| Médio | 3 min | 2000 |
| Difícil | 1 min | 3000 |

## Stack

- Next.js + TypeScript + Tailwind
- Google Analytics (`G-5C6WTLVDH2`)
- Sem banco / sem login (ranking local; Upstash opcional pro global)
