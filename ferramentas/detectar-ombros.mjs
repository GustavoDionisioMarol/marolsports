#!/usr/bin/env node
// Encontra as camadas de "ombreira" (recorte raglan nos ombros e frisos que o
// acompanham). A camisa da Marol tem manga comum, então essas camadas saem e o
// desenho de baixo aparece no lugar. Uma camada é ombreira quando fica toda na
// faixa de cima da camisa, nos dois ombros, sem passar pelo centro do peito.
// Grava ferramentas/camadas-ombro.json (posições das camadas como no conversor).
//   node ferramentas/detectar-ombros.mjs http://localhost:8080/
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [url = 'http://localhost:8080/'] = process.argv.slice(2);
const AQUI = path.dirname(new URL(import.meta.url).pathname);
// faixas no alto do peito que ligam um ombro ao outro são o desenho do modelo, não ombreira
const MANTER = { 414: [1, 2, 3, 4], 523: [3] };

const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pagina = await navegador.newPage();
await pagina.goto(url);
await pagina.waitForFunction(() => window.simulador?.catalogo);
const medidas = await pagina.evaluate(async () => {
  const s = window.simulador;
  const [vw, vh] = [s.VB.camisa.w, s.VB.camisa.h];
  const W = 90;
  const H = Math.round((W * vh) / vw);
  const res = [];
  for (const m of s.catalogo.modelos) {
    const modelo = await s.carregarModelo(m.id);
    for (const [i, c] of (modelo.pecas.camisa ?? []).entries()) {
      const l = c.frente ?? c.verso;
      if (!l) continue;
      const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${W}" height="${H}"><defs>
        <clipPath id="c"><path d="${s.catalogo.silhuetas.camisa}"/></clipPath><clipPath id="t"><path d="${s.TRONCO}"/></clipPath></defs>
        <g clip-path="url(#c)"><g clip-path="url(#t)"><svg width="${vw}" height="${vh}" viewBox="${l.viewBox}" preserveAspectRatio="none" style="color:#000" fill="currentColor">${l.svg}</svg></g></g></svg>`;
      const img = new Image();
      img.src = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' }));
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, W, H).data;
      let total = 0, topo = 0, centro = 0, esq = 0, dir = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (px[(y * W + x) * 4 + 3] < 80) continue;
        total++;
        if (y >= H * 0.3) continue;
        topo++;
        if (x > W * 0.4 && x < W * 0.6 && y > H * 0.12) centro++;
        if (x < W / 2) esq++; else dir++;
      }
      if (total) res.push({ id: m.id, camada: i + 1, area: total / (W * H), topo: topo / total, centro: centro / total, simetria: Math.min(esq, dir) / Math.max(esq, dir, 1) });
    }
  }
  return res;
});
await navegador.close();

const saida = {};
for (const r of medidas) {
  const ombreira = r.topo > 0.85 && r.centro < 0.05 && r.simetria > 0.5 && r.area > 0.008;
  if (ombreira && !MANTER[r.id]?.includes(r.camada)) ((saida[r.id] ??= {}).camisa ??= []).push(r.camada);
}
fs.writeFileSync(path.join(AQUI, 'camadas-ombro.json'), JSON.stringify(saida, null, 1));
console.log(`${Object.values(saida).reduce((n, p) => n + p.camisa.length, 0)} ombreiras em ${Object.keys(saida).length} modelos: ${Object.keys(saida).join(', ')}`);
