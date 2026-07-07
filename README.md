# A Crônica Ilustrada

Bem-vindo ao repositório de **A Crônica Ilustrada**, um jornal digital que simula a experiência autêntica, estética e tipográfica de periódicos brasileiros das décadas de 1920 a 1950. 

O projeto adota uma arquitetura moderna, rápida e sem banco de dados tradicionais. Toda a "leitura" é feita puramente no navegador do usuário via arquivos estáticos, enquanto o "jornalismo" acontece num painel administrativo local usando Node.js.

## Primeiros Passos

Se você acabou de chegar e quer rodar o projeto no seu computador, leia o nosso **[Guia Rápido de Inicialização (First Start)](FirstStart.md)**. Ele explica de forma simples como ligar o site público e a Mesa do Editor.

## Documentação Técnica

Para desenvolvedores e engenheiros querendo dar manutenção ou criar novas funcionalidades, a pasta `doc/` contém toda a documentação da nossa arquitetura:

- **[Arquitetura do Sistema](doc/architecture.md):** Visão geral de como o site público (Frontend estático) e a Mesa do Editor (Servidor Headless Node.js) conversam entre si, incluindo o servidor híbrido de previews estáticos locais.
- **[O Site Público (Frontend)](doc/frontend-public.md):** Documentação técnica sobre o carregamento dinâmico em Vanilla JS, UX/UI vintage responsivo, SEO e CSS Grid.
- **[A Mesa do Editor (Backend / Admin)](doc/backend-admin.md):** Especificações da API em Express, manipulação do File System (renomeação automática de diretórios, hard refresh de estado e exclusão atômica em cascata) e indexação de edições.
- **[Guia Linguístico](GUIA_LINGUISTICO.md):** Regras de ouro de como escrever textos usando ortografia e jargões da época (phármacia, telegrammas, etc.).
- **[Guia de Monetização (AdSense)](Guia_AdSense.md):** Como posicionar anúncios de forma não-intrusiva mantendo a estética vintage.

## Deploy (GitHub Pages)

O projeto foi inteiramente desenhado para o ecossistema estático do GitHub Pages com a **Separação Estrita de Contextos**. 
Você usa a pasta `/admin` apenas na sua máquina local para gerenciar o acervo (Gerador Estático/Headless CMS). Quando sua matéria estiver pronta, o GitHub Pages se encarregará de servir **exclusivamente** os arquivos estáticos da pasta `/public` com zero custo de servidor.

## Performance, SEO e Segurança

O projeto é otimizado para os Core Web Vitals e para mecanismos de busca:
- **Segurança (Frontend):** Conta com metatag *Content Security Policy* (CSP) para prevenir injeções de script (XSS).
- **SEO & Social:** Arquivos `robots.txt` e `sitemap.xml` integrados, além de suporte a Open Graph tags (`og:image`) para o compartilhamento em redes sociais com identidade visual coesa.
- **Performance:** As fontes e dados principais (`index.json`) possuem instrução de pré-carregamento (`preload`), e o script dinâmico é assíncrono (`defer`). O carregamento de imagens usa native lazy loading (`loading="lazy"`) e decodificação assíncrona, enquanto a imagem de destaque recebe alta prioridade (`fetchpriority="high"`).

## Licença

Todos os direitos reservados ao seu autor e desenvolvedor Wandeson Ricardo  d'A Crônica Ilustrada.