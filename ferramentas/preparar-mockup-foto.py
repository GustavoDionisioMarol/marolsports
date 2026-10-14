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
    # mapas de luz recortados para o lado
    reg = L[y0:y0 + h, x0:x0 + w]
    # sombras: luminância relativa ao branco do tecido, com um pouco mais de contraste
    sombra = np.clip(reg / ref, 0, 1) ** 1.35
    # brilhos: só onde o tecido é mais claro que a vizinhança (relevo das dobras),
    # para dar volume às cores escuras sem lavar a peça inteira
    media = np.asarray(Image.fromarray(reg.astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))).astype(np.float32)
    brilho = np.asarray(Image.fromarray(np.clip((reg - media) / 26 * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    Image.fromarray((sombra * 255).astype(np.uint8)).save(f'{destino}/sombra-{lado}.webp', quality=88)
    Image.fromarray((brilho * 255).astype(np.uint8)).save(f'{destino}/brilho-{lado}.webp', quality=85)
    saida['lados'][lado] = info

# ------------------------------------------------------------------ regiões desenhadas à mão
# Coordenadas na foto (px). As costas repetem mangas e punhos da frente deslocados.
DESLOC = 648.5
manga_e = [(352, 40), (300, 95), (272, 130), (258, 170), (252, 220), (262, 270), (274, 306), (276, 345), (140, 330), (140, 40)]
manga_d = [(546, 40), (598, 95), (626, 130), (640, 170), (646, 220), (636, 270), (624, 306), (618, 345), (750, 330), (750, 40)]
punho_e = [(150, 286), (277, 305), (274, 342), (148, 322)]
punho_d = [(616, 304), (742, 292), (748, 318), (620, 342)]
mover = lambda pts, dx: [(x + dx, y) for x, y in pts]
poli = lambda pts: 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'
saida['lados']['frente'].update({
    'mangas': poli(manga_e) + poli(manga_d),
    'punhos': poli(punho_e) + poli(punho_d),
    # gola V: faixa da gola e abertura (interior da camisa, com a gola de trás)
    'gola': 'M347 47C351 64 362 82 384 101C404 118 428 131 449 142C470 131 494 118 514 101C530 85 538 66 539 46'
            'C533 42 527 41 522 43C519 62 507 82 484 100C470 110 459 115 449 120C439 115 428 110 414 100C392 82 379 62 374 44'
            'C366 41 356 42 347 47Z',
    'abertura': 'M374 44C379 62 392 82 414 100C428 110 439 115 449 120C459 115 470 110 484 100C507 82 519 62 522 43C495 39 400 39 374 44Z',
    'golaInterna': 'M378 52C410 49 490 49 519 51L518 66C490 62 410 62 382 66Z',
})
saida['lados']['costas'].update({
    'mangas': poli(mover(manga_e, DESLOC)) + poli(mover(manga_d, DESLOC)),
    'punhos': poli(mover(punho_e, DESLOC)) + poli(mover(punho_d, DESLOC)),
    'gola': 'M996 62C1000 54 1006 48 1012 46C1040 42 1130 41 1163 44C1168 47 1172 52 1172 58C1150 66 1125 71 1100 72C1065 72 1030 68 996 62Z',
})
json.dump(saida, open(f'{destino}/foto.json', 'w'), indent=1)
print('ok', {l: {p: v['caixa'] for p, v in d['pecas'].items()} for l, d in saida['lados'].items()}, 'branco ref', ref)
