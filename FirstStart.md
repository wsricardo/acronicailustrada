# Bem-vindo(a) a "A Crônica Ilustrada"

**Primeiros Passos (First Start)**

Este é um guia rápido para qualquer pessoa (mesmo sem conhecimentos profundos de programação) entender, ligar e publicar o projeto do jornal digital "A Crônica Ilustrada".

Nosso projeto recria a elegância e a experiência de leitura dos jornais clássicos brasileiros das décadas de 1920 a 1950, mas usando tecnologia moderna, rápida e à prova de falhas.

---

## 1. Resumo do Projeto e Arquitetura

Pense neste projeto não como um site comum, mas como duas ferramentas separadas que trabalham juntas:

1. **A Cara do Jornal (O Site Público):** É o que o leitor acessa. É extremamente rápido porque é apenas um "leitor de textos". Ele não tem um banco de dados pesado. Ele apenas lê arquivos simples de texto (chamados de JSON) e os desenha na tela com um visual de papel antigo e letras clássicas. Fica na pasta `public/`.
2. **A Mesa do Editor (Painel Administrativo):** É uma ferramenta fechada, usada apenas pelos jornalistas da equipe. É um formulário onde você digita as notícias e anexa as fotos. Quando você clica em "Salvar", essa ferramenta cria automaticamente o arquivo de texto (JSON) e o coloca na pasta do Site Público. Fica na pasta `admin/`.

---

## 2. Tecnologias Utilizadas

Para garantir que o jornal dure por décadas sem precisar de grandes manutenções, usamos apenas as "tijolos e cimento" originais da internet, sem modismos passageiros.

*   **HTML, CSS e JavaScript (Vanilla):** As três linguagens básicas que qualquer navegador entende. O HTML monta a estrutura, o CSS faz o design (as colunas do jornal, o papel velho, o sépia nas fotos) e o JavaScript faz o dinamismo (pegar o texto e colar na tela).
    *   *Saiba mais:* [Mozilla Developer Network (MDN) - Aprenda Desenvolvimento Web](https://developer.mozilla.org/pt-BR/docs/Learn)
*   **Node.js & Express.js:** Usados apenas na "Mesa do Editor". O Node.js é um programa que permite que o seu computador funcione como um servidor, recebendo o que você digitou no painel e salvando como um arquivo real no seu disco.
    *   *Saiba mais:* [Site Oficial do Node.js](https://nodejs.org/pt-br) | [Site do Express](https://expressjs.com/pt-br/)

---

## 3. Como Testar e Visualizar no seu Computador

Para ver o jornal rodando na sua máquina, você precisa abrir dois terminais (janelas de comando).

### Passo 1: Ligar a Cara do Jornal (Visão do Leitor)
1. Abra um terminal na pasta principal do projeto (`A Crônica Ilustrada`).
2. Digite o comando abaixo e aperte Enter:
   ```bash
   npx http-server public -p 8084
   ```
3. Abra seu navegador de internet (Chrome, Safari, Edge) e digite: **http://localhost:8084**

### Passo 2: Ligar a Mesa do Editor (Painel de Criação)
1. Abra um *novo* terminal na mesma pasta principal.
2. Entre na pasta do painel digitando: `cd admin`
3. Ligue a mesa do editor digitando: `node server.js`
4. Abra uma nova aba no navegador e digite: **http://localhost:3000**
*(Nesta tela, você pode criar e publicar novas notícias!)*

---

## 4. Como Colocar o Jornal no Ar (Na Internet)

Como nosso site para o público é **100% estático** (não exige banco de dados), hospedá-lo de forma gratuita e super-rápida é muito simples!

Você não precisa enviar a pasta `admin` para a internet. O painel do editor você roda no seu próprio computador de casa. Para a internet, você só envia a pasta `public`.

### Opção A: GitHub Pages (Gratuito e Simples)
Se o seu código já está no GitHub:
1. No site do GitHub, vá no repositório do seu projeto.
2. Vá em **Settings** (Configurações) > **Pages**.
3. Escolha para publicar a partir da pasta `/public` (ou faça o upload apenas dos arquivos de dentro da pasta `public` para um repositório dedicado).
4. Em minutos, seu site estará no ar no endereço `seunome.github.io`.

### Opção B: Netlify ou Vercel (Gratuito e Profissional)
1. Crie uma conta no [Netlify](https://www.netlify.com/) ou no [Vercel](https://vercel.com/).
2. Clique em "Add new site" e arraste a sua pasta **`public`** inteira para a área indicada na tela.
3. Pronto! Eles te darão um link oficial imediatamente (que você pode trocar para `www.seujornal.com.br` depois comprando um domínio). 

Sempre que você criar uma edição nova no seu painel local (`localhost:3000`), basta arrastar a pasta `public` atualizada para o Netlify novamente, e as notícias novas aparecerão para o mundo todo.
