# Site Marol Store — contexto do projeto

Landing page estática da **Marol Store** (camisas personalizadas). Tudo está em `index.html` (HTML + CSS + JS embutidos, sem build) e `assets/`. Publicado no Netlify a partir deste repositório (`netlify.toml`: publica a raiz, sem build). Branches `main` e `Site-Sports` ficam iguais; o dono publica pelo Netlify.

## Marca
- Marca principal: **Marol Store** (`assets/marol-store.png`, favicon `assets/favicon-store.png`).
- **Marol Sports** (`assets/selo-branco.png`, `assets/logo-branco.png`) é só o segmento de **uniformes esportivos de time** — aparece apenas na seção 01 e no cartão "Uniformes de time". Eventos e Dia a dia não levam o selo.
- WhatsApp: +55 21 96621-4050 (mensagens começam com "Olá, Marol Store!"). Instagram @marolstore2.
- Simulador (externo): https://simuladormsports.netlify.app/ (menu do topo e seção de times).
- Cor de destaque: amarelo `#F9CA0D`; fontes Barlow / Barlow Condensed / Yellowtail (Google Fonts).

## Estrutura da página
- Menu flutuante com ícones: Uniformes de time · Eventos · Dia a dia (submenu: Coleção Samba, Baterias Cariocas) · Simulador.
- **01 Uniformes de time** (`#times`): banner, animação do chute (scroll), selo Marol Sports.
- **02 Eventos** (`#eventos`): 2.1 Festas (camisa 360º com 8 fotos), 2.2 Corridas, 2.3 Eventos escolares com 3 abas interativas (Olimpíadas IEGC, Arraiá do CEC, Feiras e mostras — camisas recortadas e inclinadas).
- **03 Dia a dia** (`#dia-a-dia`): 3.1 Coleção Samba (`#dia-samba`, Batucada Raiz), 3.2 **Coleção Baterias Cariocas** (`#dia-baterias`), modelagens.
- "Como criamos sua camisa", CTA final, rodapé.

## Baterias Cariocas
- Dados no JS em `K.BAT` (11 escolas): `k` (chave dos arquivos), `name` (bateria), `escola`, cores `c1/c2`, `cap`, `enredo`, `titulo` (ano), `tema`, e `p` (linha Paixão: cores, legenda, tema).
- Duas linhas por escola (estado `batLine`): **Legado** (homenageia o enredo campeão; arquivos `assets/baterias/<k>-f.webp` / `-b.webp`) e **Paixão pelo Samba** (`<k>-p-f.webp` / `-p-b.webp`).
- Marca d'água: logo da escola `assets/baterias/<k>-logo.webp` (uso autorizado pelo dono).
- Chaves: furiosa (Salgueiro), tabajara (Portela), soberana (Beija-Flor), noel (Vila Isabel), invocada (Grande Rio), quente (Mocidade), cadencia (Tijuca), leopoldina (Imperatriz), furacao (Viradouro), tamborim (Mangueira), sinfonica (Império Serrano).
- Pendente: estampas Legado novas de Mangueira e Unidos da Tijuca.
- Sem personalização (nome/número) nessa coleção: é linha casual de fã.

## Imagens
- O dono manda mockups frente+costas lado a lado com **fundo verde liso**; recorte com `tools/recorte_fundo_verde.py` (corta o cabeçalho e o rodapé com os nomes "FRENTE/COSTAS").
- Logos para marca d'água: `tools/logo_marca_dagua.py`.
- Sempre conferir no celular (390px): frente e costas lado a lado, sem sobreposição.

## Como trabalhar
- Estado e renderização: classe `Component` no fim de `index.html` (`this.state`, `renderVals()` devolve os valores usados como `{{...}}` no template `#app-tpl`). Revelações por scroll em `K.REVEALS`.
- Testar localmente: `python3 -m http.server 8080` na raiz e abrir `http://localhost:8080`.
