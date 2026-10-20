// Grava, quadro a quadro, o simulador montando o uniforme do vídeo.
import { abrir } from './sim-base.mjs';
import { UNIFORME as U } from './uniforme.js';
const DIR = process.argv[2];
const { b, p, erros } = await abrir({ w: 900, h: 1125, escala: 1.6 });
await p.addStyleTag({ content: `
  #cursor{position:fixed;left:0;top:0;width:34px;height:34px;z-index:99999;pointer-events:none;filter:drop-shadow(0 3px 4px rgba(0,0,0,.45));transform-origin:4px 3px}
  #toque{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,215,0,.55);z-index:99998;pointer-events:none;opacity:0}
  *{scroll-behavior:auto!important}` });
await p.evaluate(() => {
  document.body.insertAdjacentHTML('beforeend', `<div id="toque"></div><svg id="cursor" viewBox="0 0 24 24"><path d="M4 2.5v17.2l4.6-4.3 2.9 6.6 3.1-1.4-2.9-6.5H18z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>`);
});
let n = 0, cx = 640, cy = 980;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const quadro = async () => { await p.screenshot({ path: `${DIR}/${String(n++).padStart(5, '0')}.png` }); };
const pos = async (x, y, esc = 1) => p.evaluate(([x, y, s]) => { const c = document.getElementById('cursor'); c.style.transform = `translate(${x - 4}px,${y - 3}px) scale(${s})`; }, [x, y, esc]);
const parado = async (k) => { for (let i = 0; i < k; i++) await quadro(); };
async function alvo(sel) {
  const el = p.locator(sel).first();
  await el.evaluate((e) => e.scrollIntoView({ block: 'nearest' }));
  const bb = await el.boundingBox();
  if (!bb) throw new Error('sem caixa: ' + sel);
  return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
}
async function mover(sel, k = 16) {
  const a = await alvo(sel);
  const x0 = cx, y0 = cy;
  for (let i = 1; i <= k; i++) { const t = ease(i / k); cx = x0 + (a.x - x0) * t; cy = y0 + (a.y - y0) * t - Math.sin(t * Math.PI) * 18; await pos(cx, cy); await quadro(); }
}
async function clicar(sel, k = 16, espera = 250) {
  await mover(sel, k);
  await p.evaluate(([x, y]) => { const t = document.getElementById('toque'); t.style.left = x + 'px'; t.style.top = y + 'px'; }, [cx, cy]);
  for (const [s, o] of [[0.86, 0.9], [0.86, 0.7]]) { await pos(cx, cy, s); await p.evaluate((o) => { document.getElementById('toque').style.opacity = o; }, o); await quadro(); }
  await p.locator(sel).first().click();
  await p.waitForTimeout(espera);
  for (const o of [0.45, 0.2, 0]) { await pos(cx, cy, 1); await p.evaluate((o) => { document.getElementById('toque').style.opacity = o; }, o); await quadro(); }
}
async function digitar(texto) {
  for (const ch of texto) { await p.keyboard.type(ch); await p.waitForTimeout(60); await quadro(); await quadro(); await quadro(); }
}
const cor = (aba, c) => `.cartela[data-cartela="${aba}"] [data-cor="${c}"]`;

await pos(cx, cy); await parado(18);
// 1. modelo
await clicar('#busca-modelo', 18);
await digitar(String(U.modelo));
await parado(4);
await clicar(`[data-modelo="${U.modelo}"]`, 16, 1500);
await parado(16);
// 2. cores
await clicar('[data-aba="cores"]', 16);
await parado(4);
await clicar(cor('cores', U.base), 16);
await parado(6);
await clicar('[data-alvo="camisa-0"]', 12);
await clicar(cor('cores', U.camadas[0]), 14);
await parado(4);
await clicar('[data-alvo="camisa-1"]', 12);
await clicar(cor('cores', U.camadas[1]), 14);
await parado(14);
// 3. gola V
await clicar('[data-aba="acabamentos"]', 16);
await clicar('[data-gola="v"]', 14);
await clicar('[data-punho="sem"]', 12);
await clicar(cor('acabamentos', U.gola), 16);
await parado(10);
// 4. meião
await clicar('[data-aba="meiao"]', 14);
await clicar(cor('meiao', U.meiao), 16);
await parado(8);
// 5. nome e número
await clicar('[data-aba="nome"]', 14);
await clicar('#inp-nome', 14);
await digitar(U.nome);
await clicar('[data-seg="num-frente"] [data-valor="centro"]', 16);
await clicar(cor('nome', U.corNome), 18);
await clicar('[data-alvo="contorno"]', 12);
await clicar(cor('nome', U.contorno), 14);
// some com o cursor e segura no resultado
for (let i = 1; i <= 10; i++) { cx += 8; cy += 14; await pos(cx, cy); await quadro(); }
await p.evaluate(() => { document.getElementById('cursor').style.display = 'none'; });
await parado(30);
console.log('quadros', n, erros.join('\n') || 'sem erros');
await b.close();
