# Processo Editorial d'A Crônica Ilustrada

Este documento descreve o fluxo de trabalho para a redação, formatação e publicação das edições do jornal **A Crônica Ilustrada**. O processo foi desenhado para simular o ofício de um editor-chefe dos anos 1920, com a facilidade da automação e assistência de Inteligência Artificial modernas.

## 1. O Painel Administrativo

Todo o gerenciamento do conteúdo é realizado através do **Painel Administrativo**, uma interface restrita acessada na rota `/admin` quando o projeto está rodando em ambiente local.

### 1.1 Criando ou Editando uma Edição
Ao entrar no painel, o redator-chefe pode:
- Clicar em **"+ Nova Edição"** para gerar um rascunho em branco, pré-preenchido com a estrutura correta dos cadernos (Capa, Mundo, Sociedade, Lazer, Folhetim e Cultura).
- Ou selecionar uma **Edição Existente** na barra lateral para realizar alterações.

Cada edição é internamente estruturada como um objeto JSON e salva fisicamente na pasta `src/data/editions`.

## 2. Estruturação dos Cadernos (Abas)

O formulário de edição é segmentado em abas que representam as páginas do jornal broadsheet:

- **Capa:** Definem-se a manchete principal, a data da época, informações de topo (número da edição, preço), o grande artigo de abertura, a foto de destaque com legenda e as "chamadas" (pequenos blocos que instigam o leitor a ir para as páginas de dentro).
- **Mundo:** Destinado aos "Telegramas Internacionais", onde curtas notícias de outros países são simuladas como se chegassem via cabo submarino (ex: Agência Havas ou Reuters).
- **Sociedade:** Espaço para crônicas da cidade, contos boêmios, imagens da vida noturna e os famosos "Classificados" e pequenos anúncios.
- **Lazer & Desportos:** Acomoda uma charge/cartum do dia, notícias de turfe ou regatas, e um **Gerador de Caça-Palavras Automático**. Para o caça-palavras, basta o editor digitar palavras separadas por vírgula que o sistema cria e injeta o puzzle na edição.
- **Folhetim:** A tradicional novela seriada, publicada capítulo a capítulo (como as obras de Machado de Assis).
- **Guia Cultural:** Agendão com peças de teatro, cinematógrafos, óperas e concertos da semana.

## 3. O "Fantasma de Assis" (Assistência de IA)

O processo de criação é fortemente apoiado por um Assistente Editorial chamado **Fantasma de Assis**. Trata-se de uma interface de chat conectada ao Google Gemini (ou modelos locais via Ollama), condicionada a agir como um redator sênior da Belle Époque.

### O Fluxo de Trabalho com o Fantasma:
1. **Busca de Pautas (Scraping):** Na aba *Pautas*, o editor pode pesquisar por notícias recentes do mundo real. O sistema exibe links e permite extrair (fazer *crawl*) o texto dessas páginas. O conteúdo extraído fica salvo na memória temporária do sistema.
2. **Redação:** Na aba *Redação*, o editor usa o chat para conversar com o Fantasma. Como as fontes do passo anterior já estão no contexto da IA, o editor pode enviar comandos como: *"Escreva uma crônica sobre esta notícia do novo iPhone, mas finja que é um misterioso telégrafo portátil de bolso inventado na capital"*.
3. **Linguagem:** O Fantasma responderá com um texto formal, poético e melancólico, característico do jornalismo dos anos 1920.
4. **Finalização:** O editor lê, aprova, copia o texto fornecido pelo assistente e cola nas caixas de texto correspondentes nos cadernos (Capa, Mundo, etc.). Se desejar, pode clicar em *Salvar no Banco Isolado* para criar um banco de recortes.

## 4. Gerenciamento de Mídia

As fotografias (para a capa, sociedade ou cartum) podem ser inseridas via URL direta ou através do componente de Upload integrado no painel. Pede-se que as imagens utilizadas sigam um tom retrô (preto e branco, sépia ou com ar vintage) para não quebrar a imersão da leitura.

## 5. Publicação e Impressão

Após todo o conteúdo estar diagramado nas abas:

1. **Status:** O editor pode alterar o status da edição de `"draft"` (Rascunho) para `"published"` (Publicado).
2. **Salvar:** Ao clicar no botão **"Salvar Alterações no Acervo"**, o painel envia o payload (todos os dados digitados) via API para ser sobrescrito no arquivo JSON original dentro do repositório (ex: `edition-2026-X.json`).
3. **Gerar PDF:** Se desejado, o editor pode clicar em **"🖨️ Gerar PDF"**. Isso aciona um serviço de *headless browser* (Puppeteer) que processa a edição final, gerando um documento PDF de alta resolução, idêntico a um broadsheet impresso, que fica disponível para download direto na interface do jornal.

---

*“Nas nossas páginas, a poeira do tempo não apaga a tinta; antes, lhe confere a nobreza de uma era imortal.”* — Redacção d'A Crônica Ilustrada.
