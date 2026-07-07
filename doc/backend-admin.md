# Especificação da Mesa do Editor (Backend Admin)

O backend do sistema vive dentro da pasta `admin/`. É uma aplicação **Node.js** baseada em **Express.js** que substitui sistemas pesados como CMS tradicionais.

Sua única responsabilidade é capturar textos e imagens do jornalista através do painel, convertê-los em arquivos `.json` estruturados, organizá-los em diretórios corretos dentro da pasta `/public` e atualizar o índice global.

## 1. Tecnologias
- **Backend:** Node.js, Express.js.
- **Tratamento de Uploads:** Multer (Middleware do Express para gerir inputs de arquivos `multipart/form-data`).
- **Comunicação Front/Back:** Vanilla JS (Fetch API) no lado do painel.

## 2. A Mágica do `server.js` (O Coração)
Este arquivo é o servidor propriamente dito. Ele levanta uma API local (porta 3000) e escuta rotas principais. 
**Atenção de Segurança:** O backend foi construído propositalmente de forma simples, com operações síncronas (`fs.renameSync`) e sem camadas de autenticação (sem senhas). Isso significa que **ele nunca deve ser exposto publicamente na internet**. Ele serve exclusivamente para rodar no seu `localhost` (sua própria máquina) de forma privada.

### `Servidor Híbrido Estático (/data)`
O express está configurado com `app.use('/data', ...)` para servir a pasta `public/data`. Isso permite que o painel admin (porta 3000) possa renderizar e visualizar imagens armazenadas na pasta de produção, resolvendo o bug clássico de imagens quebradas no Headless CMS.

### `GET /api/next-edition-number`
O servidor varre (usando a função `getEditionsFiles()`) os arquivos da pasta `/public/data/editions/`, descobre qual o maior número de edição já publicado e retorna ao front-end sugerindo o número da próxima edição para facilitar a vida do redator.

### `POST /api/upload`
Rota gerida pelo `multer`. Recebe uma imagem solta pelo editor. O sistema analisa o ano e número atual em edição, e salva o arquivo em disco na pasta correspondente.

### `POST /api/editions`
A rota principal do fluxo editorial:
1. Recebe um grande payload JSON montado pelo front-end.
2. Checa se o usuário alterou o ano/número da edição e cuida automaticamente de renomear a pasta (`fs.rename`) e re-linkar recursivamente os caminhos das imagens (`updateImageUrls()`) de forma graciosa.
3. Salva o conteúdo final no arquivo em disco usando `fs.writeFile`.
4. **Gatilho de Indexação:** Invalida o cache e chama a função `updateEditionsIndex()`.
*(Nota: Para evitar bugs de estado no SPA após o rename, o frontend agora executa um "Hard Refresh" silencioso que recarrega os dados fresquinhos recém-salvos no servidor).*

### `DELETE /api/editions` e `POST /api/cleanup`
O servidor possui mecânicas avançadas de exclusão atômica. Se uma edição é excluída, todo o diretório (`rm -rf`) é apagado de uma vez. A rota `cleanup` é capaz de rastrear "Arquivos Órfãos" (imagens na pasta que não estão vinculadas ao JSON) e excluí-los com segurança para poupar espaço.

## 3. O Indexador Global (`index.json`)
A função `updateEditionsIndex()` em `server.js` é crucial. Ela percorre de forma recursiva todas as edições postadas. Extrai título, número e arquivo de cada uma e gera uma **Array JSON ordenada**, escrevendo-a em `/public/data/editions/index.json`. 

Esse arquivo gerado é o que avisa ao Site Público quantas edições existem no total e qual ele deve mostrar primeiro. Sem ele, a home page do jornal não saberia qual arquivo `.json` carregar.

## 4. O Painel de Criação (`public/admin.js`)
O frontend administrativo (o formulário) em si fica na subpasta `admin/public/`. 
É uma UI com um layout de Abas. Quando o editor clica em "Adicionar Artigo", o Javascript injeta (manipulação de DOM) novos campos na tela. 
Ao clicar em Salvar, o script monta manualmente a estrutura JSON esperada e a despacha via `fetch` para o `server.js`.

Para manter e expandir o painel administrativo:
- Se precisar adicionar um novo campo (ex: Resumo), você precisa editar `admin/public/index.html` (para adicionar o input HTML), `admin/public/admin.js` (para coletar o dado e botar no JSON payload).
