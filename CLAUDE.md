# Site Marol Store — contexto do projeto

Landing page estática da **Marol Store** (camisas personalizadas). Tudo está em `index.html` (HTML + CSS + JS embutidos, sem build) e `assets/`. O simulador de uniformes fica no branch `simulador`, com projeto próprio na Vercel.

## Branches e publicação (Vercel)
- `main`: este site, publicado pela Vercel (`vercel.json`: publica a raiz, sem build). **`main` = versão aprovada, no ar.**
- `simulador`: só o simulador, em outro projeto da Vercel.
- Mudanças vão para um branch novo criado a partir do `main`; a Vercel gera uma prévia e, depois da aprovação do dono, o branch é juntado ao `main`. Nunca enviar direto para o `main` sem aprovação.

## Marca
- Marca principal: **Marol Store** (`assets/marol-store.png`, favicon `assets/favicon-store.png`).
- **Marol Sports** (`assets/selo-branco.png`, `assets/logo-branco.png`) é só o segmento de **uniformes esportivos de time** — aparece apenas na seção 01 e no cartão "Uniformes de time". Eventos e Dia a dia não levam o selo.
- WhatsApp: +55 21 96621-4050 (mensagens começam com "Olá, Marol Store!"). Instagram @marolstore2.
- Simulador (externo, branch `simulador`, projeto `simuladormarol` na Vercel): https://simuladormarol.vercel.app/ (menu do topo e seção de times).
- Cor de destaque: amarelo `#F9CA0D`; fontes Barlow / Barlow Condensed / Yellowtail (Google Fonts).

## Estrutura da página
- Menu flutuante com ícones: Uniformes de time · Eventos · Dia a dia (submenu: Coleção Samba, Baterias Cariocas, Maiores do Rio) · Simulador.
- **01 Uniformes de time** (`#times`): banner, animação do chute (scroll), selo Marol Sports.
- **02 Eventos** (`#eventos`): 2.1 Festas (camisa 360º com 8 fotos), 2.2 Corridas, 2.3 Eventos escolares com 3 abas interativas (Olimpíadas IEGC, Arraiá do CEC, Feiras e mostras — camisas recortadas e inclinadas).
- **03 Dia a dia** (`#dia-a-dia`): 3.1 Coleção Samba (`#dia-samba`, Batucada Raiz), 3.2 **Coleção Baterias Cariocas** (`#dia-baterias`), 3.3 **Coleção Maiores do Rio** (`#dia-maiores`), modelagens.
- "Como criamos sua camisa", CTA final, rodapé.

## Baterias Cariocas
- Dados no JS em `K.BAT` (11 escolas): `k` (chave dos arquivos), `name` (bateria), `escola`, cores `c1/c2`, `cap`, `enredo`, `titulo` (ano), `tema`, e `p` (linha Paixão: cores, legenda, tema).
- Duas linhas por escola (estado `batLine`): **Legado** (homenageia o enredo campeão; arquivos `assets/baterias/<k>-f.webp` / `-b.webp`) e **Paixão pelo Samba** (`<k>-p-f.webp` / `-p-b.webp`).
- Marca d'água: logo da escola `assets/baterias/<k>-logo.webp` (uso autorizado pelo dono).
- Chaves: furiosa (Salgueiro), tabajara (Portela), soberana (Beija-Flor), noel (Vila Isabel), invocada (Grande Rio), quente (Mocidade), cadencia (Tijuca), leopoldina (Imperatriz), furacao (Viradouro), tamborim (Mangueira), sinfonica (Império Serrano).
- Legado em versão nova (nov/2026) nas 11 escolas. Imperatriz passou a homenagear o enredo de 2023 ("O Aperreio do Cabra...").
- Sem personalização (nome/número) nessa coleção: é linha casual de fã.
- **Costas legíveis** (linha Legado, todas as escolas): script "Costas legíveis" + `<style id="estilos-costas">`. Botão "Ver costas" (ou clique na camisa de trás) troca frente e costas com animação; no computador, passar o mouse na camisa em destaque mostra uma lupa (sem abrir janela); no celular, "Ampliar" abre a tela cheia com zoom por toque. A frase da nuca aparece em texto abaixo da camisa (lista `NUCA` no script, `|` = quebra de linha) — atualizar ao trocar uma estampa Legado.

