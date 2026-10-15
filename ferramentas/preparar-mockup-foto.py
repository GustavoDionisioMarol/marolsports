#!/usr/bin/env python3
"""Prepara o mockup fotográfico (camisa e calção brancos, frente e costas).

A partir da foto base, gera em simulador/mockup/:
  - sombra-<lado>.webp : mapa de sombras (multiplicar) recortado para cada lado
  - brilho-<lado>.webp : mapa de brilhos (tela) para cores escuras
  - foto.json          : contornos vetoriais da camisa e do calção, regiões da
                         gola, mangas e punhos, e onde encaixar as estampas.

Uso: python3 ferramentas/preparar-mockup-foto.py ferramentas/mockup/base.webp simulador/mockup
Requer Pillow e NumPy.
"""
import json
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

src, destino = sys.argv[1], sys.argv[2]
foto = Image.open(src).convert('L')
L = np.asarray(foto).astype(np.float32)
H, W = L.shape

# ------------------------------------------------------------------ fundo x peças
# O fundo é liso e as peças têm textura de malha: o fundo é preenchido a partir
# das bordas, só por pixels lisos e de tom parecido.
blur = np.asarray(foto.filter(ImageFilter.GaussianBlur(2))).astype(np.float32)


def caixa(a, r):
    c = np.pad(a, r + 1, mode='edge').cumsum(0).cumsum(1)
    k = 2 * r + 1
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k])[:a.shape[0], :a.shape[1]] / (k * k)


textura = np.sqrt(np.maximum(caixa(((L - blur) ** 2).astype(np.float64), 4), 0))
liso = textura < 1.5
fundo = np.zeros((H, W), bool)
fila = deque()
for x in range(W):
    for y in (0, H - 1):
        if liso[y, x]:
            fundo[y, x] = True
            fila.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if liso[y, x]:
            fundo[y, x] = True
            fila.append((y, x))
while fila:
    y, x = fila.popleft()
    v = blur[y, x]
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and not fundo[ny, nx] and liso[ny, nx] and abs(blur[ny, nx] - v) <= 3:
            fundo[ny, nx] = True
            fila.append((ny, nx))
pecas = Image.fromarray(np.where(fundo, 0, 255).astype(np.uint8))
pecas = pecas.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))  # tira reflexos finos do chão
pecas = pecas.filter(ImageFilter.MinFilter(5))  # recua 2 px para a cor não vazar na transição com o fundo
pecas = np.asarray(pecas) > 127

# ------------------------------------------------------------------ medidas da foto
# barra da camisa (onde começa o calção) e barra das pernas do calção
LADOS = {
    'frente': {'recorte': [120, 20, 650, 945], 'barra': 652},
    'costas': {'recorte': [768, 20, 650, 945], 'barra': 650},
}
BARRA_CALCAO = 952


def contorno(mascara):
    """Contorno externo (vizinhança de Moore, sentido horário), simplificado."""
    ys, xs = np.nonzero(mascara)
    inicio = (int(ys[0]), int(xs[0]))  # primeiro pixel varrendo de cima para baixo
    viz = [(0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1)]
    dentro = lambda y, x: 0 <= y < H and 0 <= x < W and mascara[y, x]
    atual, volta = inicio, (inicio[0], inicio[1] - 1)
    pontos = [inicio]
    for _ in range(200000):
        k0 = viz.index((volta[0] - atual[0], volta[1] - atual[1]))
        for i in range(1, 9):
            k = (k0 + i) % 8
            ny, nx = atual[0] + viz[k][0], atual[1] + viz[k][1]
            if dentro(ny, nx):
                kv = (k - 1) % 8
                volta = (atual[0] + viz[kv][0], atual[1] + viz[kv][1])
                atual = (ny, nx)
                break
        if atual == inicio:
            break
        pontos.append(atual)
    return simplificar([(x + 0.5, y + 0.5) for y, x in pontos], 0.7)


