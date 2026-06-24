# Visão Geral da Arquitetura (Architecture Overview)

## Propósito do Projeto
"A Crônica Ilustrada" é uma aplicação web Fullstack construída para simular um jornal tipográfico da década de 1920. Além da visualização interativa em tela, o projeto possui um motor especializado na geração de PDFs "Broadsheet" estáticos voltados para impressão clássica, bem como um Painel Administrativo embutido para edição de conteúdo.

## Stack Tecnológica (Tech Stack)
- **Frontend:** React.js, React Router DOM, Tailwind CSS (v4).
- **Animações:** Motion (antigo Framer Motion) para o efeito 3D de virada de página.
- **Backend (Embutido):** Servidor Node.js servido via interceptação de middlewares do `vite.config.js`.
- **Banco de Dados:** Baseado em arquivos JSON individuais por edição no diretório (`src/data/editions/`).
- **Geração de PDF:** Puppeteer (Headless Chrome) com injeção de script de Inteligência Reativa (`page.evaluate()`).

## Estrutura de Diretórios
- `/src/components`: Micro-blocos de UI reutilizáveis (Capa, Mundo, Cartum).
- `/src/pages`: Vistas maiores de roteamento (Leitor Web, Edição Impressa, Painel Admin).
- `/src/data`: Armazenamento de estado em JSON (Isolado e protegido).
- `/scripts`: Scripts autônomos de infraestrutura (ex: `generate-static-api.js` para compilação estática SSG).
- `/src/utils`: Funções puras e scripts acessórios (ex: gerador de matriz para o Caça-Palavras).
- `/public`: Hospedagem estática de PDFs gerados e imagens importadas via painel.

## Padrões de Roteamento
- `/`: Redireciona via script (`LatestEditionRedirect.jsx`) para a última edição salva no banco.
- `/edicao/:ano/:numero`: Rota do leitor principal do usuário final.
- `/edicao/:ano/:numero/imprimir`: Rota invisível ao público, servida cruamente para consumo exclusivo do robô Puppeteer gerar a versão PDF.
- `/admin`: Rota de edição CMS administrativa. Esta rota é isolada (`import.meta.env.DEV`) e removida automaticamente do build estático de produção para garantir segurança e privacidade do editor.
