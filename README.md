# Cadê Flavinho?

Jogo satírico / meme com **três modos**:

1. **O Mestre dos Disfarces** — pistas da cidade + ache ele na multidão.
2. **Rua da Amargura** — Google Street View → pin no mapa (Leaflet + OSM).
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

### Street View (Rua da Amargura)

1. [Google Cloud Console](https://console.cloud.google.com/) → criar projeto (e ligar billing; o crédito mensal grátis costuma bastar).
2. Ativar **Maps JavaScript API**.
3. Criar uma **API key**, restringir à Maps JavaScript API e aos seus domínios (`localhost`, `cadeflavinho.com.br`, etc.).
4. No `.env.local` (e na Vercel):

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

5. Reiniciar o `npm run dev` (ou redeploy).

## SEO

- `sitemap.xml` e `robots.txt` gerados pelo Next (`src/app/sitemap.ts`, `robots.ts`)
- JSON-LD (WebApplication + FAQ) em todas as páginas
- Páginas de conteúdo: `/como-jogar`, `/sobre`
- No [Google Search Console](https://search.google.com/search-console): adicione `cadeflavinho.com.br`, verifique (use `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` se precisar) e envie o sitemap `https://cadeflavinho.com.br/sitemap.xml`

Ninguém controla o 1º lugar do Google só com código: backlinks, buscas reais e tempo também pesam. O técnico está pronto pra competir.

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

1. No Supabase → **SQL Editor** → rode `supabase/migrations/001_leaderboard.sql`
2. Depois rode também `supabase/migrations/002_leaderboard_device.sql` (trava apelido por aparelho — evita print falso de 1º lugar)
3. **Project Settings → API** → copie:
   - `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (só server / Vercel env — nunca no browser)
4. Na Vercel (e no `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL=https://elpxkbcnaexbkyynclaf.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
5. Redeploy

A API `/api/rank` grava/lê a tabela `leaderboard` (nome + pontuação + `device_key`). É ranking **mundial**, com apelido amarrado ao aparelho.

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
