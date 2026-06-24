# Especificações de Implantação Estática (Deployment Spec)

A Crônica Ilustrada foi arquitetada com uma dupla personalidade para garantir segurança de dados e velocidade de entrega. Ela opera como um CMS vivo no ambiente de desenvolvimento local, e como um Site Puramente Estático (SSG - Static Site Generator) em produção, preferencialmente utilizando a arquitetura de **Repositórios Privados no GitHub + Cloudflare Pages**.

## O Motor de Compilação Autônomo

Para transformar o jornal dinâmico em um pacote estático inquebrável, foi desenvolvido um componente de compilação isolado (`scripts/generate-static-api.js`).

### Como Funciona a Compilação (`npm run build:static`)

O comando mestre de implantação engatilha dois processos sequenciais, que são rodados automaticamente na nuvem (ex: Cloudflare Pages) a cada *push* do editor para a branch principal:

1. **Vite Build (`vite build`):**
   O Vite varre a aplicação, comprime o código React/Tailwind, otimiza os assets e copia nativamente todo o conteúdo da pasta `public/` (Imagens do Painel e PDFs da rotativa) para a raiz do diretório final `dist/`.

2. **Prensa Estática (`node scripts/generate-static-api.js`):**
   Imediatamente após o Vite finalizar, o script Node.js autônomo é invocado. Ele entra no banco de dados isolado (`src/data/editions`), lê as matrizes JSON e injeta "clones" dessas edições dentro da pasta de produção em `dist/api/editions/`. Ele também gera um `list.json` atuando como catálogo primário para evitar requisições dinâmicas a servidores inexistentes.

## Arquitetura de URLs
Toda a arquitetura de roteamento de dados do Frontend foi refatorada para solicitar recursos finalizados com extensão explícita `.json` (ex: `/api/editions/list.json`). 

- No ambiente Local (`npm run dev`), o middleware no `vite.config.js` intercepta essas URLs para salvar os dados em tempo real.
- Em Produção (GitHub Pages), essas mesmas URLs resolvem diretamente contra os arquivos físicos gerados na pasta `dist`, entregando velocidades de leitura absolutas sem a necessidade de um servidor Node.js ou Banco de Dados ativo.
