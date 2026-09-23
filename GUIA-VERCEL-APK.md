# By Carolla — publicar na Vercel e gerar um APK

Preparado em 23/09/2026.

O projeto foi adaptado para Next.js na Vercel, com Supabase para login, banco e fotos privados. Inclui o visual verde-água, precificação, calculadora, produtos com foto, controle de estoque, registro/cancelamento de vendas e relatórios com CSV.

**Situação:** código compilado localmente; publicação na Vercel ainda pendente. A conexão disponível não deu acesso a uma equipe para publicar. Nenhuma conta, plano pago ou projeto Supabase foi criado. O site atual continua funcionando separadamente. Ainda será necessário validar login, fotos e operações na nova hospedagem após configurar sua conta.

## 1. O que há no pacote

- `site/`: código para enviar ao GitHub e importar na Vercel.
- `site/supabase/schema.sql`: cria tabelas, regras de acesso, operações de estoque e armazenamento privado de fotos.
- `dados-privados/importar-produtos.sql`: cópia do cadastro consultado nesta sessão: 1 produto, sem fotos e sem vendas. Guarda custos privados; não envie essa pasta ao GitHub.
- Este guia, com a publicação e a geração do APK.

Essa cópia é pontual. Alterações feitas no site antigo depois da extração não serão sincronizadas. Confira os dados antes de começar a usar a nova versão e escolha uma única versão para registrar as próximas vendas.

## 2. Preparar contas e ferramentas

Você precisa de acesso ao GitHub, à Vercel e ao Supabase. Para o APK, use um computador Windows, macOS ou Linux e um Android para testar.

Como este aplicativo atende uma loja, use um plano da Vercel que permita uso comercial, como o Pro. O Hobby é destinado a uso pessoal não comercial. Confira as condições e os valores no painel antes de contratar. Nenhuma contratação foi feita aqui.

Instale Node.js 22 LTS atualizado (22.13 ou superior dentro da versão 22) e GitHub Desktop. O Android será preparado depois; não é necessário instalar Android Studio para publicar o site.

## 3. Criar o banco, as fotos e o login

1. Entre em https://supabase.com/dashboard e crie um **novo projeto exclusivo** para o Ateliê. Guarde a senha do banco. Não reutilize o banco de outro sistema.
2. Abra o **SQL Editor**. Cole todo o conteúdo de `site/supabase/schema.sql` e execute uma única vez. Ele cria `products`, `sales`, funções de movimentação e o bucket privado `product-photos`. Se houver erro, não continue com uma instalação parcial; o arquivo é executado em transação.
3. Em **Authentication → Sign In / Providers** (ou configurações de autenticação), mantenha login por e-mail e senha e **desative novos cadastros públicos**. Os nomes exatos dos menus podem variar.
4. Em **Authentication → Users → Add user → Create new user**, crie seu usuário com e-mail e uma senha forte. Use confirmação automática do e-mail para essa conta criada por você.
5. Copie o UUID desse usuário. Ele será usado apenas na importação dos dados abaixo.
6. Em **Connect** ou **Project Settings → API Keys**, copie a **Project URL** e a **Publishable key**. O projeto não precisa da chave `service_role` nem de uma chave secreta no site.

O site não tem cadastro público nem recuperação automática de senha nesta versão. A administração das contas fica no Supabase. Cada usuário tem seus próprios produtos e vendas; criar outra conta não compartilha automaticamente o estoque da primeira.

### Importar o cadastro existente

1. Abra `dados-privados/importar-produtos.sql` no computador.
2. Substitua `SUBSTITUA-PELO-UUID-DO-USUARIO` pelo UUID copiado em Authentication. Mantenha as aspas.
3. Execute esse arquivo no SQL Editor, depois de executar o schema.
4. Confira em Table Editor → products se o produto aparece vinculado ao seu usuário.

O arquivo conserva os custos e o estoque da cópia. Reexecutá-lo não duplica produtos nem sobrescreve alterações, pois ignora IDs já existentes. Se você atualizou a loja antiga depois da cópia, ajuste esses dados antes de começar a operar na nova versão.

## 4. Colocar o código no GitHub

1. Extraia o ZIP.
2. No GitHub Desktop, escolha **File → New repository**. Nome sugerido: `atelie-precos-carolla`.
3. Abra a pasta criada e copie para dentro dela **o conteúdo da pasta `site`**, inclusive `.gitignore` e `.env.example`. O `package.json` deve ficar na raiz do repositório.
4. Não copie a pasta `dados-privados`, arquivos `.env.local` nem chaves de assinatura Android.
5. Faça o primeiro commit e clique em **Publish repository**, mantendo o repositório **privado**.

## 5. Publicar na Vercel

