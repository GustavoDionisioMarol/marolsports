# Recorta as camisas do mockup (frente | costas sobre fundo bege liso).
import sys, numpy as np, cv2
from collections import deque
src, out = sys.argv[1], sys.argv[2]
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
# fecha buracos internos (partes da estampa parecidas com o fundo)
cs, _ = cv2.findContours(peca, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cheio = np.zeros_like(peca); cv2.drawContours(cheio, cs, -1, 1, -1)
# borda suave
alfa = cv2.GaussianBlur(cv2.erode(cheio, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 0.9)
rgba = np.dstack([im, (alfa * 255).astype(np.uint8)])
# separa frente (esquerda) e costas (direita) pelos dois maiores blocos
cs = sorted(cs, key=cv2.contourArea, reverse=True)[:2]
caixas = sorted([cv2.boundingRect(c) for c in cs], key=lambda b: b[0])
for nome, (x, y, w, h) in zip(['frente', 'costas'], caixas):
    p = 6
    x0, y0, x1, y1 = max(0, x - p), max(0, y - p), min(W, x + w + p), min(H, y + h + p)
    cv2.imwrite(f'{out}-{nome}.png', rgba[y0:y1, x0:x1])
print(src.split('/')[-1][:30], len(keep), caixas)
