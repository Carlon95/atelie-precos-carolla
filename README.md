# Ateliê de Preços — By Carolla

Next.js 16 + Supabase. Interface em português, verde-água, calculadora de custos, fotos privadas, produtos, vendas e estoque. Este diretório é a raiz para importar na Vercel.

Leia `GUIA-VERCEL-APK.md` para a configuração completa do Supabase, importação, Vercel e APK.

## Desenvolvimento

1. Use Node 22.x (22.13+).
2. Crie um projeto Supabase de teste, execute `supabase/schema.sql`, desative cadastro público e crie um usuário com e-mail confirmado.
3. Copie `.env.example` para `.env.local` e configure URL e chave publicável.
4. Execute `npm ci`, `npm run dev` e abra http://localhost:3000.
5. `npm run build` valida a versão de produção; `npm start` serve o build.

Não adicione service_role ao aplicativo. RLS isola cada usuário. Vendas e estoque são modificados por funções transacionais com checagem de identidade. Fotos usam bucket privado e limite de 3 MB.

## Teste isolado do banco

Opcional para desenvolvimento: `npm install --no-save --package-lock=false @electric-sql/pglite` e `node tests/database.mjs`. O teste cria um banco em memória e simula schemas de autenticação/storage. Não usa credenciais nem conecta ao Supabase real.

A geração do APK usa Bubblewrap sobre a URL publicada; não use `output: export`, pois o aplicativo depende de rotas de servidor. `scripts/assetlinks.mjs` configura a associação Android após você gerar sua chave.

## SKU e filtros

O SKU é opcional, tem até 64 caracteres e é único por conta (sem diferenciar maiúsculas e minúsculas). Espaços nas extremidades são removidos. Produtos existentes continuam sem SKU até serem editados.

- Banco novo: execute `supabase/schema.sql`.
- Banco existente: execute apenas `supabase/upgrade-sku.sql` no SQL Editor antes de publicar esta versão. Preserva produtos e vendas e pode ser executado novamente. Não execute o schema completo sobre um banco existente.
- Meus produtos e Estoque permitem combinar nome/SKU, categoria e estoque baixo (inclui saldo zerado e igual ao mínimo). O CSV de estoque inclui SKU e respeita os filtros; os indicadores mostram o estoque total.
- Testes de regras: `node --experimental-strip-types --test tests/product-filters.mjs`.
- Após instalar PGlite conforme acima: `node tests/database.mjs` e `node tests/sku-database.mjs`.
