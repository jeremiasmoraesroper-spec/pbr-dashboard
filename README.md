# 🐂 PBR Brasil · Dashboard de Instagram

Wallboard (gestão à vista) do Instagram da **PBR Brazil** para a TV do escritório e para um link público que qualquer pessoa do time abre no celular ou computador. Mostra seguidores, ritmo de crescimento, engajamento, melhores posts, ranking de atletas e o **bloco META** (2 milhões de seguidores até 31/12/2026).

- ✅ Cabe em **uma tela só** (otimizado para TV Full HD e 4K), sem rolagem.
- ✅ Atualiza sozinho **na nuvem** (coleta 1x/dia via GitHub Actions) e o navegador se atualiza a cada **5 minutos**.
- ✅ **Link público** sem senha. Nenhuma chave de API fica exposta no navegador.
- ✅ Já vem com um **snapshot de dados REAIS** da PBR Brazil (puxado da Supermetrics) em `lib/real-data.json`.

> **Estados dos dados (nesta ordem de prioridade):**
> 1. **Supabase** (quando você conectar) → dados ao vivo, atualizados todo dia.
> 2. **Snapshot real** (`lib/real-data.json`) → dados reais de uma data específica. É o que aparece agora. **Não se atualiza sozinho** até você ligar o Supabase; os thumbnails do Instagram também expiram com o tempo.
> 3. **Seed** → dados de exemplo, só se o snapshot estiver vazio.
>
> O ranking "Menções que mais engajam" é extraído **automaticamente das @menções reais** das legendas (parceiros, eventos e atletas que vocês de fato marcam) — nada é inventado.

---

## 🗺️ Como funciona (visão geral)

```
GitHub Actions (cron diário, 06h BRT)
   → consulta a Supermetrics API (Instagram da PBR)
   → grava o snapshot do dia no Supabase (Postgres)
Next.js (Vercel) lê os dados já tratados via API route (server-side)
   → mostra no dashboard
   → o navegador se atualiza a cada 5 minutos
```

Por que guardar no Supabase? Porque o "total de seguidores" é um número **de hoje**. Guardando um snapshot por dia, montamos o histórico próprio e os gráficos de 7/30/90 dias continuam funcionando mesmo se a API mudar.

---

## 🚀 Parte 1 — Rodar no seu computador (ver o visual agora)