## Maiores do Rio
- Homenagem a Flamengo, Botafogo, Vasco e Fluminense; 4 estampas por clube, modelagem oversized.
- Abertura: só os 4 escudos e "Qual é o seu time do coração?". O clique abre a vitrine do clube: o escudo escolhido voa para o centro do palco e cresce, os outros viram abas pequenas centralizadas no topo (trocar de time); o holofote acende, o escudo se dissolve e o modelo sobe no palco (a troca de time pelas abas repete a animação do escudo); ao lado, as outras 3 estampas do clube (clicar troca a do palco). A estampa principal é a que o modelo veste ("No corpo"); as outras mostram Frente/Costas. "Todos os times" volta para a abertura. No celular (até 980px): escudos em 2×2 e as estampas embaixo do palco.
- HTML em `#dia-maiores`, estilos em `<style id="estilos-maiores">`, dados e lógica no script "Maiores do Rio" no fim do `index.html` (lista `CLUBES`: `k`, `nome`, `cor`, `estampas` com `k`, `nome`, `sub` e `foto: true` na que o modelo veste; `corpo: true` nas outras que têm foto vestida, arquivo `corpo-<k>.webp`). Fica fora do `Component`.
- Arquivos em `assets/maiores/`: `escudo-<clube>.webp`, `modelo-<clube>.webp`, `<prefixo>-<estampa>-frente.webp` / `-costas.webp` (prefixos `fla-`, `bot-`, `vas-`, `flu-`; estampas `yamato`, `heranca`, `trama`/`plumagem`, `territorio`). Originais em `originais/maiores-do-rio/` (não vão para o ar).
- Mockups de camisa em fundo bege (frente | costas lado a lado): recortar com `tools/recorte_mockup_bege.py <png> <saída>` (`--sombra` tira a sombra cinza embaixo de barras escuras, não usar em camisas de barra clara; `--grabcut` para fundo com degradê/vinheta ou quando sobra o título grudado na camisa).
- Vídeo da coleção ao fundo do escudo na abertura: `video: true` no clube + `assets/maiores/video-<clube>.mp4` e `.jpg` (capa). Hoje só o Botafogo (3 vídeos de campanha juntos, 23 s, sem som).
- As 16 estampas têm foto vestida (principal = `modelo-<clube>.webp`, demais = `corpo-<k>.webp`). Originais das fotos em `originais/maiores-do-rio/vestidas/`.
- Todas as 16 estampas no ar. Estampa vestida pelo modelo: Flamengo Herança, Botafogo Yamato-e (Garrincha), Vasco Território da Colina, Fluminense Trama Clara.

## Imagens
- O dono manda mockups frente+costas lado a lado com **fundo verde liso**; recorte com `tools/recorte_fundo_verde.py` (corta o cabeçalho e o rodapé com os nomes "FRENTE/COSTAS"; mockups sem esses nomes, como os da Legado de nov/2026, usam `--sem-legenda`, senão a gola e a barra saem cortadas).
- Logos para marca d'água: `tools/logo_marca_dagua.py`.
- Sempre conferir no celular (390px): frente e costas lado a lado, sem sobreposição.

## Como trabalhar
- Estado e renderização: classe `Component` no fim de `index.html` (`this.state`, `renderVals()` devolve os valores usados como `{{...}}` no template `#app-tpl`). Revelações por scroll em `K.REVEALS`.
- Testar localmente: `python3 -m http.server 8080` na raiz e abrir `http://localhost:8080`.
