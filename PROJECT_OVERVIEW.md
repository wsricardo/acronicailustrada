# Visão Geral do Projeto: A Crônica Ilustrada

**A Crônica Ilustrada** é uma aplicação web criativa e interativa desenvolvida com o objetivo de simular um **jornal clássico e retrô datado de 1926** (estilo broadsheet). 

Visualmente e estruturalmente, ele emula a experiência de leitura de uma edição de jornal de época, dividido em páginas/cadernos específicos (Capa, Mundo & Sociedade, Lazer, Cultura). O projeto conta ainda com a integração de ferramentas modernas como Inteligência Artificial (Gemini) e web scraping para gerar ou auxiliar no conteúdo de forma dinâmica através de um painel de administração (`/admin`).

## 🛠️ Tecnologias e Arquitetura

O projeto é majoritariamente um **Frontend em React**, mas com capacidades de geração de site estático (SSG/Static API). 

- **Core**: React 19, React Router DOM v7.
- **Bundler e Tooling**: Vite 6, configurado para empacotar o código e servir um servidor de desenvolvimento rápido.
- **Estilização**: Tailwind CSS v4, que traz recursos modernos como container queries, com animações e transições usando `motion` (Framer Motion).
- **Integração de IA e Automação**: O projeto possui dependências como `@google/genai` (para se comunicar com a API do Google Gemini), `puppeteer`, `cheerio` e `duck-duck-scrape` (indicando capacidade de buscar dados, raspar web e gerar conteúdo automaticamente).
- **SEO e Estático**: O frontend utiliza `react-helmet-async` para gerenciar as meta tags (OpenGraph). Possui um script interessante em `scripts/generate-static-api.js` responsável por transformar arquivos `.json` num "falso backend", gerando o `sitemap.xml`, `robots.txt` e permitindo a hospedagem totalmente estática (ex: Cloudflare Pages, GitHub Pages).

## 📁 Estrutura de Arquivos

Aqui estão as pastas e arquivos mais relevantes do repositório:

- `src/App.jsx` e `src/main.jsx`: Ponto de entrada do React. O `App.jsx` gerencia as rotas (como `/, /edicao/:ano/:numero`, e a rota oculta `/admin`).
- `src/pages/`: Contém os componentes principais de roteamento.
  - O visual do jornal é segmentado em componentes de páginas: `Page1_Capa`, `Page2_MundoSociedade`, `Page3_Lazer` e `Page4_Cultura`.
  - Contém também a lógica administrativa em `AdminPanel.jsx` (visível apenas em ambiente de desenvolvimento).
- `src/components/`: Uma série de micro-componentes de interface do jornal, como `LeadArticle`, `CartoonSection`, `WordSearch` (um gerador de caça-palavras), paginação estilo revista em 3D, e auxiliares como `ArchiveModal`.
- `src/data/`: O "Banco de Dados" da aplicação, onde ficam armazenados arquivos em formato JSON (`src/data/editions`) que contêm as edições passadas do jornal.
- `scripts/generate-static-api.js`: Um script NodeJS feito para pegar os JSONs da pasta `data` e copiá-los para dentro da pasta compilada de produção (`dist/api/editions`), criando assim uma API estática sem precisar de backend.
- `package.json` e `vite.config.js`: Contém as configurações do ecossistema e os comandos de build/dev.
- `.env.example`: Indica que você precisa de variáveis de ambiente configuradas, como `GEMINI_API_KEY`.

## 🚀 Como Instalar, Testar e Visualizar o Resultado

Como o projeto utiliza Node.js, os passos para testar localmente são os seguintes:

**1. Instalar Dependências**
No terminal, dentro da pasta do projeto, instale todos os pacotes:
```bash
npm install
```

**2. Configuração de Variáveis de Ambiente**
A aplicação utiliza a API do Google Gemini.
* Renomeie o arquivo `.env.example` para `.env.local` (ou `.env`).
* Abra este arquivo e adicione a sua chave no campo correspondente (`GEMINI_API_KEY=sua_chave_aqui`).

**3. Iniciar o Servidor de Desenvolvimento**
Execute o comando abaixo para iniciar o Vite localmente (geralmente em `http://localhost:3000`):
```bash
npm run dev
```
> **Nota:** Para acessar e testar o painel de criação de edições (que se aproveita da integração Gemini para gerar notícias), com o servidor rodando acesse a rota `http://localhost:3000/admin`. 

**4. Testando a Versão de Produção (Estática)**
Se quiser visualizar como o projeto vai ficar quando for publicado no ar (em servidores estáticos como Cloudflare Pages):
```bash
npm run build:static
npm run preview
```
* O comando `build:static` compilará o React e executará o script que gera os índices, a API estática (`list.json`), o `sitemap.xml` e o `robots.txt`.
* O `preview` vai servir a pasta `dist` simulando um ambiente de produção real.
