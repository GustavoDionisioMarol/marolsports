#!/usr/bin/env node
// Classifica as camadas que existem só de um lado (só frente ou só costas):
//  - "ambos": fundo/textura que cobre o tronco de forma larga e simétrica → repete nos dois lados
//  - "frente": elemento em destaque (ex.: rosto de um animal, emblema deslocado) → só na frente
// Mede cada camada renderizada em baixa resolução: largura ocupada no tronco,
// simetria horizontal e área coberta. Gera ferramentas/lados-camadas.json e uma
// folha de revisão em PNG. Precisa do simulador servido localmente (npm run servir).
//   node ferramentas/classificar-camadas.mjs http://localhost:8080/ [revisao.png]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [url = 'http://localhost:8080/', revisao] = process.argv.slice(2);
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pagina = await navegador.newPage({ viewport: { width: 1600, height: 1000 } });
await pagina.goto(url);
await pagina.waitForFunction(() => window.simulador?.catalogo);

const resultado = await pagina.evaluate(async () => {
  const s = window.simulador;
  const VB = { camisa: [224820, 284513], calcao: [182661, 157761] };
  // faixa horizontal do tronco/pernas usada nas medidas (fração da largura)
  const TRONCO = { camisa: [0.2, 0.8], calcao: [0.02, 0.98] };
  const W = 90;
  const saida = [];
  for (const m of s.catalogo.modelos) {
    const modelo = await s.carregarModelo(m.id);
    for (const [peca, camadas] of Object.entries(modelo.pecas)) {
      for (const [i, cam] of camadas.entries()) {
        if (!cam.unilateral) continue;
        const l = cam[cam.unilateral];
        const [vw, vh] = VB[peca];
        const H = Math.round((W * vh) / vw);
        const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${W}" height="${H}">
          <defs><clipPath id="c"><path d="${s.catalogo.silhuetas[peca]}"/></clipPath></defs>
          <g clip-path="url(#c)"><svg width="${vw}" height="${vh}" viewBox="${l.viewBox}" preserveAspectRatio="none" style="color:#000" fill="currentColor">${l.svg}</svg></g></svg>`;
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' }));
        await img.decode();
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, W, H).data;
        const a = (x, y) => px[(y * W + x) * 4 + 3] / 255;
        const [x0, x1] = TRONCO[peca].map((f) => Math.round(f * W));
        let area = 0, sim = 0, uniao = 0, minX = W, maxX = 0, minY = H, maxY = 0;
        for (let y = 0; y < H; y++) for (let x = x0; x < x1; x++) {
          const v = a(x, y) > 0.3 ? 1 : 0;
          const espelho = a(W - 1 - x, y) > 0.3 ? 1 : 0;
          area += v; sim += v && espelho; uniao += v || espelho;
          if (v) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
        }
        const total = (x1 - x0) * H;
        saida.push({
          id: m.id, peca, camada: i + 1, lado: cam.unilateral,
          largura: area ? (maxX - minX + 1) / (x1 - x0) : 0,
          altura: area ? (maxY - minY + 1) / H : 0,
          simetria: uniao ? sim / uniao : 0,
          area: area / total,
          miniatura: c.toDataURL(),
        });
      }
    }
  }
  return saida;
});

// Regra: fundo = largo (≥ 75% do tronco) e simétrico (≥ 0,55); o resto é destaque.
const lados = {};
for (const r of resultado) {
  r.decisao = r.largura >= 0.75 && r.simetria >= 0.55 ? 'ambos' : 'frente';
  ((lados[r.id] ??= {})[r.peca] ??= {})[r.camada] = {
    lado: r.decisao,
    medidas: { largura: +r.largura.toFixed(2), simetria: +r.simetria.toFixed(2), area: +r.area.toFixed(2), original: r.lado },
  };
}
fs.writeFileSync(path.join(AQUI, 'lados-camadas.json'), JSON.stringify(lados, null, 1));
console.log(`${resultado.length} camadas classificadas: ${resultado.filter((r) => r.decisao === 'ambos').length} fundo, ${resultado.filter((r) => r.decisao === 'frente').length} destaque`);

if (revisao) {
  const cards = resultado.map((r) => `<div style="width:120px;font:10px sans-serif;text-align:center;border:2px solid ${r.decisao === 'ambos' ? '#2a9d8f' : '#e76f51'};padding:2px">
    <img src="${r.miniatura}" style="width:90px;background:#eee"><br><b>${r.id} ${r.peca} c${r.camada} (${r.lado[0]})</b><br>
    L${r.largura.toFixed(2)} S${r.simetria.toFixed(2)} A${r.area.toFixed(2)}<br><b>${r.decisao}</b></div>`).join('');
  await pagina.setContent(`<body style="margin:4px;display:flex;flex-wrap:wrap;gap:4px">${cards}</body>`);
  await pagina.screenshot({ path: revisao, fullPage: true });
}
await navegador.close();
