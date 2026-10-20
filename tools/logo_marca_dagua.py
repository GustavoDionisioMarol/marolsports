import numpy as np, cv2
from PIL import Image
import sys
# Uso: python tools/logo_marca_dagua.py <logo.png|jpg> <chave>   ex.: ... salgueiro.png furiosa
# Gera assets/baterias/<chave>-logo.webp (logo em branco translúcido para marca d'água).
U=''
M={sys.argv[2]:sys.argv[1]}
out='assets/baterias/'
for k,f in M.items():
    im=Image.open(U+f).convert('RGBA'); a=np.array(im).astype(np.float32)
    rgb=a[...,:3]; al=a[...,3]/255
    # composite on white where transparent
    rgb=rgb*al[...,None]+255*(1-al[...,None])
    b=np.concatenate([rgb[:4].reshape(-1,3),rgb[-4:].reshape(-1,3),rgb[:,:4].reshape(-1,3),rgb[:,-4:].reshape(-1,3)])
    bg=np.median(b,0)
    d=np.linalg.norm(rgb-bg,axis=2)
    inside=np.clip((d-18)/50,0,1)
    lum=rgb@np.array([.299,.587,.114])
    dk=(255-lum)/255; dk=(dk-dk[inside>0.5].min())/max(1e-3,(dk[inside>0.5].max()-dk[inside>0.5].min()))
    alpha=inside*(0.28+0.72*np.clip(dk,0,1))
    o=np.zeros(a.shape,np.uint8); o[...,:3]=255; o[...,3]=(alpha*255).astype(np.uint8)
    img=Image.fromarray(o); img=img.crop(img.getbbox()); img.thumbnail((700,700),Image.LANCZOS)
    img.save(out+k+'-logo.webp',quality=90,method=6); print(k,img.size,tuple(bg.astype(int)))
