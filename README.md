# Simulador de uniformes – Marol Sports

Simulador de uniformes de futebol, feito do zero. É um site estático, sem
dependências em tempo de execução: HTML, CSS e JavaScript puros. Pode ser
publicado em qualquer hospedagem, inclusive em `marolsports.com/simulador/`.

## O que ele faz

- **Modelos:** 183 modelos do catálogo, com miniaturas, busca por número e
  filtro por quantidade de cores. A camisa e o calção podem ter o mesmo modelo
  ou modelos diferentes. Dá para simular só a camisa, só o calção, ou os dois
  com meião.
- **Cores:** cartela com 48 cores com referência Pantone/TCX, para a base e para
  cada camada da estampa. A camisa e o calção podem ter as mesmas cores ou cores
  independentes.
- **Gola e punho:**
  - golas Careca e V, com cor;
  - mangas montadas separadas do corpo, sempre na cor de fundo do uniforme;
  - punho simples ou sem punho.
- **Meião:** visto de frente, com uma cor.
- **Nome e número:** 4 fontes (a "Universitária" imita o estilo College), cor e
  contorno. O nome pode ficar acima ou
  abaixo do número. O número também pode ir na frente (3 posições) e no calção.
  Há textos extras livres.
- **Escudo e patrocínio:** envio de PNG, JPG, WEBP ou SVG (até 5 MB) em 10
  posições pré-definidas, com tamanho ajustável.
- **Ajuste fino:** nomes, números e imagens podem ser arrastados direto no
  uniforme.
- Vista de frente, de costas ou as duas lado a lado, e três fundos de contraste
  (claro, neutro e escuro).
- Desfazer e refazer (Ctrl+Z / Ctrl+Y).
- **Baixar imagem:** PNG com o uniforme, o logo e a ficha com as cores.
- **Armário:** simulações salvas no navegador e um link compartilhável da
  simulação. Imagens enviadas não vão no link.
- **Pedir orçamento:** formulário com quantidades por tamanho que abre o
  WhatsApp da Marol com o resumo completo e baixa a imagem para anexar. O número
  fica na constante `WHATSAPP` em `simulador/js/app.js`.

## Mockup em foto (teste)

