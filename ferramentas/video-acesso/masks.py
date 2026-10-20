import cv2, numpy as np, sys
S=sys.argv[1]
im=cv2.imread(S+'/jogador.jpg'); H,W=im.shape[:2]
P={
'camisa':[(745,603),(705,620),(668,645),(640,675),(622,710),(610,760),(602,805),(598,835),(640,845),(690,848),(694,900),(698,960),(700,1040),(698,1100),(690,1160),(680,1200),(672,1228),(1000,1228),(1000,1150),(997,1050),(998,950),(1001,860),(1003,842),(1103,880),(1176,830),(1160,790),(1130,740),(1095,690),(1050,650),(990,620),(935,598),(900,598),(884,606),(801,690),(770,612),(758,603)],
'calcao':[(664,1226),(1000,1228),(1004,1300),(1012,1400),(1020,1490),(1028,1552),(950,1572),(850,1586),(838,1550),(830,1526),(800,1552),(740,1543),(668,1532),(663,1450),(662,1350)],
'meiaE':[(687,1648),(796,1648),(791,1750),(786,1850),(784,1950),(794,1975),(702,1995),(698,1900),(694,1750)],
'meiaD':[(894,1710),(1006,1710),(999,1850),(981,1950),(963,2080),(890,2078),(894,1950),(899,1850)],
}
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
pele=((hsv[...,1]>45)&(hsv[...,0]<25)&(hsv[...,2]<235))|(hsv[...,2]<70)   # mãos/pele e partes escuras grandes
pele=cv2.morphologyEx(pele.astype(np.uint8),cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
out={}
for k,pts in P.items():
    poly=np.zeros((H,W),np.uint8); cv2.fillPoly(poly,[np.array(pts,np.int32)],1)
    gc=np.full((H,W),cv2.GC_BGD,np.uint8)
    gc[cv2.dilate(poly,np.ones((25,25),np.uint8))>0]=cv2.GC_PR_BGD
    gc[poly>0]=cv2.GC_PR_FGD
    gc[cv2.erode(poly,np.ones((19,19),np.uint8))>0]=cv2.GC_FGD
    ys,xs=np.nonzero(gc!=cv2.GC_BGD); y0,y1,x0,x1=ys.min()-5,ys.max()+5,xs.min()-5,xs.max()+5
    sub=gc[y0:y1,x0:x1].copy(); b=np.zeros((1,65));f=np.zeros((1,65))
    cv2.grabCut(im[y0:y1,x0:x1],sub,None,b,f,5,cv2.GC_INIT_WITH_MASK)
    m=np.zeros((H,W),np.uint8); m[y0:y1,x0:x1]=((sub==1)|(sub==3))
    # limita a poucos px fora do polígono e tira pele (mãos)
    m&=cv2.dilate(poly,np.ones((7,7),np.uint8))
    if k.startswith('meia'): m=poly.copy()
    else: m|=poly
    maos=np.zeros((H,W),np.uint8); maos[1030:1190,640:715]=1; maos[1070:1180,890:1110]=1
    m&=(1-(pele&maos)) if k=='camisa' else 1
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    # só o maior componente
    n,l,st,_=cv2.connectedComponentsWithStats(m); 
    if n>1: m=(l==1+np.argmax(st[1:,4])).astype(np.uint8)
    out[k]=m; cv2.imwrite(f'{S}/jog/m-{k}.png',m*255)
o=im.copy().astype(np.float32)
for k,c in zip(out,[(0,0,255),(255,0,0),(0,200,0),(0,200,0)]):
    o[out[k]>0]=o[out[k]>0]*0.45+np.array(c)*0.55
cv2.imwrite(S+'/jog/ov2.jpg',o.astype(np.uint8))
