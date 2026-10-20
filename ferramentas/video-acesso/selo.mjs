import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 720, height: 200 }, deviceScaleFactor: 1 });
await p.goto('http://localhost:8093/selo.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.locator('.selo').screenshot({ path: process.argv[2], omitBackground: true }); await b.close();
