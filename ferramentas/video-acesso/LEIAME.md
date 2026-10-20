# Vídeo da tela de cadastro

`simulador/midia/acesso.mp4` (e `.webm`, `acesso-poster.jpg`) mostra o uniforme sendo
montado no simulador e, em seguida, o mesmo uniforme vestido por um jogador.

- **Foto do jogador:** `jogador.jpg`, do Unsplash (foto NYxDAfieQVI, de Fares Hamouche,
  https://unsplash.com/photos/NYxDAfieQVI). A licença do Unsplash permite uso comercial
  sem pedir autorização. As marcas da foto original (logos, escudo e número) foram apagadas.
- **Uniforme do vídeo:** `uniforme.js` (modelo, cores, nome e número). As duas cenas usam
  esse arquivo.

## Como gerar de novo

Numa pasta de trabalho `T` (fora do repositório), com o simulador servido em
`http://localhost:8080` (`npx http-server simulador -p 8080 -c-1`):

```bash
cp ferramentas/video-acesso/jogador.jpg $T/ && mkdir -p $T/jog $T/video/jogador $T/video/fa $T/video/fb
cp ferramentas/video-acesso/*.{py,mjs,html,js} $T/video/ && mv $T/video/*.py $T/jog/
ln -s "$PWD/simulador" $T/video/sim
python3 $T/jog/masks.py $T && python3 $T/jog/luz.py $T && python3 $T/jog/export.py $T   # requer opencv-python-headless
npx http-server $T/video -p 8093 -c-1 &                       # em outro terminal
node $T/video/gravar-simulador.mjs $T/video/fa                # cena 1: simulador
node $T/video/gravar-jogador.mjs $T/video/fb                  # cena 2: jogador
node $T/video/selo.mjs $T/video/selo1.png                     # selo "1 · Monte no simulador"
```

Depois, junte as cenas com o ffmpeg: a cena 1 acelerada 1,4×, com o selo; a passagem para
a cena 2 em 0,6 s; e as versões MP4 (H.264) e WebM (VP9).

- `masks.py`: recorta a camisa, o calção e as meias da foto.
- `luz.py`: gera os mapas de sombra e brilho, sem as marcas.
- `export.py`: grava `jogador.json` no formato do mockup em foto do simulador e limpa as chuteiras.
- `jogador.html`: desenha o jogador com o `montarPalcoFoto` do próprio simulador.
