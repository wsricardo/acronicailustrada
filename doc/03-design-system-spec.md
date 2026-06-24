# Sistema de Design (Design System Spec)

## Identidade Visual - 1920s Noir
O projeto implementa uma estilização estrita baseada no jornalismo clássico. A sensação física de "tinta no papel" é guiada via Tailwind (CSS-in-JS utility) e variáveis CSS globais.

## Paleta de Cores (Color Tokens)
As cores são gerenciadas de forma bruta, evitando brilhos de tela modernos.
- **Fundo Web (Papel Sépia/Palha):** `#eaddca` e `bg-[#f4ecd8]`
- **Fundo PDF (Impressão crua):** `#E6DFC8` (Substitui texturas pesadas por cor sólida para economizar bytes no PDF).
- **Texto Principal (Nanquim):** `#2c2825` e `black`. Evita-se o preto puro `#000000` absoluto em textos longos web, mas na impressão o preto `#1a1a1a` é exigido.

## Tipografia (Typography System)
Importadas via Google Fonts e aplicadas no `@theme` do Tailwind V4:
1. `--font-display`: **Playfair Display**. Utilizada nos grandes títulos e cabeçalhos principais (Manchetes).
2. `--font-header`: **Abril Fatface**. Utilizada em chamadas pesadas.
3. `--font-text`: **Lora**. Obrigatória em absolutamente todos os blocos de leitura longos, crônicas e folhetins.
4. `--font-gothic`: **UnifrakturMaguntia**. Letreiro principal (Logomarca do Jornal).

## Regras de Layout Web vs. Print

### Web Layout
- Containers centralizados com `max-w-6xl`.
- Interações (Hover) e sombras dinâmicas.
- Textura SVG `noiseFilter` no fundo.

### Print Layout (O Padrão Broadsheet)
O `@media print` anula a UX Web e introduz as seguintes forças magnéticas:
- **Papel:** Dimensões matemáticas restritas em `40cm x 65cm`.
- **Justificação:** Todo parágrafo ganha `text-align: justify; hyphens: auto;` gerando blocos retangulares maciços.
- **Proteção Anti-Quebra:** Elementos sensíveis herdam `break-inside: avoid !important;` forçando pulos integrais em divisões de folha.