Além do visual ilustrado, o simulador tem o visual **Foto** (botão "Foto /
Ilustração" no palco), montado sobre a foto `ferramentas/mockup/base.webp`
(camisa e calção brancos, de frente e de costas):

- a estampa é pintada por baixo, encaixada na camisa e no calção da foto;
- a foto entra por cima como mapa de sombras (multiplicar) e de brilhos (tela).
  Por isso as dobras, as costuras e o tecido aparecem em qualquer cor;
- a gola e os punhos são coloridos por regiões medidas na foto. A foto tem gola
  V e manga raglan: o script apaga as costuras raglan, porque a camisa da Marol
  tem manga comum (a costura certa é desenhada pelo simulador), e gera uma
  versão da frente sem o V para a gola Careca.

Para trocar a foto, rode
`python3 ferramentas/preparar-mockup-foto.py <foto> simulador/mockup`. O script
gera os contornos e os mapas de luz em `simulador/mockup/`. As regiões de gola,
punhos e costuras estão em coordenadas da foto dentro do script e precisam ser
reajustadas para outra imagem.

> **Licença:** se a foto veio de um banco de imagens (Freepik, Envato etc.),
> confirme que a licença permite usá-la no site antes de publicar.

## Rodar localmente

```bash
npx http-server simulador -p 8080
# abra http://localhost:8080
```

O simulador precisa ser servido por HTTP, porque abrir o `index.html` direto do
disco bloqueia o carregamento dos modelos.

## Estrutura

```
simulador/
  index.html, css/, js/       aplicação
  js/cores.js                 cartela de cores (edite aqui para incluir ou remover cores)
  js/render.js                desenho do uniforme: gola, manga, meião, posições de nome/número/escudo
  js/app.js                   interface, histórico, armário, exportação e orçamento
  dados/modelos.json          índice do catálogo + silhuetas da camisa e do calção
  dados/modelos/<n>.json      camadas de cada modelo (geradas a partir dos SVGs)
  dados/miniaturas/*.webp     miniaturas do catálogo
  fontes/                     fontes de licença aberta (OFL) usadas no nome e número
  mockup/                     contornos e mapas de luz do mockup em foto
ferramentas/
  converter-modelos.mjs       converte os SVGs do CorelDRAW para dados/modelos
  classificar-camadas.mjs     sugere se camadas de um lado só são fundo ou destaque
  ajustes-manuais.json        decisão final de cada camada de um lado só (tem prioridade)
  lados-camadas.json          sugestões geradas pelo classificar-camadas.mjs
  verificar-camadas.mjs       encontra camadas vazias ou cobertas (cor sem efeito)
  camadas-invisiveis.json     camadas que o conversor remove por não aparecerem
  gerar-miniaturas.mjs        gera as miniaturas usando o próprio simulador
```

## Adicionar ou atualizar modelos

1. No CorelDRAW, exporte cada cor da estampa como um SVG separado, dentro de
   `Modelo N/Camisa/` e `Modelo N/Calção/`, no mesmo tamanho de página usado
   nos modelos atuais. O conversor reconhece estes nomes de arquivo:
   - `1.svg` / `1c.svg` (frente / costas);
   - `1_camisa_frente.svg` / `1_camisa_verso.svg`;
   - `calcao1frente.svg` / `calcao1verso.svg`;
   - `camisa_1_1_N.svg` / `camisa_1_2_N.svg`;
   - `desenho1.svg` / `desenho1costas.svg`.
2. Rode o conversor e depois as miniaturas, com o servidor local ligado:

```bash
npm install
npm run converter
npm run servir            # em outro terminal
npm run miniaturas
```

### Camadas que existem só de um lado

Em alguns modelos, uma camada foi exportada só para a frente ou só para as
costas (ex.: modelo 51, com o listrado só em `1c.svg` e o gorila só em
`3.svg`). O conversor resolve cada caso assim:

- **Fundo (`ambos`):** listras, texturas, estampas corridas, mangas, degradês e
  faixas do calção. A camada é repetida na frente e nas costas.
- **Destaque (`frente`):** animais, personagens e grafismos do peito. A camada
  aparece só na frente.
- **`manter`:** a frente e as costas têm desenhos diferentes de propósito. A
  camada fica onde foi exportada.

As decisões ficam em `ferramentas/ajustes-manuais.json`, numeradas pela posição
da camada. Por exemplo, `"51": { "camisa": { "1": "ambos" } }`. Para modelos
novos, rode `node ferramentas/classificar-camadas.mjs http://localhost:8080/ revisao.png`:
ele grava sugestões em `lados-camadas.json` e uma folha de revisão. Depois,
corrija o que for preciso no arquivo de ajustes e rode `npm run converter`.

### Cores que não mudam nada

Algumas camadas foram exportadas vazias ou ficam totalmente cobertas por outras.
Nesses casos, o campo de cor correspondente não teria efeito. O
`verificar-camadas.mjs` pinta cada camada de preto e depois de branco e compara
os pixels da peça. Quando nada muda, a camada vai para
`camadas-invisiveis.json` e o conversor a remove. Depois de adicionar modelos,
rode na ordem: `npm run converter`, `node ferramentas/verificar-camadas.mjs` (com
o servidor ligado), `npm run converter` de novo e `npm run miniaturas`.

### Arquivos que o conversor não aproveitou nesta versão

- **Modelos só com calção:** 23 modelos não têm camisa e ficam fora do catálogo.

- **Modelo 148:** as pastas `Camisa` e `Calção` parecem trocadas e os SVGs têm
  proporções diferentes do padrão. Precisa ser exportado de novo.
- **Modelos 87 e 90:** o `costas.svg` só tem o contorno, sem desenho. As costas
  ficam lisas na cor base.
- **Modelos sem SVG:** das 502 pastas de modelo, 295 têm só o arquivo `.cdr`
  (entre eles os modelos 1 a 38). Para entrarem no catálogo, exporte as camadas
  em SVG como no passo 1.

## O que não foi reproduzido do simulador antigo

- **Login e cadastro de clientes.** Precisam de servidor e banco de dados. No
  lugar, o armário salva as simulações no próprio navegador e o orçamento vai
  direto para o WhatsApp.
- **Outras modalidades** (feminino, goleiro, etc.). A estrutura já comporta,
  basta enviar os SVGs de cada categoria.
