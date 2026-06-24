# Guia de Monetização e Anúncios (Google AdSense)

Este documento detalha como gerenciar, inserir e ativar os anúncios reais do Google AdSense dentro da arquitetura estática d'A Crônica Ilustrada. A infraestrutura base para receber os anúncios já foi implementada no código.

## 1. A Infraestrutura Atual
A aplicação já possui os seguintes elementos construídos para monetização:
- Componente inteligente `src/components/AdSensePlaceholder.jsx`.
- Arquivo público de verificação de propriedade `public/ads.txt`.
- Roteamento e layouts adaptados para não quebrar a estética "Broadsheet Clássica" de 1920 quando um anúncio for renderizado.

## 2. Como Ativar os Anúncios Reais (Passo a Passo)
Quando sua conta do Google AdSense for aprovada, você receberá alguns códigos. Siga estas 4 etapas, que precisam ser feitas **apenas uma vez**.

### Passo 2.1: O Script Global
O Google fornecerá um script `<script async src="https://pagead2..."></script>`. 
1. Abra o arquivo raiz `index.html` (ele fica fora da pasta `src`).
2. Cole este `<script>` imediatamente antes da tag de fechamento `</head>`.

### Passo 2.2: O Client ID (Sua Conta)
Seu identificador único no AdSense começa com `ca-pub-`. 
1. Abra o arquivo `src/components/AdSensePlaceholder.jsx`.
2. Vá até a **linha 28** (ou procure pela tag `<ins>`).
3. Altere a propriedade `data-ad-client="ca-pub-XXXXXXXXXXXXXXX"` colando o seu número real no lugar dos "X".

### Passo 2.3: Configurando o Arquivo Ads.txt
O Google precisa provar que você é o dono do site. Ele fornecerá uma linha de texto contendo seu Client ID, o código da rede e a certificação.
1. Abra o arquivo `public/ads.txt`.
2. Cole a linha exata que o Google te forneceu. (Ex: `google.com, pub-1234567890, DIRECT, f08c47fec0942fa0`).
3. Como este arquivo está na pasta `public`, ao rodar o comando de compilação, ele automaticamente será colocado na raiz do site público (`seusite.com/ads.txt`).

## 3. Gerenciando Blocos de Anúncios (Slots)
No painel do Google AdSense, você deve criar "Blocos de Anúncios Gráficos" (Display Ads) responsivos. Ao criar um bloco, o Google te dará um **ID de Slot** (um número de cerca de 10 dígitos).

Para colocar esse anúncio específico em qualquer lugar do jornal, abra o código da página correspondente (ex: `src/pages/Page4_Cultura.jsx`) e invoque o nosso componente passando o número do slot:

```javascript
import AdSensePlaceholder from '../components/AdSensePlaceholder';

// Dentro do seu código React:
<AdSensePlaceholder slotId="9876543210" />
```

## 4. O Modo de Desenvolvimento (Mock de Segurança)
**Atenção:** O Google AdSense bane contas severamente se perceber que o dono do site está clicando nos próprios anúncios ou se a página está gerando "impressões falsas" através de atualizações automáticas de servidor de desenvolvimento.

Para proteger sua conta, o componente `AdSensePlaceholder` possui um sistema de defesa:
- Se você estiver rodando `npm run dev` no seu PC, os anúncios **reais são bloqueados**. Em vez da propaganda, você verá uma caixa pontilhada escrito "Anúncio (Dev Mode) - Slot: XXX".
- Apenas quando o Cloudflare gerar a versão final (`npm run build:static`) é que o código real de publicidade será injetado e entregue aos leitores na internet.
