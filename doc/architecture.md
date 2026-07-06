# Arquitetura do Sistema: A Crônica Ilustrada

Este documento descreve a arquitetura técnica do projeto **A Crônica Ilustrada**, um jornal digital que simula a experiência de leitura de periódicos clássicos.

## Visão Geral da Arquitetura

O projeto adota uma arquitetura **desacoplada**, separando completamente a camada de consumo (Site Público) da camada de gerenciamento de conteúdo (Painel Administrativo/Backend).

A principal decisão arquitetural foi tornar a **interface pública 100% estática e Client-Side**, garantindo máxima performance, ausência de banco de dados SQL, e permitindo hospedagem totalmente gratuita (GitHub Pages). 

Por outro lado, o **Painel Administrativo** funciona como uma aplicação local (`Node.js/Express`) usada exclusivamente pelos redatores no momento da criação do conteúdo, atuando como um verdadeiro *Headless CMS*.

```mermaid
graph TD
    subgraph Frontend Público (GitHub Pages)
        A[main.js / HTML] -->|Fetch no client-side| B(index.json)
        B --> |Informa a edição atual| C(edition-XXXX.json)
        A -->|Renderiza| D[Imagens e Assets]
    end

    subgraph Painel Administrativo Local (Node.js)
        E[admin.js UI] -->|POST / PUT / DELETE| F(Express API server.js)
        F -->|Salva Edição| C
        F -->|Gera/Atualiza| B
        F -->|Upload Multer| D
        F -->|Servidor Estático /data| E
    end
```

## 1. O Site Público (Camada de Leitura)
*Localizado na pasta `/public`.*

- **Zero Banco de Dados:** Todo o conteúdo é lido de arquivos estáticos `.json` que ficam hospedados fisicamente em `/public/data/editions/`. 
- **Índice Automático:** Quando o site carrega, o script solicita primeiro o `index.json`. Este arquivo contém o mapeamento de todas as edições já publicadas. Isso permite ao site carregar automaticamente a edição mais recente na página inicial e preencher o menu "Acervo".
- **Client-Side Rendering (CSR):** O arquivo `js/main.js` injeta o conteúdo no DOM. O layout usa **CSS Grid** e Variáveis Customizadas, sem frameworks externos.
- Detalhes profundos: leia `doc/frontend-public.md`.

## 2. A Mesa do Editor (Backend Administrativo)
*Localizado na pasta `/admin`.*

- **O Motor de Publicação:** Um servidor local (Express) rodando na porta 3000. Ele não deve estar disponível na internet. É apenas a ferramenta local do redator.
- **Armazenamento no File System:** O backend não utiliza SQL ou NoSQL. Ao submeter uma edição, o Node grava diretamente no disco rígido os arquivos JSON nas subpastas apropriadas (ex: `/data/editions/2026/312/edition-312.json`).
- **Automação de Índice:** A cada nova edição salva (ou ao ligar o servidor), o script `server.js` lê todas as pastas e recria o `index.json`, garantindo que o front-end sempre esteja sincronizado.
- Detalhes profundos: leia `doc/backend-admin.md`.

## 3. Fluxo de Vida de uma Edição

1.  **Redação:** O Jornalista abre `http://localhost:3000` na sua máquina local, preenche os formulários via `admin.js` e faz os uploads das imagens da época.
2.  **Gravação e Indexação:** Ao clicar em Salvar, o Express grava as imagens (via Multer), salva o JSON da edição, varre todo o acervo e reconstrói o `index.json`.
3.  **Deploy (Implantação):** O administrador pega toda a pasta `public/` (agora recheada com o novo JSON e as novas imagens) e envia (por arrastar-e-soltar, FTP, ou `git push`) para a hospedagem estática.
4.  **Consumo do Leitor:** O leitor entra no site oficial. O script `main.js` vê que há uma nova versão do `index.json`, descobre o link da nova edição, baixa esse JSON silenciosamente e renderiza o jornal aos olhos do usuário.
