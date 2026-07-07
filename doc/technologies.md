# Tecnologias Utilizadas

Este documento lista as principais tecnologias, bibliotecas e conceitos técnicos aplicados na construção do jornal **A Crônica Ilustrada** e de seu painel administrativo. O projeto foi intencionalmente construído focando em ferramentas puras (Vanilla) para máxima longevidade do código e controle estilístico.

## 1. Frontend (Camada Pública e Admin)

O frontend foi desenvolvido sem o uso de frameworks modernos (como React, Vue ou Angular) ou bibliotecas de CSS (como TailwindCSS ou Bootstrap).

*   **HTML5 Semântico:** Estruturação correta para acessibilidade e SEO (uso de `<article>`, `<header>`, `<nav>`, `<section>`).
    *   [Referência MDN: HTML5 Semantics](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)
*   **Vanilla CSS3 (CSS Puro):**
    *   **CSS Grid e Flexbox:** Utilizados exaustivamente para diagramação complexa em múltiplas colunas (layout *Broadsheet* de jornal).
    *   **CSS Custom Properties (Variáveis):** Para controle do esquema de cores (tons de papel envelhecido, sépia).
    *   **Filtros CSS (`filter`):** Uso de `sepia()`, `contrast()`, `grayscale()` para envelhecer dinamicamente as imagens (fotografias e cartuns) carregadas pelo painel, eliminando a necessidade de tratamento de imagem no backend.
    *   **Funções de responsividade (`clamp`):** Para tipografia fluida que se adapta suavemente de telas de smartphones a monitores ultrawide.
    *   [Referência MDN: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
    *   Uso da `Fetch API` assíncrona para requisições de rede.
    *   Manipulação imperativa do DOM via `document.createElement` e `innerHTML` para renderização dinâmica das edições com base no JSON.
    *   **Performance Integrada:** Atributos HTML modernos como `loading="lazy"`, `decoding="async"`, e `fetchpriority="high"` são manipulados via JavaScript para garantir a alta pontuação nos Core Web Vitals (LCP otimizado).
    *   [Referência MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 2. SEO, Segurança e Compartilhamento

Apesar de ser uma Single Page Application construída com Vanilla JS puro, o sistema adota estratégias modernas para web:
*   **Sitemap & Robots:** Arquivos `sitemap.xml` e `robots.txt` estáticos orientam os robôs de busca corretamente.
*   **Open Graph (Metatags Sociais):** As tags `og:image`, `og:title`, e `og:description` são populadas estaticamente no `index.html` e dinamicamente via JS. A imagem de Open Graph foi desenhada para criar um card de WhatsApp/Facebook com estética de época.
*   **Content Security Policy (CSP):** O arquivo HTML impõe restrições estritas de segurança pelo navegador para bloquear tentativas de ataques Cross-Site Scripting (XSS).

## 3. Tipografia Clássica (Google Fonts)

Para imitar perfeitamente o aspecto visual e o peso editorial das décadas de 1920 a 1950, foram selecionadas fontes específicas:

*   **Playfair Display:** Para títulos elegantes e de grande impacto.
*   **Lora:** Para o corpo de texto, oferecendo alta legibilidade em blocos densos com serifas suaves.
*   **UnifrakturMaguntia:** Fonte gótica alemã clássica, utilizada em cabeçalhos de jornais de época (ex: para o nome do jornal e títulos de cartuns).
*   **Cinzel:** Para subtítulos em caixa alta com aspecto monumental romano.
*   [Google Fonts](https://fonts.google.com/)

## 4. Backend (Painel Administrativo)

O ambiente do editor é suportado por um ecossistema Node.js leve e focado.

*   **Node.js:** Ambiente de execução JavaScript no servidor.
    *   [Site Oficial Node.js](https://nodejs.org/)
*   **Express.js:** Framework minimalista para criação das rotas da API RESTful (listar edições, ler edição, salvar edição, upload de arquivo).
    *   [Documentação Express](https://expressjs.com/)
*   **CORS (Cross-Origin Resource Sharing):** Middleware do Express para permitir requisições de portas diferentes durante o desenvolvimento.
    *   [Referência Express: CORS](https://expressjs.com/en/resources/middleware/cors.html)
*   **Multer:** Middleware fundamental para o Express focado no tratamento de requisições `multipart/form-data`, utilizado primariamente para o **upload de arquivos de imagem**.
    *   [Repositório Oficial Multer (GitHub)](https://github.com/expressjs/multer)
*   **PM2 (Process Manager):** Utilizado para rodar o servidor Express em *background* e garantir que ele seja mantido online sem bloquear o terminal.
    *   [Documentação PM2](https://pm2.keymetrics.io/)
