# Especificação do Site Público (Frontend)

O frontend de "A Crônica Ilustrada" vive dentro da pasta `public/`. Seu objetivo é fornecer uma renderização ultra-rápida, com visual tipográfico retrô, dispensando o uso de servidores ou bancos de dados sofisticados em produção.

## 1. Tecnologias
- **Linguagem:** HTML5 Semântico e Vanilla JavaScript.
- **Estilização:** CSS3 Puro (Vanilla CSS). Sem pré-processadores pesados.

## 2. Ponto de Entrada (Entry Point)
O `index.html` fornece apenas o "esqueleto" e o grid base. Quando a página termina de carregar (`DOMContentLoaded`), o arquivo `js/main.js` assume o comando.

## 3. O Fluxo do `main.js`
A magia da plataforma baseia-se num fluxo simples e assíncrono:

1. **`loadIndex()`**: A primeira função a ser chamada. Ela dispara um `fetch()` para o arquivo `data/editions/index.json` gerado pelo admin. 
2. A lista resultante é guardada na memória (`availableEditions`) e já é usada para apontar qual é a edição mais atual.
3. **`loadEdition(filename)`**: Uma vez descoberta a edição mais atual (ou caso o usuário clique em uma edição específica no Acervo), essa função baixa o arquivo (ex: `data/editions/2026/312/edition-312.json`).
4. **`renderEdition(data)`**: Essa é a função principal do site:
   - Modifica os metadados da página, como Título e Cabeçalhos Visuais.
   - Atualiza as **Meta Tags (SEO)** dinamicamente para que os indexadores e redes sociais recebam o título e sinopse da notícia de destaque daquela edição específica.
   - Povoa as 2 colunas usando DOM Manipulation:
     - **Coluna Esquerda:** `articles` (artigos principais) e `cartoons` (charges). Para o artigo principal, suporta criação de Letras Capitulares (Drop-cap) na renderização.
     - **Coluna Direita:** `generalNews` (notas curtas/telegramas) e `classifieds` (almanaque de ofertas locais).

## 4. O CSS, Design System e Performance (`style.css` e Otimizações)
O aspecto de 1920 é alcançado utilizando técnicas modernas com forte apelo em UI/UX e Web Performance:
- **Segurança (CSP):** A página principal bloqueia a execução de scripts arbitrários (XSS) através de uma *Content Security Policy*, protegendo os usuários e garantindo apenas tráfego confiável (ex: Google Fonts e AdSense).
- **Core Web Vitals:** O LCP (Largest Contentful Paint) é acelerado por preloads (`<link rel="preload">`) das fontes e arquivos JSON principais.
- **Lazy Loading Imagens:** A renderização dinâmica em Javascript usa `loading="lazy"` e `decoding="async"` para todas as imagens das matérias, exceto a primeira, que recebe `fetchpriority="high"`.
- **Papel Velho:** Uma combinação de background-colors pastéis e efeitos de bordas duplas (`border-style: double`) além de uma sutil máscara com SVG para simular a textura granulada do papel.
- **Tipografia Responsiva:** Foram escolhidas as fontes web do Google Fonts (`Playfair Display`, `Lora`, `UnifrakturMaguntia`, `Cinzel`) para mesclar ornamentação retrô com legibilidade moderna. O texto do corpo ajusta-se dinamicamente (`text-align: justify` no desktop; `text-align: left` no mobile) para evitar quebras abruptas de leitura.
- **Micro-interações:** A barra de navegação superior (`.top-nav`) se esconde durante o *scroll* de leitura e reaparece ao subir a tela, maximizando o foco na matéria. As imagens de época ganham sutil destaque (`scale`) ao receberem o *hover* do mouse.
- **Filtros Sépia:** Imagens (`.image-noir`) recebem automaticamente classes de filtro CSS `filter: grayscale(100%) sepia(40%)` com `mix-blend-mode` para uniformizar o aspecto vintage de qualquer ilustração que os redatores postarem.
- **CSS Grid & Flexbox:** Mantêm a estrutura das colunas adaptável sem sujar o HTML.

## 5. Como Manter o Frontend
Para realizar melhorias visuais:
- Edite `public/css/style.css` para mudanças de cor ou margens.
- Edite `public/js/main.js` caso o Administrador decida adicionar uma nova seção (por exemplo: "Horóscopo"). Você precisará atualizar o backend (para gravar) e em seguida criar um bloco extra dentro da função `renderEdition()` para exibir os dados do Horóscopo no navegador.
