# Especificações Técnicas do Gerador de PDF (PDF Generator Spec)

O núcleo de impressão da Crônica Ilustrada é governado por um sistema algorítmico customizado implementado dentro da configuração de servidor Node (`vite.config.js`). 

## Arquitetura de Geração
1. O usuário aciona o backend através do endpoint REST `POST /api/generate-pdf/:ano/:id`.
2. O servidor instancia uma janela *headless* do Google Chrome via Puppeteer.
3. O Puppeteer navega de volta para o próprio servidor na rota interna e secreta `http://localhost/edicao/:ano/:id/imprimir`.
4. O Puppeteer aguarda que o tráfego de rede cesse completamente (`networkidle0`) garantindo carregamento de fontes góticas.

## Algoritmo "Robô Diagramador Inteligente"
A funcionalidade mais complexa do sistema. O Chromium injeta lógica JavaScript (`page.evaluate`) na interface de impressão *antes* de bater a foto do PDF, simulando o pensamento de um editor:

```javascript
// A folha possui 65cm de altura.
// O robô analisa o scrollHeight de todos os containers lógicos (.print-page).
// Se (scrollHeight > 61cm && < ~74cm) -> Significa que a página vazou pouco texto para fora.
// Ação corretiva: p.style.zoom = ratio;
```

**Mecanismos do Robô:**
- **Micro-Compressão Dinâmica:** Calcula uma razão (Ratio) entre a altura de destino e a altura real excedida, aplicando `zoom` reverso (ex: 0.85). O conteúdo é levemente achatado para encaixar, impedindo que textos órfãos gerem uma 2ª folha vazia ou quebrem layouts de página inteira.
- **Expansão Dinâmica:** Aplica um `zoom` levemente positivo em colunas curtas, esticando graciosamente as manchetes para fechar vazios de rodapé.

## Configurações Físicas do PDF
- **Dimensões:** `width: 40cm, height: 65cm`
- **Backgrounds:** `printBackground: true`
- **CSS Injetado:** `-webkit-print-color-adjust: exact !important` (força o navegador a renderizar cores sólidas no fundo da página).

## Como Manutenir ou Escalar
Para desativar a inteligência, basta comentar o bloco de `const layoutMetrics = await page.evaluate(...)` no arquivo `vite.config.js`. 
Para alterar o tamanho físico do papel mundialmente, deve-se alterar:
1. `width` e `height` na configuração `.pdf({})` no `vite.config.js`.
2. A métrica `size: XXcm YYcm` no `@page` do `src/index.css`.
3. Ajustar o limite matemático de correção no `targetHeight` do algoritmo de Zoom no `vite.config.js` caso o papel cresça ou diminua.
