# Hospedagem Segura e Colaboração (Cloudflare Pages)

Este documento detalha o procedimento para blindar o código-fonte e gerenciar publicações de forma 100% gratuita através de Repositório Privado no GitHub e Hospedagem no Cloudflare Pages.

## 1. Configurando o Repositório Privado no GitHub
Para garantir que seu Painel Administrativo, rascunhos e imagens nativas fiquem ocultos do público geral:

1. Acesse seu repositório no **GitHub**.
2. Clique na aba **Settings** (Configurações) no topo.
3. Desça até a seção **Danger Zone** (Zona de Perigo).
4. Clique em **Change visibility** e selecione **Make Private**.
5. *Nota:* Agora, o GitHub Pages deixará de funcionar na sua conta gratuita, mas seu código está blindado.

## 2. Configurando o Cloudflare Pages (Deploy Gratuito)
A Cloudflare possui uma CDN global ultrarrápida. Ao usar o Cloudflare Pages, ele acessará seu repositório privado (com sua permissão) e compilará o site.

1. Crie uma conta gratuita em [Cloudflare](https://dash.cloudflare.com/sign-up).
2. No menu lateral, clique em **Workers & Pages**.
3. Clique no botão **Create application** e selecione a aba **Pages**.
4. Clique em **Connect to Git** e autorize a integração com sua conta do GitHub.
5. Selecione o repositório privado da *A Crônica Ilustrada*.
6. Na tela de configuração (Build settings):
   - **Framework preset:** Selecione `None`
   - **Build command:** `npm run build:static`
   - **Build output directory:** `dist`
7. Clique em **Save and Deploy**. Em 1 minuto o jornal estará no ar.

### 2.1 Configurando seu Domínio Personalizado (Registro.br)
Se você tem um domínio (ex: `www.acronicailustrada.com.br`) registrado no **Registro.br**, o fluxo é o seguinte:

**No Cloudflare:**
1. No painel do seu site no Cloudflare Pages, vá na aba **Custom Domains**.
2. Clique em **Set up a custom domain** e digite o domínio (`www.acronicailustrada.com.br`).
3. O Cloudflare irá escanear o domínio e, no final, lhe dará dois nomes de servidores (chamados **Nameservers**). Eles se parecem com `pedro.ns.cloudflare.com` e `maria.ns.cloudflare.com`. Anote-os.

**No Registro.br:**
1. Acesse o [Registro.br](https://registro.br) e faça login.
2. Clique sobre o seu domínio na lista.
3. Desça a página até a seção **DNS** e clique no botão **Alterar Servidores DNS**.
4. Insira os dois Nameservers fornecidos pelo Cloudflare nos campos **Master** (Servidor 1) e **Slave 1** (Servidor 2).
5. Salve.

**O que NÃO é necessário configurar:**
- Você **NÃO** deve configurar apontamentos do tipo A, CNAME ou TXT diretamente no Registro.br. Ao alterar os Nameservers, o Registro.br delega totalmente o controle para o Cloudflare.
- O Certificado SSL (Cadeado de segurança HTTPS) é gerado **automaticamente e de graça** pelo Cloudflare. Você não precisa comprar nem instalar certificado SSL no Registro.br.
- Você não precisará configurar rotas ou subpastas adicionais no código do projeto (no `vite.config.js`). O deploy no diretório raiz já estará pronto para servir o tráfego da URL limpa `/edicao/2026/1`.

Aguarde algumas horas (geralmente menos de 1 hora, mas pode levar até 24h) para que a "propagação de DNS" ocorra. Depois disso, o seu domínio apontará para o Cloudflare Pages.

## 3. Adicionando Novos Colaboradores ao Painel
No futuro, se quiser adicionar um redator para lhe ajudar a escrever pelo Painel Administrativo, o fluxo é incrivelmente seguro e distribuído (conhecido como Git-based CMS).

### O Procedimento do Redator:
1. Vá até seu Repositório Privado no GitHub, clique em **Settings** > **Collaborators** > **Add people**, e convide o usuário do GitHub do redator.
2. O redator baixará o código na máquina dele e instalará o Node.js.
3. O redator roda o comando `npm run dev` na máquina dele.
4. O painel administrativo abrirá. O redator cria a edição dele, insere imagens, salva (o painel criará o arquivo JSON localmente nele).
5. O redator faz um **Commit** e envia para o GitHub (Push).
6. **Mágica:** O Cloudflare percebe a atualização no repositório instantaneamente, roda o `npm run build:static` na nuvem e publica o jornal. A edição do redator aparece para o público em poucos minutos.

### Vantagens Deste Contexto
- **Zero Risco de Invasão Online:** O painel roda sempre em um ambiente de desenvolvimento fechado (na sua máquina ou na do colaborador).
- **Sem conflitos de servidor:** Se dois colaboradores escreverem artigos no mesmo dia, o Git do GitHub ajudará a unir o trabalho dos dois com segurança antes de publicar.
- **Histórico Perpétuo:** Se um redator apagar um arquivo por engano ou salvar uma matéria errada, você tem o Histórico de Commits do Git para voltar o texto para qualquer dia e hora no tempo.
