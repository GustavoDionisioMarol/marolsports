# Recorta as camisas do mockup (frente | costas sobre fundo bege liso).
import sys, numpy as np, cv2
from collections import deque
src, out = sys.argv[1], sys.argv[2]
sombra = '--sombra' in sys.argv  # tira a sombra cinza do mockup embaixo da barra (só para camisas de barra escura)
gc = '--grabcut' in sys.argv  # fundo com degradê/vinheta: separa cada metade com GrabCut
sys.argv = [a for a in sys.argv if a not in ('--sombra', '--grabcut')]
im = cv2.imread(src); H, W = im.shape[:2]
lab = cv2.cvtColor(cv2.GaussianBlur(im, (3, 3), 0), cv2.COLOR_BGR2LAB).astype(np.float32)
borda = np.concatenate([lab[:6].reshape(-1, 3), lab[-6:].reshape(-1, 3), lab[:, :6].reshape(-1, 3), lab[:, -6:].reshape(-1, 3)])
# fundo varia um pouco (degradê): compara cada pixel com o fundo local, estimado por mediana em blocos
fundo_ref = np.median(borda, 0)
dist = np.linalg.norm(lab - fundo_ref, axis=2)
grad = cv2.morphologyEx(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)).astype(np.float32)
liso = (dist < float(sys.argv[3]) if len(sys.argv) > 3 else dist < 9) & (grad < 14)
fundo = np.zeros((H, W), np.uint8)
mask = np.zeros((H + 2, W + 2), np.uint8)
seed = liso.astype(np.uint8)
# flood fill a partir das bordas, só por pixels lisos e parecidos com o fundo
n, lbl = cv2.connectedComponents(seed, connectivity=4)
bordas = set(np.unique(np.concatenate([lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]]))) - {0}
fundo = np.isin(lbl, list(bordas))
peca = (~fundo).astype(np.uint8)
peca = cv2.morphologyEx(peca, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lbl, st, _ = cv2.connectedComponentsWithStats(peca, connectivity=8)
keep = [i for i in range(1, n) if st[i, 4] > 0.04 * H * W]   # tira o título e sujeiras
peca = np.isin(lbl, keep).astype(np.uint8)
# fecha falhas na borda onde a camisa tem a cor do fundo (mangas creme) e buracos internos
# (feito em cada camisa separadamente, para frente e costas não se emendarem)
cheio = np.zeros_like(peca); cs = []
for i in keep:
    m = cv2.morphologyEx((lbl == i).astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    c, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(cheio, c, -1, 1, -1); cs += list(c)
if gc:
    # cada camisa numa metade da imagem; o retângulo inicial pula o título no alto
    cheio = np.zeros((H, W), np.uint8); cs = []
    meio = W // 2
    for x0, x1 in ((0, meio), (meio, W)):
        sub = cv2.resize(im[:, x0:x1], None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
        h2, w2 = sub.shape[:2]
        m = np.zeros((h2, w2), np.uint8); bg_ = np.zeros((1, 65)); fg_ = np.zeros((1, 65))
        cv2.grabCut(sub, m, (8, 22, w2 - 16, h2 - 30), bg_, fg_, 6, cv2.GC_INIT_WITH_RECT)
        m = ((m == 1) | (m == 3)).astype(np.uint8)
        m = cv2.resize(m, (x1 - x0, H), interpolation=cv2.INTER_LINEAR)
        n3, l3, st3, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
        if n3 > 1: m = (l3 == 1 + int(np.argmax(st3[1:, 4]))).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
        c, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = [cc + np.array([[[x0, 0]]]) for cc in c]
        cv2.drawContours(cheio, c, -1, 1, -1); cs += c
    keep = [1, 2]
# borda suave
alfa = cv2.GaussianBlur(cv2.erode(cheio, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 0.9)
rgba = np.dstack([im, (alfa * 255).astype(np.uint8)])
# separa frente (esquerda) e costas (direita) pelos dois maiores blocos
cs = sorted(cs, key=cv2.contourArea, reverse=True)[:2]
caixas = sorted([cv2.boundingRect(c) for c in cs], key=lambda b: b[0])
for nome, (x, y, w, h) in zip(['frente', 'costas'], caixas):
    p = 6
    x0, y0, x1, y1 = max(0, x - p), max(0, y - p), min(W, x + w + p), min(H, y + h + p)
    parte = rgba[y0:y1, x0:x1].copy()
    if sombra:
        # a partir da borda de baixo, apaga pixels neutros e claros (sombra sobre o fundo) até encontrar a barra da camisa
        l = lab[y0:y1, x0:x1]
        neutro = ((np.abs(l[..., 1] - fundo_ref[1]) < 6) & (np.abs(l[..., 2] - fundo_ref[2]) < 6) & (l[..., 0] > 110)).astype(np.uint8)
        n2, l2 = cv2.connectedComponents(neutro, connectivity=4)
        baixo = set(np.unique(l2[-3:])) - {0}
        tira = cv2.dilate(np.isin(l2, list(baixo)).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        parte[..., 3] = np.where(tira, 0, parte[..., 3])
    # só a camisa: descarta pedaços soltos (sobras do fundo ou da outra camisa) que entraram no recorte
    n, lbl, st, _ = cv2.connectedComponentsWithStats((parte[..., 3] > 20).astype(np.uint8), connectivity=8)
    if n > 2:
        maior = 1 + int(np.argmax(st[1:, 4]))
        parte[..., 3] = np.where(cv2.dilate((lbl == maior).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0, parte[..., 3], 0)
    cv2.imwrite(f'{out}-{nome}.png', parte)
print(src.split('/')[-1][:30], len(keep), caixas)