def simplificar(p, eps):
    """Douglas-Peucker iterativo."""
    manter = [False] * len(p)
    manter[0] = manter[-1] = True
    pilha = [(0, len(p) - 1)]
    while pilha:
        a, b = pilha.pop()
        (x1, y1), (x2, y2) = p[a], p[b]
        dx, dy = x2 - x1, y2 - y1
        n = (dx * dx + dy * dy) ** 0.5 or 1
        idx, dmax = None, 0
        for i in range(a + 1, b):
            d = abs(dy * p[i][0] - dx * p[i][1] + x2 * y1 - y2 * x1) / n
            if d > dmax:
                idx, dmax = i, d
        if idx is not None and dmax > eps:
            manter[idx] = True
            pilha += [(a, idx), (idx, b)]
    return [q for q, k in zip(p, manter) if k]


def caminho(pontos):
    return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pontos) + 'Z'


# ------------------------------------------------------------------ retoques da foto
from PIL import ImageDraw


def mascara_de(desenhar):
    m = Image.new('L', (W, H), 0)
    desenhar(ImageDraw.Draw(m))
    return np.asarray(m) > 127


def preencher(img, mascara, iteracoes=400):
    """Apaga a região da máscara: preenchimento suave (Laplace) a partir das
    bordas e, por cima, a textura da malha copiada de logo abaixo da região."""
    out = img.copy()
    ys, xs = np.nonzero(mascara)
    y0, y1, x0, x1 = ys.min() - 2, ys.max() + 3, xs.min() - 2, xs.max() + 3
    sub = out[y0:y1, x0:x1]
    m = mascara[y0:y1, x0:x1]
    sub[m] = sub[~m].mean()
    for _ in range(iteracoes):
        media = (np.roll(sub, 1, 0) + np.roll(sub, -1, 0) + np.roll(sub, 1, 1) + np.roll(sub, -1, 1)) / 4
        sub[m] = media[m]
    # textura: detalhe fino (passa-alta) de uma faixa logo abaixo
    desfoque = np.asarray(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32)
    detalhe = img - desfoque
    alt = y1 - y0
    doador = detalhe[min(y1 + 10, H - alt):min(y1 + 10, H - alt) + alt, x0:x1]
    sub[m] += doador[m] * 0.9
    out[y0:y1, x0:x1] = sub
    return out


# costuras raglan da foto (frente; as costas repetem deslocadas): são apagadas,
# porque a camisa da Marol tem manga comum (a costura certa é desenhada no simulador)
RAGLAN_E = [(366, 60), (348, 72), (330, 85), (305, 105), (285, 125), (270, 160), (262, 200), (262, 240), (266, 270), (273, 300)]
RAGLAN_D = [(898 - x, y) for x, y in RAGLAN_E]
DESLOC = 648.5


def apagar_raglan(d):
    for pts in (RAGLAN_E, RAGLAN_D, [(x + DESLOC, y) for x, y in RAGLAN_E], [(x + DESLOC, y) for x, y in RAGLAN_D]):
        d.line(pts, fill=255, width=17, joint='curve')


L_base = preencher(L, mascara_de(apagar_raglan) & pecas, iteracoes=250)

# variante com gola careca: apaga o V da frente (faixa + abertura) e o simulador desenha a gola redonda
V_FRENTE = [(344, 44), (352, 66), (366, 86), (388, 106), (414, 124), (449, 146), (484, 124), (512, 106), (532, 86), (544, 66), (546, 44), (530, 38), (449, 36), (370, 38)]
L_careca = preencher(L_base, mascara_de(lambda d: d.polygon(V_FRENTE, fill=255)), iteracoes=500)

