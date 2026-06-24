# 09 - Especificação do Painel Administrativo (CMS)

## 1. Visão Geral
O Painel Administrativo é o coração editorial de "A Crônica Ilustrada". Ele foi desenhado para ser uma interface robusta, segura e altamente visual, substituindo edições diretas de JSON por uma experiência interativa focada no redator e no editor-chefe. 

## 2. Autenticação e Segurança
- O acesso ao painel é restrito através do `Flask-Login`.
- A rota `/admin` e todas as sub-rotas (ex: `/admin/editor`, `/admin/api/*`) são protegidas pelo decorador `@login_required`.
- Há um sistema de gerenciamento de Sessão Seguro que expulsa usuários não autenticados de volta para a tela de login.

## 3. Gerenciamento de Edições (Dashboard)
A tela inicial do painel lista todas as edições no banco de dados SQLite (`Edition` table).
- **Listagem:** As edições são apresentadas com Título, Data de Publicação, Volume, Número e Status.
- **Status da Edição:** 
  - `Draft` (Rascunho): Visível apenas no painel administrativo, o redator ainda está trabalhando no texto.
  - `Published` (Publicado): Fica visível para o público no frontend do jornal.
- Ações incluem Editar, Deletar e Criar Nova Edição.

## 4. O Construtor Visual (Editor de Seções)
Em vez de um grande campo de texto não formatado, o sistema emprega uma interface orientada a "Blocos" e "Abas" usando Vanilla Javascript, oferecendo uma experiência livre de distrações e altamente escalável.

### Estrutura de Abas (Tabs)
Para manter o conteúdo organizado, o jornal é dividido em abas modulares:
1. **Geral:** Metadados da edição (Título, Volume, Número, Data, Status).
2. **Manchete Principal (Cover):** O artigo principal que atrai os leitores (Título, Imagem, e blocos de Parágrafos dinâmicos).
3. **Editoriais:** Artigos opinativos curtos e afiados do Diretor de Redação (Título, Texto).
4. **Colunistas:** Textos de convidados ou redatores específicos (Título, Autor, Conteúdo).
5. **Charge / Humor:** Ilustrações satíricas e pequenas notas cômicas (Imagem da Charge, Citação/Mote).

### Manipulação do DOM (Javascript Dinâmico)
A inserção de múltiplos parágrafos, colunas ou editoriais é feita de forma dinâmica (Client-Side).
- O administrador pode clicar em "Adicionar Parágrafo" ou "Adicionar Colunista".
- O Javascript cria novos `divs` no DOM com inputs (HTML5).
- O usuário também pode deletar blocos dinâmicos (`remove()`).

## 5. Serialização (Data Mapping)
Para interagir com o modelo SQL que guarda a edição inteira em um campo `content` de tipo TEXT, a interface de usuário serializa (monta) os dados antes do POST.
- Ao clicar em "Salvar", um evento Javascript previne a submissão nativa e itera por todas as abas.
- Ele extrai os valores de cada input, junta listas de parágrafos em Arrays.
- Ele monta um enorme objeto Javascript aderente ao Schema de Conteúdo do Jornal (ver `02-data-model-spec.md`).
- Este objeto é convertido usando `JSON.stringify()` e injetado em um input `<input type="hidden" name="content_json">`.
- O Python/Flask no Backend (`admin.py`) intercepta essa String JSON, faz as devidas sanitizações e grava na base de dados relacional (SQLite/Postgres).

## 6. Integração com IA
A barra lateral foi construída modularmente. Sua presença (HTML/CSS/JS) reside no próprio `editor.html`, mas toda a lógica cognitiva, buscas web e integração LLM estão documentadas na Especificação do "Fantasma de Assis".
