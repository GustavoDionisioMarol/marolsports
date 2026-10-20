import cv2, numpy as np, json, sys
S=sys.argv[1]; D=S+'/video/jogador'
im=cv2.imread(S+'/jogador.jpg'); H,W=im.shape[:2]
M={k:cv2.imread(f'{S}/jog/m-{k}.png',0) for k in ('camisa','calcao','meiaE','meiaD')}
def caminho(m):
    cs,_=cv2.findContours((m>0).astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    out=''
    for c in cs:
        if cv2.contourArea(c)<200: continue
        a=cv2.approxPolyDP(c,0.8,True)[:,0]
        out+='M'+'L'.join(f'{x+.5:.1f} {y+.5:.1f}' for x,y in a)+'Z'
    return out
def caixa(m):
    ys,xs=np.nonzero(m); return [int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
sombra=np.load(S+'/jog/sombra.npy'); brilho=np.load(S+'/jog/brilho.npy')
cv2.imwrite(D+'/sombra-frente.webp',(sombra*255).astype(np.uint8),[cv2.IMWRITE_WEBP_QUALITY,90])
cv2.imwrite(D+'/brilho-frente.webp',(brilho*0.6*255).astype(np.uint8),[cv2.IMWRITE_WEBP_QUALITY,88])
# foto base: chuteiras sem a marca (logo branco apagado, faixa laranja escurecida)
base=im.copy(); hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
chut=np.zeros((H,W),np.uint8)
cv2.fillPoly(chut,[np.array([(560,1930),(810,1930),(815,2130),(560,2130)],np.int32),np.array([(840,2050),(1000,2050),(1000,2250),(840,2250)],np.int32)],1)
escuro=cv2.morphologyEx(((hsv[...,2]<80)&(chut>0)).astype(np.uint8),cv2.MORPH_CLOSE,np.ones((25,25),np.uint8))
logo=(escuro>0)&(hsv[...,2]>110)&(hsv[...,1]<70)
logo=cv2.dilate(logo.astype(np.uint8),np.ones((5,5),np.uint8))
base=cv2.inpaint(base,logo,5,cv2.INPAINT_TELEA)
lar=(chut>0)&(hsv[...,0]<22)&(hsv[...,1]>90)&(hsv[...,2]>60)
g=cv2.cvtColor(base,cv2.COLOR_BGR2GRAY)
base[lar]=np.stack([g[lar]*0.45]*3,1).astype(np.uint8)
cv2.imwrite(D+'/foto.webp',base,[cv2.IMWRITE_WEBP_QUALITY,90])
cv2.imwrite(S+'/jog/chut.jpg',base[1900:2260,540:1020])
# a arte plana da camisa: tronco (x 46000..180000) sobre o tronco da foto (x 694..1000), ombro y 600, barra y 1228
sx=(1000-694)/134000; cx0=694-46000*sx
cam={'caminho':caminho(M['camisa']),'caixa':[round(cx0,1),600,round(cx0+224820*sx,1),1228]}
kc=caixa(M['calcao'])
cal={'caminho':caminho(M['calcao']),'caixa':[kc[0],kc[1],kc[2],1562]}
gola='M756 604L801 709L903 600L884 606L801 690L771 611Z'
desc={'largura':W,'altura':H,'lados':{'frente':{'recorte':[0,0,W,H],'pecas':{'camisa':cam,'calcao':cal},
  'punhos':'','gola':gola,'abertura':'','golaInterna':'','meias':caminho(np.maximum(M['meiaE'],M['meiaD']))}},'versao':'1'}
json.dump(desc,open(D+'/jogador.json','w'))
print(cam['caixa'],cal['caixa'],len(json.dumps(desc)))