def mapas_de_luz(reg, nome):
    # sombras: luminância relativa ao branco do tecido, com um pouco mais de contraste
    sombra = np.clip(reg / ref, 0, 1) ** 1.35
    # brilhos: só onde o tecido é mais claro que a vizinhança (relevo das dobras),
    # para dar volume às cores escuras sem lavar a peça inteira
    media = np.asarray(Image.fromarray(reg.astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))).astype(np.float32)
    brilho = np.asarray(Image.fromarray(np.clip((reg - media) / 26 * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    Image.fromarray((sombra * 255).astype(np.uint8)).save(f'{destino}/sombra-{nome}.webp', quality=88)
    Image.fromarray((brilho * 255).astype(np.uint8)).save(f'{destino}/brilho-{nome}.webp', quality=85)


saida = {'largura': W, 'altura': H, 'lados': {}}
garment_lum = L[pecas]
ref = float(np.percentile(garment_lum, 97))  # branco do tecido
for lado, cfg in LADOS.items():
    x0, y0, w, h = cfg['recorte']
    parte = np.zeros_like(pecas)
    parte[:, x0:x0 + w] = pecas[:, x0:x0 + w]
    camisa = parte.copy()
    camisa[cfg['barra']:, :] = False
    calcao = parte.copy()
    calcao[:cfg['barra'] - 30, :] = False
    calcao[BARRA_CALCAO:, :] = False
    info = {'recorte': cfg['recorte'], 'pecas': {}}
    for nome, m in (('camisa', camisa), ('calcao', calcao)):
        ys, xs = np.nonzero(m)
        info['pecas'][nome] = {'caminho': caminho(contorno(m)), 'caixa': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}
    # mapas de luz recortados para o lado (frente também na versão gola careca)
    variantes = [('', L_base)] + ([('-careca', L_careca)] if lado == 'frente' else [])
    for sufixo, fonte in variantes:
        mapas_de_luz(fonte[y0:y0 + h, x0:x0 + w], f'{lado}{sufixo}')
    saida['lados'][lado] = info


# ------------------------------------------------------------------ regiões desenhadas à mão
# Coordenadas na foto (px). As costas repetem os punhos da frente deslocados.
# punhos medidos na barra das mangas (acompanham a inclinação de cada manga)
punho_e = [(150, 290), (266, 318), (268, 344), (148, 314)]
punho_d = [(622, 319), (742, 296), (744, 318), (624, 345)]
mover = lambda pts, dx: [(x + dx, y) for x, y in pts]
poli = lambda pts: 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'
saida['lados']['frente'].update({
    'punhos': poli(punho_e) + poli(punho_d),
    # gola V: faixa da gola e abertura (interior da camisa, com a gola de trás)
    'gola': 'M347 47C351 64 362 82 384 101C404 118 428 131 449 142C470 131 494 118 514 101C530 85 538 66 539 46'
            'C533 42 527 41 522 43C519 62 507 82 484 100C470 110 459 115 449 120C439 115 428 110 414 100C392 82 379 62 374 44'
            'C366 41 356 42 347 47Z',
    'abertura': 'M374 44C379 62 392 82 414 100C428 110 439 115 449 120C459 115 470 110 484 100C507 82 519 62 522 43C495 39 400 39 374 44Z',
    'golaInterna': 'M378 52C410 49 490 49 519 51L518 66C490 62 410 62 382 66Z',
    # gola careca (usa os mapas de luz "-careca", em que o V da foto foi apagado)
    'careca': {
        # decote redondo comum (mais baixo que uma gola alta)
        'gola': 'M359 41C377 108 521 108 539 41C533 39 527 39 522 43C505 88 393 88 376 43C370 39 365 39 359 41Z',
        'abertura': 'M376 43C393 88 505 88 522 43C495 37 403 37 376 43Z',
        'golaInterna': 'M380 45C410 41 488 41 518 45L515 52C488 48 410 48 383 52Z',
        'nervura': 'M367 42C384 99 514 99 531 42',
    },

})
saida['lados']['costas'].update({
    'punhos': poli(mover(punho_e, DESLOC)) + poli(mover(punho_d, DESLOC)),
    'gola': 'M996 62C1000 54 1006 48 1012 46C1040 42 1130 41 1163 44C1168 47 1172 52 1172 58C1150 66 1125 71 1100 72C1065 72 1030 68 996 62Z',
})
json.dump(saida, open(f'{destino}/foto.json', 'w'), indent=1)
print('ok', {l: {p: v['caixa'] for p, v in d['pecas'].items()} for l, d in saida['lados'].items()}, 'branco ref', ref)
