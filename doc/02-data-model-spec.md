# Modelo de Dados (Data Model Spec)

## Estrutura de Persistência
Todos os artigos, imagens e estados do jornal são gravados em um formato JSON estrito em arquivos individuais no diretório `/src/data/editions/` usando o padrão de nomenclatura `edition-[ano]-[numero].json` (ex: `edition-2026-1.json`). O catálogo mestre é indexado no arquivo `/src/data/editions/list.json` durante o build estático. Esses arquivos atuam como o Banco de Dados primário do sistema na Fase 1.

## Schema Padrão (Blank Edition Template)
Ao criar uma nova edição, o sistema serializa a seguinte estrutura de propriedades obrigatórias:

```json
{
  "id": "1", // Chave primária gerada via Date.now() ou incremento
  "status": "draft", // Enum: ['draft', 'published']
  "header": {
    "redacao": "String HTML",
    "titulo_principal": "String",
    "dados_direito": "String HTML",
    "titulo_display": "String",
    "dateline": "String",
    "preco": "String"
  },
  "leadArticle": {
    "paragraphs": ["Array de Strings"],
    "image": { "src": "String (URL ou base64)", "caption": "String" },
    "paragraphs_after_image": ["Array de Strings"]
  },
  "internationalNews": {
    "title": "String",
    "news": [
      { "location": "String", "headline": "String", "body": "String" }
    ]
  },
  "cartoon": {
    "image": "String (URL)",
    "caption": "String",
    "paragraphs": ["Array de Strings"]
  },
  "puzzle": {
    "words": "String (CSV)",
    "grid": ["Array 2D gerado matematicamente"]
  }
  // Demais seções (sports, folhetim, culturalEvents) seguem o padrão aninhado.
}
```

## Como Escalar (Phase 2 Database)
Caso o projeto precise migrar de arquivos `.json` para MongoDB ou SQLite, o contrato do modelo de dados (`blankEditionTemplate` localizado no `AdminPanel.jsx`) deverá ser convertido para um Schema Mongoose (MongoDB) ou Models (Sequelize/Prisma), mantendo a arquitetura hierárquica. 

**Nota Estrutural:** O ecossistema Frontend atualmente consome os dados exigindo a extensão estrita no final da rota (Ex: `fetch('/api/editions/edition-${ano}-${numero}.json')`). Se adotar um banco dinâmico na Fase 2, garanta que o novo Backend continue respondendo a esse padrão de URL ou ajuste as chamadas no Frontend para REST puro (`/api/editions/${ano}/${numero}`).
