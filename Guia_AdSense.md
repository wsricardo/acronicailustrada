# Guia Prático: Monetização com Google AdSense

Este documento explica, de forma simples e direta, como preparar o jornal **A Crônica Ilustrada** para exibir anúncios e gerar receita utilizando o programa **Google AdSense**.

Graças à nossa arquitetura enxuta (apenas arquivos HTML e JavaScript), o processo de integração é o mais fácil possível. Não é necessário instalar nenhum plugin pesado ou configurar servidores complexos.

---

## 1. O Que é o Google AdSense?

O AdSense é o serviço oficial do Google que permite aos donos de sites exibir anúncios publicitários. O Google se encarrega de encontrar anunciantes e você ganha uma quantia toda vez que um leitor clica no anúncio ou o visualiza.

**Como funciona a mágica?** 
O Google te entrega um pequeno "código de programação" (um texto pequeno). Tudo o que você precisa fazer é colar esse texto dentro do código do seu site. A partir daí, o Google faz o resto.

---

## 2. Passo a Passo Técnico da Integração

A integração no nosso projeto envolve apenas a edição de arquivos na pasta `public/`. **Não é necessário alterar nada na pasta `admin` (Mesa do Editor).**

### Passo A: Conectar o Site ao Google
1. Crie uma conta no [Google AdSense](https://adsense.google.com/).
2. O Google pedirá a URL (o endereço) do seu site já publicado na internet (ex: `www.acronicailustrada.com.br`).
3. O Google fornecerá um **código principal**. Ele se parece com isso:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
4. **Onde Colar:** Abra o arquivo `public/index.html`. Procure pela palavra `<head>`. Cole esse código logo abaixo dessa palavra. Isso fará com que o Google comece a monitorar o seu site para aprová-lo.

### Passo B: Espalhar os Anúncios (Blocos de Anúncio)
Depois que o site for aprovado pelo Google, você cria "Blocos de Anúncio". Cada bloco gera um novo código que se parece com isso:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**Onde Colar:**
*   **Para anúncios fixos (Rodapé ou Cabeçalho):** Você pode abrir o `public/index.html` e colar esse código no final da página (antes de fechar a tag `</body>`).
*   **Para anúncios no meio das matérias:** Um desenvolvedor pode abrir o `public/js/main.js` e programar o sistema para "injetar" esse código automaticamente a cada 2 artigos que o leitor rolar na tela.

---

## 3. O Desafio Visual: Anúncios vs. Anos 20

O nosso jornal tem um design vintage e sépia (cores amareladas). Os anúncios do Google modernos virão super coloridos. Isso criará um "choque" de épocas.

**Como podemos resolver isso mantendo a elegância?**

1. **Anúncios de Texto e Display Nativos:** No painel do Google AdSense, configure seus blocos para se adaptarem à página. Você pode definir as cores da borda e do texto do anúncio para serem marrom-escuro, disfarçando o anúncio como um "Classificado Antigo".
2. **Filtro CSS de Envelhecimento:** Podemos aplicar a classe CSS de envelhecimento que já existe no nosso projeto diretamente nos anúncios do Google, aplicando a regra abaixo no `public/css/style.css`:
   ```css
   ins.adsbygoogle iframe {
       filter: sepia(0.8) contrast(1.2) grayscale(0.5);
   }
   ```
   *Nota técnica: Embora seja possível via código, é importante verificar nos [Termos do AdSense](https://support.google.com/adsense/answer/48182?hl=pt-BR) se a alteração extrema do visual do anúncio não viola a política de modificação de código da plataforma.*

---

## 4. Links Oficiais para Leitura Profunda (Avançado)

Se você, ou o desenvolvedor que for assumir o código, quiser entender as entranhas de como manipular os anúncios com mais controle, recomendamos as leituras abaixo:

*   [Ajuda Oficial do AdSense: Como adicionar o código do AdSense ao site](https://support.google.com/adsense/answer/9274634) (Guia para leigos).
*   [Guia para Desenvolvedores: AdSense Auto ads](https://developers.google.com/adsense/management/getting_started) (Como automatizar a entrega).
*   [MDN Web Docs: Tag `<script>`](https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/script) (Entenda como o código que colamos no `index.html` funciona por baixo dos panos).
*   [MDN Web Docs: CSS Filters](https://developer.mozilla.org/pt-BR/docs/Web/CSS/filter) (Como o filtro de cor `sepia` funciona tecnicamente sobre as imagens e anúncios).