1. Entre em https://vercel.com/new e selecione sua equipe com plano adequado para uso comercial.
2. Conecte o GitHub e importe `atelie-precos-carolla`.
3. Use **Framework Preset: Next.js** e **Root Directory: `./`**.
4. Configure **Node.js: 22.x**. Use instalação `npm ci`, build `npm run build` e mantenha o diretório de saída padrão do Next.js. Não use exportação estática nem escolha `dist`.
5. Antes de publicar, adicione estas variáveis para **Production**:

| Nome | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | A Project URL do seu Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | A Publishable key do mesmo projeto |

6. Clique em **Deploy** e espere o status **Ready**.
7. Abra a URL de produção. Ela deve mostrar a tela de login. Entre com a conta criada no Supabase.
8. No Supabase, em **Authentication → URL Configuration**, configure a **Site URL** com essa URL HTTPS definitiva.
9. Se alterar variáveis depois do primeiro deploy, faça **Redeploy** para incorporá-las.

Para ambientes Preview/Development, use outro projeto Supabase de testes. Não vincule automaticamente os previews ao banco real da loja. Sem essas variáveis os previews não poderão acessar o aplicativo, o que é esperado até configurar o ambiente de teste.

O banco e as fotos ficam no Supabase, portanto não são apagados quando a Vercel publica uma nova versão do código. Backups desses dados precisam ser gerenciados separadamente do repositório.

### Conferência antes de usar na loja

- Em janela anônima, confirme que `/` pede login e `/api/products` não exibe dados.
- Entre, confira o cadastro importado e cadastre uma peça temporária com foto JPG/PNG/WebP de até **3 MB**.
- Atualize a página para conferir que os dados persistiram.
- Ajuste o estoque da peça temporária para 5, venda 2 e confira saldo 3.
- Cancele a venda e confira saldo 5. O cancelamento não deve devolver o estoque duas vezes.
- Confira o relatório e o CSV; vendas canceladas ficam no histórico, mas não nos totais.
- Teste **Sair** e confirme que os dados deixam de estar acessíveis.

Vendas, mesmo canceladas, impedem a exclusão de um produto para preservar o histórico. Faça testes descartáveis preferencialmente no ambiente separado. A foto foi limitada a 3 MB para ficar abaixo do limite de 4,5 MB de corpo das funções Vercel, com espaço para os demais campos.

### Problemas comuns

| Sintoma | O que conferir |
| --- | --- |
| Erro ao abrir ou entrar | URL/chave do mesmo Supabase, variáveis em Production e novo deploy |
| Login recusado | Conta criada, e-mail confirmado e senha correta |
| Lista vazia após importação | UUID de `owner` igual ao UUID da conta usada |
| Erro de tabela/função | Execução completa de `supabase/schema.sql` no projeto correto |
| Foto não salva | Até 3 MB, formato permitido, bucket e políticas criados pelo schema |
| Preview não abre | Variáveis próprias de Preview e projeto Supabase de testes |

## 6. Preparar o endereço definitivo para o APK

O APK será uma **Trusted Web Activity (TWA)**: abre seu site como aplicativo Android, usando o navegador compatível do aparelho. Não converte o servidor Next.js em um programa Android offline. Precisa de internet para login, fotos, vendas e estoque.

Use um domínio estável: seu domínio próprio ou o endereço principal de produção `...vercel.app`. Não use URL temporária de um deploy, preview protegido ou o endereço antigo `chatgpt.site`.

Já estão incluídos:

- `/manifest.webmanifest`: nome, cores e ícones do aplicativo;
- ícones PNG de 192 e 512 pixels;
- aviso de falta de conexão;
- `/.well-known/assetlinks.json`, inicialmente vazio, para receber a assinatura real.

Abra o manifesto em uma janela anônima para confirmar que ele está acessível sem login. A página de login pode ser pública; os produtos e APIs continuam protegidos. O service worker não guarda páginas autenticadas, fotos ou respostas de API no cache offline.

## 7. Gerar o APK com Bubblewrap

### Instalar e iniciar

No Terminal/PowerShell, execute:

```sh
npm install -g @bubblewrap/cli
mkdir carolla-android
cd carolla-android
bubblewrap init --manifest=https://SEU-DOMINIO/manifest.webmanifest
```

Substitua `SEU-DOMINIO` pelo host de produção completo, por exemplo `seu-projeto.vercel.app`, sem repetir `https://`. Na primeira execução, aceite os downloads do JDK e das ferramentas Android oferecidos pelo Bubblewrap.

No assistente, confira:

| Campo | Valor sugerido |
| --- | --- |
| Nome | Ateliê de Preços — By Carolla |
| Nome curto | By Carolla |
| Application ID / Package ID | `br.com.bycarolla.atelie` |
| Host | O mesmo domínio do manifesto |
| Start URL | `/` |
| Display | `standalone` |
| Cor | `#268f80` |
| Ícone | O ícone informado pelo manifesto |

Quando solicitar a chave de assinatura, crie uma nova chave para esse aplicativo. Anote o caminho do arquivo `.keystore`, o alias e a senha. Guarde uma cópia segura fora do GitHub; mantenha a mesma chave para futuras atualizações. Não envie a senha ou a chave em conversas.