Você precisa ter o **Node.js 18 ou mais novo** instalado ([baixar aqui](https://nodejs.org)).

```bash
cd dashboard-pbr
npm install      # só na primeira vez
npm run dev
```

Abra **http://localhost:3000** no navegador. Pronto — o dashboard aparece com dados de exemplo.

Para ver em tela cheia na TV: abra esse endereço no navegador e aperte **F11**.

---

## 🔑 Parte 2 — Pegar a chave da Supermetrics API

1. Acesse **https://hub.supermetrics.com/token-management** (logado na conta que já tem o Instagram da PBR autenticado).
2. Crie/copie sua **API key**. Guarde — vamos usar como segredo (nunca colar no código).
3. Os parâmetros que o sistema já usa (não precisa mexer):
   - **Data source:** `IGI` (Instagram Insights)
   - **Conta (account_id):** `17841401478253574` (PBR Brazil)
   - **Timezone:** `America/Sao_Paulo`
   - **Campos coletados:**
     - Total: `followers_count`, `follows_count`, `media_count` (+ `username`, `name`)
     - Série diária: `date`, `follower_count`, `reach`, `profile_views`
     - Posts: `media_id`, `timestamp`, `media_type`, `media_product_type`, `media_permalink`, `media_caption`, `media_thumbnail_url`, `media_like_count`, `media_comments_count`, `media_views`, `media_reach`, `media_saved`, `media_shares`, `interactions`

> ⚠️ O campo `follower_count` (novos seguidores/dia) **tem atraso de ~7 dias** e não traz o dia de hoje. O sistema já trata isso: ignora os dias sem dado e mostra o rótulo "Seguidores até DD/MM" no topo.

---

## 🗄️ Parte 3 — Criar o banco no Supabase

1. Crie uma conta grátis em **https://supabase.com** e clique em **New project**.
2. Escolha um nome (ex.: `pbr-dashboard`) e uma senha para o banco. Aguarde criar (~2 min).
3. No menu lateral vá em **SQL Editor** → **New query**, cole o conteúdo do arquivo
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e clique em **Run**.
   Isso cria as tabelas `daily_snapshots`, `posts` e `athletes`.
4. (Opcional, recomendado) Rode também [`supabase/seed_athletes.sql`](supabase/seed_athletes.sql)
   para cadastrar os atletas do ranking. **Edite os nomes/@/hashtags** conforme sua lista real.
5. Pegue as chaves em **Project Settings → API**:
   - **Project URL** → vira `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → vira `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (SECRETA, clique para revelar) → vira `SUPABASE_SERVICE_ROLE_KEY`

### Variáveis de ambiente (local)

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPERMETRICS_API_KEY=sua_chave_supermetrics
SUPERMETRICS_ACCOUNT_ID=17841401478253574
SUPERMETRICS_DS_ID=IGI
```

> O arquivo `.env.local` **nunca** vai para o GitHub (já está no `.gitignore`).

---

## 🧪 Parte 4 — Testar a coleta

Antes de gravar de verdade, faça um teste que só imprime na tela (não grava nada):

```bash
npm run collect -- --dry-run
```

Se aparecer o total de seguidores e um exemplo de post, está funcionando. Agora rode a coleta de verdade (grava no Supabase):

```bash
npm run collect
```

Recarregue o dashboard — a etiqueta "Dados de exemplo" deve sumir e os números reais aparecem.

> Quer só popular o banco com os dados de exemplo para testar tudo de ponta a ponta antes da API? Use `npm run seed:db`.

---

## ⏰ Parte 5 — Automatizar na nuvem (GitHub Actions)

1. Crie um repositório no GitHub e suba o projeto:
   ```bash
   git init && git add . && git commit -m "PBR dashboard"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```
2. No GitHub, vá em **Settings → Secrets and variables → Actions → New repository secret** e cadastre **um por um**:
   - `SUPERMETRICS_API_KEY`
   - `SUPERMETRICS_ACCOUNT_ID` → `17841401478253574`
   - `SUPERMETRICS_DS_ID` → `IGI`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Pronto. O arquivo [`.github/workflows/collect.yml`](.github/workflows/collect.yml) já roda **todo dia às 06h (BRT)**.
   Para rodar na hora e testar: aba **Actions** → "Coleta diária..." → **Run workflow**.

---

## 🌐 Parte 6 — Publicar na Vercel (gera o link público)

1. Crie conta em **https://vercel.com** e clique em **Add New → Project**, importando seu repositório do GitHub.
2. Em **Environment Variables**, cadastre as mesmas variáveis (menos as do Supermetrics, que só o GitHub usa):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Clique em **Deploy**. Em ~1 min você recebe um link público tipo
   `https://pbr-dashboard.vercel.app` — é esse que você abre na TV e compartilha com o time.

> Esse link é **só leitura** e não expõe nenhuma chave: o navegador conversa apenas com a API route do próprio site, que roda no servidor.

---

## 🔁 Parte 7 — Trocar o seed pelos dados reais

Não precisa mexer em código. Assim que o Supabase tiver dados (depois de rodar `npm run collect` ou o GitHub Action), o dashboard usa os dados reais **automaticamente** e some a etiqueta "Dados de exemplo". Se o banco estiver vazio, ele volta ao seed para a TV nunca ficar em branco.

---

## 🛠️ Personalização

- **Atletas do ranking:** edite a tabela `athletes` no Supabase (ou o `supabase/seed_athletes.sql`). O sistema cruza `@instagram`, `hashtags` e o nome com a legenda dos posts. Comece simples e ajuste.
- **Meta e prazo:** mude `GOAL_TARGET` e `GOAL_DATE` nas variáveis de ambiente (padrão: 2.000.000 e 2026-12-31).
- **Logo oficial:** coloque o arquivo em `public/logo-pbr.png` e troque o componente em [`components/Logo.tsx`](components/Logo.tsx) por uma `<img src="/logo-pbr.png" />`.
- **Cores:** paleta em [`tailwind.config.ts`](tailwind.config.ts).

---

## 🧩 Opção B (low-code): Supermetrics → Google Sheets

Se preferir não usar a API + Supabase, dá para usar o **conector Supermetrics para Google Sheets**:

1. Instale o add-on Supermetrics no Google Sheets e conecte o Instagram da PBR (data source IGI, conta PBR Brazil).
2. Monte as abas com os mesmos campos acima e configure **atualização agendada diária**.
3. Publique a planilha e faça o dashboard ler dela (ex.: via API do Google Sheets numa API route).

É mais simples de configurar, mas **menos robusto** (depende do Sheets, menos controle sobre o histórico e o visual). Por isso o caminho recomendado é o principal (API + Supabase), que gera um dashboard customizado e bonito de verdade.

---

## 📊 O que cada parte mostra

| Seção | O que é |
|---|---|
| **Destaque** | Seguidores atuais + barra de progresso até 2M |
| **Status da Meta** | Necessário/dia, ritmo atual, projeção para 31/12, status (verde/amarelo/vermelho) |
| **KPIs** | Ganhos 7d/30d, média/dia, posts, frequência, engajamento, alcance, views de perfil |
| **Crescimento** | Linha real × trajetória ideal até a meta |
| **Posts × engajamento** | Barras de engajamento por dia + linha de nº de posts |
| **Engajamento por tipo** | Reel × Carrossel × Imagem |
| **Top conteúdo** | 3 melhores posts (miniatura, tipo, números, link) |
| **Atletas** | Ranking de quem mais gera engajamento quando aparece |
| **Melhor dia/horário** | Heatmap por dia da semana e faixa horária |

> Taxa de engajamento = (curtidas + comentários + salvamentos + compartilhamentos) ÷ alcance dos posts do período.

---

## 🆘 Problemas comuns

- **"followers_count veio vazio"** ao rodar a coleta → a `SUPERMETRICS_API_KEY` está errada/expirada, ou a conta não tem permissão. Gere outra em token-management.
- **Dashboard continua mostrando "Dados de exemplo"** → o Supabase está vazio ou as variáveis estão erradas. Rode `npm run collect` e confira `.env.local`.
- **Gráfico de novos seguidores "caindo" no fim** → é o atraso de ~7 dias da API; o sistema ignora esses dias. Veja o rótulo "Seguidores até DD/MM".
