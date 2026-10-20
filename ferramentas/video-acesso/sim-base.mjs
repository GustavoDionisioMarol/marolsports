// Abre o simulador já "logado" (o serviço de cadastro é simulado) em tela de celular.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
export async function abrir({ w = 400, h = 500, escala = 1.8 } = {}) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: escala, hasTouch: false });
  await ctx.route('https://script.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, usuario: { nome: 'Gustavo', email: 'demo@exemplo.com' } }) }));
  await ctx.route('**/_vercel/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const tok = Buffer.from(JSON.stringify({ exp: Date.now() + 864e5, email: 'demo@exemplo.com' })).toString('base64url') + '.x';
  await ctx.addInitScript((tok) => { localStorage.setItem('marol-sports:sessao', JSON.stringify({ token: tok, usuario: { nome: 'Gustavo' } })); localStorage.setItem('marol-sports:tem-conta', '1'); }, tok);
  const p = await ctx.newPage();
  const erros = []; p.on('pageerror', (e) => erros.push(e.message));
  await p.goto('http://localhost:8080/'); await p.waitForSelector('#palco-svg g', { timeout: 30000 }); await p.waitForTimeout(1500);
  return { b, p, erros };
}
