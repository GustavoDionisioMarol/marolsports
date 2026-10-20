import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const DIR = process.argv[2], DUR = 7, FPS = 30;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 720, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:8093/jogador.html'); await p.waitForFunction(() => window.pronto, null, { timeout: 60000 });
for (let i = 0; i < DUR * FPS; i++) {
  await p.evaluate((t) => window.quadro(t), i / FPS);
  await p.screenshot({ path: `${DIR}/${String(i).padStart(5, '0')}.png` });
}
await b.close();
