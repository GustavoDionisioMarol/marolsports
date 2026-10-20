# Recorta frente e costas de um mockup com fundo liso (verde #00FF00 recomendado).
# Uso: python tools/recorte_fundo_verde.py <imagem.png> <chave> assets/baterias
#   gera <chave>-f.webp (frente, lado esquerdo) e <chave>-b.webp (costas, lado direito).
#   Para a linha Paixão pelo Samba use a chave com sufixo -p (ex.: tabajara-p).
# Requer: pip install opencv-python-headless pillow numpy
import cv2, numpy as np, sys
from PIL import Image
src,name,out=sys.argv[1],sys.argv[2],sys.argv[3]
T1=float(sys.argv[4]) if len(sys.argv)>4 else 90
img=cv2.imread(src); f=img.astype(np.float32); H,W=img.shape[:2]
border=np.concatenate([f[:6].reshape(-1,3),f[-6:].reshape(-1,3),f[:,:6].reshape(-1,3),f[:,-6:].reshape(-1,3)])
bgc=np.median(border,0)
dist=np.linalg.norm(f-bgc,axis=2)
cand=(dist<T1).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(cand,4)
touch=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(touch))
hard=(~bg).astype(np.uint8)
hard[:int(H*0.10)]=0; hard[int(H*0.925):]=0
cols=hard[:, int(W*0.45):int(W*0.55)].sum(0); cut=int(W*0.45)+int(np.argmin(cols)); hard[:,cut]=0
n,lab,st,_=cv2.connectedComponentsWithStats(hard,8)
idx=np.argsort(st[1:,cv2.CC_STAT_AREA])[::-1][:2]+1
comps=sorted(idx,key=lambda k:st[k,cv2.CC_STAT_LEFT])
B,G,R=f[...,0],f[...,1],f[...,2]
for side,k in zip(('f','b'),comps):
    m=(lab==k).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    inv=1-m; nn,l2,s2,_=cv2.connectedComponentsWithStats(inv,4)
    for i in range(1,nn):
        x,y,w,h,a=s2[i]
        if x>0 and y>0 and x+w<W and y+h<H: m[l2==i]=1
    band=cv2.dilate(m,np.ones((5,5),np.uint8))-cv2.erode(m,np.ones((3,3),np.uint8))
    soft=np.clip((dist-25)/(T1-25),0,1)
    alpha=np.where(band>0,soft*cv2.dilate(m,np.ones((5,5),np.uint8)),m.astype(np.float32))
    if side=='f': alpha[:,cut:]=0
    else: alpha[:,:cut]=0
    mx=np.maximum(R,B); G2=np.where(band>0,np.minimum(G,mx+np.maximum(0,(G-mx))*0.5),G)
    rgb=np.dstack([R,G2,B]).clip(0,255).astype(np.uint8)
    a=(alpha*255).astype(np.uint8)
    x,y,w,h,_=st[k]; pad=6
    crop=np.dstack([rgb,a])[max(0,y-pad):y+h+pad,max(0,x-pad):x+w+pad]
    im=Image.fromarray(crop); im.thumbnail((900,900),Image.LANCZOS)
    im.save(f'{out}/{name}-{side}.webp',quality=88,method=6); print(name,side,im.size)
