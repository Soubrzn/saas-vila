# SaaS Vila

Sistema SaaS para pequenos comércios controlarem vendas, estoque, clientes e fiado com Next.js, Supabase e Vercel.

## Stack

- Next.js 16 com App Router
- React 19
- Supabase Auth, Database, RLS e RPCs
- Tailwind CSS 4
- Vercel para deploy

## Configuração local

1. Instale as dependências:

```bash
npm ci
```

2. Crie o arquivo `.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

3. Preencha as variáveis do Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

Se o projeto Supabase ainda usa chave anon, use `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4. Rode o app:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Banco de dados

As migrations ficam em `db/migrations` e criam:

- lojas e membros
- produtos e estoque
- clientes
- vendas e itens
- fiados e pagamentos
- funções RPC para venda, pagamento e movimentação de estoque
- políticas RLS para isolar dados por loja

Aplique as migrations no Supabase SQL Editor ou via Supabase CLI, mantendo a ordem numérica dos arquivos.

## Deploy na Vercel

Configure no projeto da Vercel as mesmas variáveis usadas localmente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Depois faça o deploy normalmente pelo GitHub. O build valida TypeScript e renderiza as rotas autenticadas dinamicamente, porque elas dependem da sessão Supabase.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Observações de segurança

- Não use service role key no frontend.
- Mantenha RLS ativo nas tabelas públicas.
- Faça alterações de estoque e vendas pelas RPCs versionadas.
- Não commite `.env.local` nem chaves reais.