### Compilar

Ainda na pasta `carolla-android`:

```sh
bubblewrap build
```

Informe as senhas solicitadas. Ao concluir, procure **`app-release-signed.apk`** no local indicado. Esse é o arquivo para instalação direta no Android. Nenhum APK assinado foi gerado nesta entrega: ele depende do seu domínio definitivo e de sua chave.

## 8. Vincular o APK ao site

Sem essa etapa, o aplicativo pode abrir com a barra do navegador.

1. No computador, obtenha a impressão digital SHA-256 da chave usada para assinar:

```sh
keytool -list -v -keystore "CAMINHO/DA-SUA-CHAVE.keystore" -alias "SEU-ALIAS"
```

2. Digite a senha quando solicitada. Copie o valor completo de **SHA256**, no formato `AA:BB:...`. Se `keytool` não estiver no PATH, execute-o pela pasta `bin` do JDK configurado pelo Bubblewrap.
3. No terminal, entre na pasta do **site** que está no GitHub, onde fica `package.json`, e execute:

```sh
node scripts/assetlinks.mjs br.com.bycarolla.atelie "COLE-O-SHA256-COMPLETO"
```

4. Use exatamente o mesmo Package ID escolhido no assistente. O script atualiza `public/.well-known/assetlinks.json`.
5. Faça commit e push pelo GitHub Desktop. Aguarde a Vercel publicar novamente.
6. Abra `https://SEU-DOMINIO/.well-known/assetlinks.json` em janela anônima. Deve retornar JSON com seu Package ID e SHA-256, sem login e sem redirecionar para outro domínio.

O SHA-256 do certificado pode ficar público nesse arquivo. A chave `.keystore` e sua senha devem permanecer privadas.

## 9. Instalar e testar no Android

1. Transfira `app-release-signed.apk` para seu celular.
2. Abra o arquivo e, se solicitado, permita a instalação para o aplicativo pelo qual você abriu esse APK conhecido.
3. Abra **By Carolla**, entre na sua conta e teste cadastro, foto, estoque e venda.
4. Se aparecer barra do navegador, confira domínio, Package ID, SHA-256 e disponibilidade do JSON. Use um navegador Android atualizado com suporte a TWA, como Chrome.
5. Desligue a internet e confira o aviso de reconexão. Nenhuma venda será salva offline.

Com o aparelho conectado e depuração USB configurada, também é possível instalar pelo computador:

```sh
bubblewrap install
```

Melhorias no site são recebidas pelo aplicativo ao carregar a versão online. Mudanças no pacote Android, ícone nativo, domínio ou configuração podem exigir reconstruir e reinstalar o APK, mantendo o Application ID e a chave. Para atualizar o projeto Android, ajuste `twa-manifest.json`, execute `bubblewrap update` para regenerar o projeto e aumentar sua versão, e depois `bubblewrap build`. O comando update pode sobrescrever alterações manuais nos arquivos Android.

## 10. Se quiser publicar na Play Store

Instalar seu APK diretamente não exige publicação na loja. Para distribuir pela Play Store, será necessário preparar a conta de desenvolvedor, o Android App Bundle (AAB), dados da loja, política de privacidade, declarações de dados e os requisitos de testes/API vigentes. A aprovação não é automática.

Se ativar Play App Signing, a assinatura distribuída pela Play Store pode ser diferente da chave local. Adicione ao `assetlinks.json` o SHA-256 do **certificado de assinatura do app** exibido no Play Console; mantenha também o certificado local se continuar distribuindo APKs assinados por ele.

## Validação desta entrega

- Build de produção Next.js e verificação TypeScript concluídos.
- SQL exercitado em PostgreSQL local via PGlite, com simulação das identidades: criação de venda, valores em centavos, reenvio sem duplicação, saldo insuficiente, cancelamento único, isolamento entre usuários e restrição a alterações diretas.
- Login real, upload no Storage, acesso pelo domínio Vercel e execução no Android dependem da configuração e dos testes na sua conta.
- As rotinas de vendas atualizam estoque em uma transação. Os testes locais não substituem teste simultâneo de múltiplos dispositivos no ambiente real.

## Documentação oficial

- Vercel e GitHub: https://vercel.com/docs/git/vercel-for-github
- Condições Hobby: https://vercel.com/docs/plans/hobby
- Limites das funções: https://vercel.com/docs/functions/limitations
- Supabase com Next.js: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Segurança das fotos: https://supabase.com/docs/guides/storage/security/access-control
- Bubblewrap CLI: https://github.com/GoogleChromeLabs/bubblewrap/blob/main/packages/cli/README.md
- Bubblewrap / TWA: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- Assinatura e vínculo de domínio: https://developer.chrome.com/docs/android/trusted-web-activity/android-for-web-devs
- Assinatura Android: https://developer.android.com/studio/publish/app-signing
