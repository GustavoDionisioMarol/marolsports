#!/usr/bin/env node
// Encontra camadas que não aparecem no uniforme: arquivos vazios, desenhos
// totalmente cobertos por outras camadas ou que ficavam só nas mangas (as
// mangas são inteiras na cor de fundo). Para cada camada, renderiza a peça
// (frente e costas) com a camada em preto e depois em branco; se quase nenhum
// pixel muda, a camada é invisível e o seu campo de cor não serve para nada.
// Grava ferramentas/camadas-invisiveis.json, que o conversor usa para removê-las.
//   node ferramentas/verificar-camadas.mjs http://localhost:8080/
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [url = 'http://localhost:8080/'] = process.argv.slice(2);
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const MINIMO_PIXELS = 6; // pixels alterados (em 240 px de largura) para a camada contar como visível

const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pagina = await navegador.newPage();
await pagina.goto(url);
await pagina.waitForFunction(() => window.simulador?.catalogo);

const invisiveis = await pagina.evaluate(async (MINIMO) => {
  const s = window.simulador;
  const VB = { camisa: [224820, 284513], calcao: [182661, 157761] };
  const W = 240;
  const cinzas = ['#5a5a5a', '#8a8a8a', '#b0b0b0', '#3a3a3a', '#707070', '#9c9c9c', '#c4c4c4'];
  async function pixels(peca, camadas, lado, k, cor) {
    const [vw, vh] = VB[peca];
    const H = Math.round((W * vh) / vw);
    const corpo = camadas.map((c, i) => {
      const l = c[lado];
      if (!l) return '';
      return `<svg width="${vw}" height="${vh}" viewBox="${l.viewBox}" preserveAspectRatio="none" style="color:${i === k ? cor : cinzas[i % cinzas.length]}" fill="currentColor">${l.svg}</svg>`;
    }).join('');
    const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${W}" height="${H}">
      <defs><clipPath id="c"><path d="${s.catalogo.silhuetas[peca]}"/></clipPath><clipPath id="t"><path d="${s.TRONCO}"/></clipPath></defs>
      <g clip-path="url(#c)"><rect width="${vw}" height="${vh}" fill="#777"/>${peca === 'camisa' ? `<g clip-path="url(#t)">${corpo}</g>` : corpo}</g></svg>`;
    const img = new Image();
    img.src = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' }));
    await img.decode();
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, W, H).data;
  }
  const saida = {};
  for (const m of s.catalogo.modelos) {
    const modelo = await s.carregarModelo(m.id);
    for (const [peca, camadas] of Object.entries(modelo.pecas)) {
      for (let k = 0; k < camadas.length; k++) {
        let mudou = 0;
        for (const lado of ['frente', 'verso']) {
          if (!camadas[k][lado]) continue;
          const a = await pixels(peca, camadas, lado, k, '#000');
          const b = await pixels(peca, camadas, lado, k, '#fff');
          for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 40) mudou++;
        }
        if (mudou < MINIMO) ((saida[m.id] ??= {})[peca] ??= []).push(k + 1);
      }
    }
  }
  return saida;
}, MINIMO_PIXELS);

fs.writeFileSync(path.join(AQUI, 'camadas-invisiveis.json'), JSON.stringify(invisiveis, null, 1));
const total = Object.values(invisiveis).reduce((n, p) => n + Object.values(p).reduce((a, l) => a + l.length, 0), 0);
console.log(`${total} camadas invisíveis em ${Object.keys(invisiveis).length} modelos`);
await navegador.close();
