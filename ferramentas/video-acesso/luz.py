import cv2, numpy as np, sys
S=sys.argv[1]
im=cv2.imread(S+'/jogador.jpg'); H,W=im.shape[:2]
M={k:cv2.imread(f'{S}/jog/m-{k}.png',0)>0 for k in ('camisa','calcao','meiaE','meiaD')}
todas=np.zeros((H,W),bool)
for m in M.values(): todas|=m
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV); L=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(np.float32)
med=cv2.medianBlur(L.astype(np.uint8),31).astype(np.float32)
defeito=todas&((hsv[...,1]>38)|(L<med-28))
for x0,y0,x1,y1 in [(850,725,940,840),(745,850,825,950),(675,735,730,805),(648,1400,705,1510),(855,1430,935,1535),(945,1475,1015,1535),(690,1755,750,1805),(900,1825,980,1875),(735,595,760,650),(895,590,940,630)]:
    defeito[y0:y1,x0:x1]=True
defeito&=todas
defeito=cv2.dilate(defeito.astype(np.uint8),np.ones((9,9),np.uint8))
cv2.imwrite(S+'/jog/defeito.png',defeito*255)
ok=(todas&(defeito==0)).astype(np.float32)
num=cv2.GaussianBlur(L*ok,(0,0),40); den=cv2.GaussianBlur(ok,(0,0),40)
Li=np.where(defeito>0,num/np.maximum(den,1e-3),L).astype(np.float32)
buraco=defeito>0
for _ in range(600):  # difusão (Laplace) dentro dos buracos: emenda sem degrau com a borda
    Li[buraco]=cv2.blur(Li,(3,3))[buraco]
# devolve um pouco do grão do tecido para a área preenchida não ficar lisa demais
rng=np.random.default_rng(1); grao=cv2.GaussianBlur(rng.normal(0,2.2,L.shape).astype(np.float32),(0,0),0.8)
Li[buraco]+=grao[buraco]
# mangas: guarda as dobras grandes e apaga detalhes finos (listras e costuras raglan)
mangas=np.zeros((H,W),np.uint8)
cv2.fillPoly(mangas,[np.array([(745,600),(600,700),(590,850),(700,860),(735,700),(790,640)],np.int32),np.array([(890,595),(1020,600),(1190,820),(1110,895),(990,860),(960,700)],np.int32)],1)
mangas=cv2.GaussianBlur(mangas.astype(np.float32),(0,0),12)
base=np.where(todas,Li,np.nan); okm=todas.astype(np.float32)
lf=cv2.GaussianBlur(np.nan_to_num(base)*okm,(0,0),5)/np.maximum(cv2.GaussianBlur(okm,(0,0),5),1e-3)
Li=Li*(1-mangas)+(lf+0.25*(Li-lf))*mangas
# suaviza as listras em tom sobre tom das mangas (marca registrada) com um desfoque só nos ombros
cv2.imwrite(S+'/jog/Li.png',Li.astype(np.uint8))
ref=float(np.percentile(Li[todas],97))
sombra=np.clip(Li/ref,0,1)**1.1
media=cv2.GaussianBlur(Li,(0,0),14)
brilho=cv2.GaussianBlur(np.clip((Li-media)/26,0,1),(0,0),1.2)
np.save(S+'/jog/sombra.npy',sombra); np.save(S+'/jog/brilho.npy',brilho)
# teste: azul-marinho na camisa, vermelho no calção, preto nas meias
cor={'camisa':(70,35,20),'calcao':(40,30,180),'meiaE':(25,25,25),'meiaD':(25,25,25)}
o=im.astype(np.float32)/255
for k,m in M.items():
    c=np.array(cor[k],np.float32)/255
    a=cv2.GaussianBlur(m.astype(np.float32),(0,0),0.8)[...,None]
    col=c*sombra[...,None]; col=1-(1-col)*(1-0.25*brilho[...,None])
    o=o*(1-a)+col*a
cv2.imwrite(S+'/jog/teste.jpg',(o*255).astype(np.uint8))
cv2.imwrite(S+'/jog/teste-a.jpg',(o*255).astype(np.uint8)[560:1300,560:1240])
cv2.imwrite(S+'/jog/teste-b.jpg',(o*255).astype(np.uint8)[1180:2100,620:1060])
