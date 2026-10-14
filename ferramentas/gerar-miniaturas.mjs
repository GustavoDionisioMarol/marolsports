#!/usr/bin/env node
// Gera as miniaturas do catálogo (dados/miniaturas/*.webp) usando o próprio
// renderizador do simulador. Precisa do simulador servido localmente:
//   npx http-server simulador -p 8080
//   node ferramentas/gerar-miniaturas.mjs http://localhost:8080/ simulador/dados/miniaturas
// Requer o Playwright (npm i -g playwright) e um Chromium instalado.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [url = 'http://localhost:8080/', destino = 'simulador/dados/miniaturas'] = process.argv.slice(2);
fs.mkdirSync(destino, { recursive: true });

const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pagina = await navegador.newPage();
await pagina.goto(url);
await pagina.waitForFunction(() => window.simulador?.catalogo);

const ids = await pagina.evaluate(() => window.simulador.catalogo.modelos.map((m) => ({ id: m.id, camisa: m.camisa, calcao: m.calcao })));
let total = 0;
for (const m of ids) {
  for (const peca of ['camisa', 'calcao']) {
    if (peca === 'calcao' && !m.calcao) continue;
    const dados = await pagina.evaluate(async ({ id, peca }) => {
      const s = window.simulador;
      const estado = structuredClone(s.PADRAO);
      Object.assign(estado, { pecas: peca, modeloCamisa: id, modeloCalcao: id });
      estado.meiao.ativo = false;
      estado.nome.numero = '';
      const modelo = await s.carregarModelo(id);
      const { svg, viewBox } = s.montarPalco({ estado, modelos: { camisa: modelo, calcao: modelo }, silhuetas: s.catalogo.silhuetas, vista: 'frente', prefixo: 'm' });
      const vars = Object.entries(s.variaveisCor(estado, 8, 8)).map(([k, v]) => `${k}:${v}`).join(';');
      const [, , w, h] = viewBox.split(' ').map(Number);
      // recorta só a peça (sem as margens da coluna)
      const it = peca === 'camisa' ? { x: 20, y: 0, w: 400, h: 400 * 284513 / 224820 } : { x: 40, y: 0, w: 360, h: 360 * 157761 / 182661 };
      const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${it.x - 8} ${it.y - 8} ${it.w + 16} ${it.h + 16}" width="${(it.w + 16)}" height="${it.h + 16}"><style>svg{${vars}}</style>${svg}</svg>`;
      const img = new Image();
      img.src = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' }));
      await img.decode();
      const c = document.createElement('canvas');
      const largura = 240;
      c.width = largura;
      c.height = Math.round((largura * (it.h + 16)) / (it.w + 16));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.82);
    }, { id: m.id, peca });
    const nome = `${peca === 'calcao' ? 'calcao-' : ''}${m.id}.webp`;
    fs.writeFileSync(path.join(destino, nome), Buffer.from(dados.split(',')[1], 'base64'));
    total++;
  }
}
await navegador.close();
console.log(`${total} miniaturas geradas em ${destino}`);
