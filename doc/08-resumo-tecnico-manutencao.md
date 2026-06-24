# Resumo Técnico, Tecnologias e Manutenção

Este documento serve como um guia consolidado de especificações técnicas, arquitetura de desenvolvimento, stack de tecnologias e instruções para manutenção de **A Crônica Ilustrada**.

---

## 📋 Especificações Técnicas e de Arquitetura

O projeto foi construído sob um modelo híbrido e otimizado:
1. **Ambiente de Desenvolvimento (CMS Ativo):** Funciona com uma API local mockada por meio de um plugin customizado no [Vite](https://vite.dev/) (`vite.config.js`). Este servidor local intercepta requisições HTTP para ler, salvar, apagar e processar dados JSON diretamente na pasta `src/data/editions/`, além de expor endpoints para upload de imagens e geração de PDFs.
2. **Ambiente de Produção (SSG - Static Site Generation):** Após a compilação via `npm run build:static`, a aplicação se torna 100% estática. O script `scripts/generate-static-api.js` clona os dados do diretório de desenvolvimento e os publica como arquivos JSON estáticos na pasta de destino (`dist/api/editions/`). O roteamento foi arquitetado para buscar arquivos com extensão estrita `.json` (ex: `list.json`, `edition-[ano]-[numero].json`).

---

## 🛠️ Stack de Tecnologias Utilizadas

### Frontend
- **[React](https://react.dev/):** Biblioteca principal para renderização declarativa de componentes de UI.
- **[React Router DOM](https://reactrouter.com/):** Sistema de roteamento dinâmico que gerencia a navegação entre as páginas do leitor, área de impressão e painel administrativo.
- **[Tailwind CSS (v4)](https://tailwindcss.com/):** Framework de estilização utilitária para rápida prototipagem e controle fino sobre o design responsivo e tokens de design (Playfair Display, Abril Fatface, Lora e UnifrakturMaguntia).
- **[Motion (f.k.a. Framer Motion)](https://motion.dev/):** Biblioteca utilizada para as animações fluidas e tridimensionais de virada de página (efeito "Page Fold" clássico).
- **[React Helmet Async](https://github.com/carloshcabrera/react-helmet-async):** Gerenciador de tags `<head>` para carregamento dinâmico de títulos, metatags OpenGraph e SEO.

### Backend / Ferramental (Local & Build)
- **[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript para scripts locais e o plugin do CMS.
- **[Puppeteer](https://pptr.dev/):** Ferramenta de automação do Chrome em modo *headless*, responsável por renderizar a rota de impressão a 96dpi e gerar o arquivo PDF final no formato físico Broadsheet (40cm x 65cm).
- **[Vite](https://vite.dev/):** Bundler e servidor de desenvolvimento ágil que acelera o Hot Module Replacement (HMR) e empacota o código de produção de forma otimizada.

### Infraestrutura & Distribuição
- **[Cloudflare Pages](https://pages.cloudflare.com/):** Hospedagem estática global e segura integrada diretamente com o repositório privado no GitHub.
- **[Google AdSense](https://support.google.com/adsense):** Plataforma de monetização por anúncios gráficos integrados ao layout vintage sem comprometer o design Broadsheet de 1920.

---

## ⚙️ Orientações de Manutenção e Desenvolvimento

### 1. Criando e Editando Matrizes de Conteúdo
Os dados do jornal são salvos como arquivos JSON individuais em [src/data/editions/](file:///c:/Users/wsric/antigravity/Crônica-Ilustrada-de-1920/src/data/editions/). Cada arquivo JSON deve obedecer à estrutura definida no [doc/02-data-model-spec.md](file:///c:/Users/wsric/antigravity/Crônica-Ilustrada-de-1920/doc/02-data-model-spec.md).
O painel administrativo está isolado via variáveis de ambiente (`import.meta.env.DEV`) e fica disponível em `/admin` apenas no modo de desenvolvimento.

### 2. O Algoritmo de Diagramação Reativa
Ao gerar PDFs com o Puppeteer através da rota `/api/generate-pdf/:ano/:numero`, o servidor executa lógica sob medida no DOM da página para evitar órfãos e viúvas textuais na impressão do PDF.
- A altura física de um papel Broadsheet personalizado no CSS é de `65cm` (cerca de `2300px` em altura útil).
- Se houver necessidade de alterar a escala de margens, tipografia ou compactação gráfica, edite o bloco `layoutMetrics` no arquivo [vite.config.js](file:///c:/Users/wsric/antigravity/Crônica-Ilustrada-de-1920/vite.config.js).

### 3. Fluxo de Publicação e Compilação Estática
Sempre que novos textos forem incluídos e testados localmente, execute o build de distribuição:
```bash
npm run build:static
```
Este comando executa a compilação do Vite e dispara o script [generate-static-api.js](file:///c:/Users/wsric/antigravity/Crônica-Ilustrada-de-1920/scripts/generate-static-api.js) que:
* Transfere os JSONs de edições para o build final.
* Reconstrói o arquivo `list.json` de catálogos.
* Cria o [sitemap.xml](file:///c:/Users/wsric/antigravity/Crônica-Ilustrada-de-1920/dist/sitemap.xml) dinamicamente.
* Cria o arquivo de regras de indexação [robots.txt](file:///c:/Users/wsric/antigravity/Crônica-Ilustrada-de-1920/dist/robots.txt).

---

## 🔗 Referências Externas de Estudo e Suporte

Abaixo estão listados links úteis para aprofundamento nas tecnologias stack e tópicos envolvidos no projeto:

* **Desenvolvimento Frontend:**
  * [Documentação do React](https://react.dev/reference/react)
  * [Rotas e APIs no React Router v6](https://reactrouter.com/en/main)
  * [Instalação e Recursos do Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
  * [Motion para Animações React](https://motion.dev/docs)

* **Geração de Arquivos e PDF (Automated Print Layout):**
  * [Documentação e API do Puppeteer](https://pptr.dev/category/introduction)
  * [Guia do W3C sobre CSS Paged Media Module](https://www.w3.org/TR/css-page-3/)
  * [MDN Web Docs - Regras CSS de Impressão (@media print)](https://developer.mozilla.org/pt-BR/docs/Web/CSS/@media#media_types)

* **Implantação e Cloudflare:**
  * [Iniciar Projetos com Cloudflare Pages](https://developers.cloudflare.com/pages/)
  * [Como delegar e alterar servidores DNS (Nameservers)](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)

* **Monetização e SEO:**
  * [Boas Práticas de SEO do Google Search Central](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
  * [Guia Oficial do Google AdSense e Validação de ads.txt](https://support.google.com/adsense/answer/12171612)
