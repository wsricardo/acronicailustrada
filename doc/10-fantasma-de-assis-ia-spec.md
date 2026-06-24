# 10 - Especificação do Fantasma de Assis (Assistente IA)

## 1. Visão Geral
O "Fantasma de Assis" é o assistente editorial impulsionado por Inteligência Artificial (Google Gemini) diretamente integrado à mesa de edição do Painel Administrativo de "A Crônica Ilustrada". Ele provê recursos de busca em tempo real (Investigação), extração de sites modernos (Scraping) e reescrita conversacional com "memória de trabalho" em linguagem clássica de 1920.

## 2. Arquitetura da Gaveta (Copilot Sidebar)
No frontend, o assistente opera como uma "gaveta" (sidebar) fixa na direita da tela (`editor.html`), não obstruindo o campo de visão do editor. É dividido em 3 abas lógicas:
1. **🔎 Aba Pautas (O Investigador):** Módulo de busca na web.
2. **🖋️ Aba Redação (A Sala de Chat Colaborativo):** Módulo conversacional do tipo ChatGPT, acoplado a um "Manuscrito Atual".
3. **⚙️ Aba Configuração:** Módulo de gerenciamento da chave de API. A chave fica salva no `localStorage` do navegador para máxima segurança, isentando o backend de expor credenciais em código ou variáveis de ambiente públicas.

## 3. Componentes de Backend (`admin.py`)

A comunicação entre a Sidebar e a aplicação ocorre através de três rotas API sob o blueprint `/admin`:

### A. Endpoint `/api/search_news` (Investigador)
Responsável pela busca de pautas quentes no mundo atual.
- **Biblioteca Base:** `duckduckgo-search` e `feedparser` (para fallback inteligente).
- **Funcionamento:** O usuário envia uma palavra-chave, o servidor pesquisa nos portais brasileiros e devolve as 5 notícias mais recentes. Se a busca externa for bloqueada (403), o sistema ativa o Fallback de RSS, que lê os portais principais em tempo real, aplica tokenização na palavra-chave (removendo stop words) e pontua as matérias com base na ocorrência dos termos no título e descrição, retornando as 5 mais relevantes.
- **Retorno:** Objeto JSON contendo título, snippet de resumo e URL (`{ title, body, url, source }`).

### B. Endpoint `/api/crawl` (Rastreador)
Responsável por extrair o texto limpo de portais modernos sem distrações (ads/cookies).
- **Biblioteca Base:** `newspaper3k`.
- **Funcionamento:** O editor escolhe a URL da notícia (da aba de Pautas ou externa). O Python faz o download do HTML, executa parsing (lxml), limpa as tags e extrai o Texto Principal e o Título.
- **Retorno:** Objeto JSON com texto puro e título.

### C. Endpoint `/api/chat` (Redator Colaborativo)
O cérebro da operação. O sistema utiliza a API nativa do `google-genai` para comunicação com os LLMs da Google.
- **Modelo:** `gemini-2.5-flash` (escolhido por sua altíssima velocidade, ampla janela de contexto e disponibilidade robusta no tier gratuito da API).
- **Forçamento de Output em JSON:** Para viabilizar a "parceria", o `config` do Gemini recebe `response_mime_type="application/json"`. Isso garante que a IA sempre retorne dois campos distintos processáveis pelo JavaScript:
  - `"message"`: A resposta em chat agindo como persona de 1920.
  - `"updated_text"`: O artigo revisado final (caso seja nulo/vazio, a IA considerará que foi apenas uma conversa e não alterará o manuscrito).
- **Prompting do Sistema:** Foi injetada uma "System Instruction" densa determinando o comportamento do modelo: agir como redator da Belle Époque (Rio de Janeiro), usando vocabulário dramático, poético e substituindo inovações da atualidade (ex: "Internet") por metáforas adequadas aos anos 20 (ex: "telégrafos fantásticos de correntes e fios de cristal").
- **Memória & Contexto Adicional:** No JS, um vetor `chatHistory` acumula as trocas de mensagem. No backend, pouco antes da requisição ao Gemini, o texto que está sendo editado na tela do usuário (o "Manuscrito Atual") é atachado escondido no final da última mensagem. Isso assegura que a IA tem ciência plena do estado momentâneo do texto para realizar correções precisas em cima da base real ("Lapidar a joia").
