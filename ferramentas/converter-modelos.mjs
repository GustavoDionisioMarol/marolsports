#!/usr/bin/env node
// Converte as camadas SVG exportadas do CorelDRAW (uma cor por arquivo) para
// o formato do simulador: um JSON por modelo com as camadas já recoloríveis.
//
// Uso: node ferramentas/converter-modelos.mjs "<pasta Futebol Masculino>" simulador/dados
import fs from 'node:fs';
import path from 'node:path';

const [origem, destino] = process.argv.slice(2);
const AQUI = path.dirname(new URL(import.meta.url).pathname);

// Camadas que existem só de um lado: 'ambos' (fundo que se repete), 'frente',
// 'verso' ou 'manter' (frente e costas com desenhos diferentes de propósito). A classificação automática vem de classificar-camadas.mjs e os
// ajustes manuais têm prioridade. Formato: { "51": { "camisa": { "1": "ambos" } } }
function lerJson(nome) {
  try { return JSON.parse(fs.readFileSync(path.join(AQUI, nome), 'utf8')); } catch { return {}; }
}
const ladosAuto = lerJson('lados-camadas.json');
const ladosManuais = lerJson('ajustes-manuais.json');
// camadas que não aparecem (vazias ou cobertas), detectadas por verificar-camadas.mjs
const invisiveis = lerJson('camadas-invisiveis.json');
// ombreiras de recorte raglan, detectadas por detectar-ombros.mjs (a manga é comum)
const ombreiras = lerJson('camadas-ombro.json');
const ladoDefinido = (numero, peca, camada) =>
  ladosManuais[numero]?.[peca]?.[camada] ?? ladosAuto[numero]?.[peca]?.[camada]?.lado;
if (!origem || !destino) {
  console.error('Uso: node ferramentas/converter-modelos.mjs <pasta-origem> <pasta-destino>');
  process.exit(1);
}

// Proporção (largura/altura) padrão de cada peça; arquivos muito diferentes são descartados.
const PROPORCAO = { camisa: 224820 / 284513, calcao: 182661 / 157761 };
const VIEWBOX = { camisa: '0 0 224820 284513', calcao: '0 0 182661 157761' };

function lerTexto(arquivo) {
  const b = fs.readFileSync(arquivo);
  if (b[0] === 0xff && b[1] === 0xfe) return b.subarray(2).toString('utf16le');
  if (b[0] === 0xfe && b[1] === 0xff) return Buffer.from(b.subarray(2)).swap16().toString('utf16le');
  return b.toString('utf8');
}

function pecaDaPasta(nome) {
  const n = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (n.startsWith('camisa')) return 'camisa';
  if (n.startsWith('calcao')) return 'calcao';
  return null;
}

// Descobre camada (1..n) e lado (frente/verso) a partir do nome do arquivo.
function classificar(arquivo) {
  const f = arquivo.toLowerCase();
  let m;
  if ((m = f.match(/^(\d+)(c?)\.svg$/))) return { camada: +m[1], lado: m[2] ? 'verso' : 'frente' };
  if ((m = f.match(/^(\d+)_(?:camisa|calcao)_(frente|verso)\.svg$/))) return { camada: +m[1], lado: m[2] };
  if ((m = f.match(/^(?:camisa|calcao)(\d+)(frente|verso)\.svg$/))) return { camada: +m[1], lado: m[2] };
  if ((m = f.match(/^(?:camisa|calcao)_(\d+)_([12])_\d+\.svg$/))) return { camada: +m[1], lado: m[2] === '1' ? 'frente' : 'verso' };
  if ((m = f.match(/^desenho(\d+)(costas)?\.svg$/))) return { camada: +m[1], lado: m[2] ? 'verso' : 'frente' };
  return null;
}

// qualquer cor: hexadecimal, rgb()/hsl() ou nome (red, fuchsia, gold...); nunca none/url()/currentColor
const COR = /^\s*(?:#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([^)]*\)|(?!none\b|currentcolor\b|transparent\b|inherit\b)[a-z]+)\s*$/i;

// Limpa o SVG, troca todas as cores por currentColor e prefixa os ids.
function processarSvg(texto, prefixo) {
  const raiz = texto.match(/<svg\b[^>]*>/i);
  if (!raiz) return null;
  let viewBox = (raiz[0].match(/viewBox="([^"]+)"/) || [])[1];
  if (!viewBox) {
    const w = parseFloat((raiz[0].match(/\swidth="([\d.]+)/) || [])[1]);
    const h = parseFloat((raiz[0].match(/\sheight="([\d.]+)/) || [])[1]);
    if (!w || !h) return null;
    viewBox = `0 0 ${w} ${h}`;
  }
  for (const [peca, id] of [['camisa', 'camisa_contorno'], ['calcao', 'calcao_contorno']]) {
    const c = texto.match(new RegExp(`<path[^>]*id="${id}"[^>]*>`));
    if (c && !silhuetas[peca] && viewBox === VIEWBOX[peca]) silhuetas[peca] = c[0].match(/\sd="([^"]+)"/)[1];
  }
  let corOriginal = null;
  let corpo = texto.slice(raiz.index + raiz[0].length, texto.lastIndexOf('</svg>'));
  corpo = corpo
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata[^>]*\/>|<metadata[\s\S]*?<\/metadata>/g, '')
    .replace(/\s(?:xml:space|xmlns:\w+)="[^"]*"/g, '');
  // cores em atributos e em blocos <style>
  const trocar = (_, prop, sep, valor) => {
    if (/none|url\(/i.test(valor)) return _;
    if (!corOriginal && /^#/.test(valor.trim())) corOriginal = valor.trim().toUpperCase();
    return `${prop}${sep}currentColor`;
  };
  corpo = corpo.replace(/(fill|stroke|stop-color)(="|:\s*)([^";}]+)/gi, (all, p, s, v) => (COR.test(v) ? trocar(all, p, s, v) : all));
  // ids únicos por camada (os arquivos repetem id0, id1...)
  corpo = corpo
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefixo}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefixo}${id})`)
    .replace(/(xlink:href|href)="#([^"]+)"/g, (_, a, id) => `${a}="#${prefixo}${id}"`)
    // classes do CorelDRAW (.fil0, .str1...) também ficam únicas: <style> vale para a página toda
    .replace(/class="([^"]+)"/g, (_, c) => `class="${c.trim().split(/\s+/).map((n) => prefixo + n).join(' ')}"`)
    .replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (_, a, css, b) => a + css.replace(/\.([A-Za-z_][\w-]*)/g, `.${prefixo}$1`) + b);
  // remove grupos vazios e espaços sobrando
  for (let i = 0; i < 4; i++) corpo = corpo.replace(/<g[^>]*>\s*<\/g>/g, '');
  corpo = corpo.replace(/>\s+</g, '><').trim();
  if (!/<(path|polygon|rect|circle|ellipse|polyline|line)\b/.test(corpo)) return null;
  return { viewBox, svg: corpo, cor: corOriginal };
}

const indice = [];
// Silhueta de cada peça (o contorno é o mesmo em todos os arquivos que o trazem).
const silhuetas = {};
const avisos = [];
fs.mkdirSync(path.join(destino, 'modelos'), { recursive: true });

function* pastasModelo(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const m = e.name.match(/^Modelo (\d+)/);
    if (m) yield { numero: +m[1], dir: path.join(dir, e.name) };
    else yield* pastasModelo(path.join(dir, e.name));
  }
}

const vistos = new Set();
for (const { numero, dir } of [...pastasModelo(origem)].sort((a, b) => a.numero - b.numero)) {
  if (vistos.has(numero)) { avisos.push(`Modelo ${numero}: pasta duplicada ignorada (${dir})`); continue; }
  const modelo = { id: numero, pecas: {} };
  for (const sub of fs.readdirSync(dir, { withFileTypes: true })) {
    const peca = sub.isDirectory() && pecaDaPasta(sub.name);
    if (!peca) continue;
    const camadas = {};
    for (const arq of fs.readdirSync(path.join(dir, sub.name)).sort()) {
      if (!arq.toLowerCase().endsWith('.svg')) continue;
      const c = classificar(arq);
      if (!c) { avisos.push(`Modelo ${numero}/${peca}: nome não reconhecido "${arq}"`); continue; }
      const prefixo = `m${numero}${peca.slice(0, 3)}${c.camada}${c.lado[0]}_`;
      const r = processarSvg(lerTexto(path.join(dir, sub.name, arq)), prefixo);
      if (!r) continue; // arquivo sem desenho (ex.: costas lisas)
      const [, , w, h] = r.viewBox.split(/[\s,]+/).map(Number);
      if (Math.abs(w / h / PROPORCAO[peca] - 1) > 0.03) {
        avisos.push(`Modelo ${numero}/${peca}: "${arq}" com proporção diferente (${r.viewBox}), ignorado`);
        continue;
      }
      camadas[c.camada] ??= { cor: r.cor };
      camadas[c.camada][c.lado] = { viewBox: r.viewBox, svg: r.svg, prefixo };
    }
    // camadas de um lado só: repete o fundo nos dois lados e leva destaques para a frente
    // a numeração usada nos ajustes é a posição da camada (1, 2, 3...), como na folha de revisão
    const ordem = Object.keys(camadas).map(Number).sort((a, b) => a - b);
    for (const [pos, k] of ordem.entries()) {
      const cam = camadas[k];
      const unico = cam.frente ? (cam.verso ? null : 'frente') : 'verso';
      if (!unico) continue;
      cam.unilateral = unico;
      const decisao = ladoDefinido(numero, peca, pos + 1);
      const outro = unico === 'frente' ? 'verso' : 'frente';
      const origemLado = cam[unico];
      const copia = (lado) => ({
        viewBox: origemLado.viewBox,
        svg: origemLado.svg.replaceAll(origemLado.prefixo, `m${numero}${peca.slice(0, 3)}${k}${lado[0]}_`),
      });
      if (decisao === 'ambos') cam[outro] = copia(outro);
      else if (decisao === 'frente' && unico === 'verso') { cam.frente = copia('frente'); delete cam.verso; }
      else if (decisao === 'verso' && unico === 'frente') { cam.verso = copia('verso'); delete cam.frente; }
    }
    for (const cam of Object.values(camadas)) for (const l of ['frente', 'verso']) if (cam[l]) delete cam[l].prefixo;
    const todas = Object.keys(camadas).map(Number).sort((a, b) => a - b).map((k) => camadas[k]);
    const remover = new Set([...(invisiveis[numero]?.[peca] ?? []), ...(ombreiras[numero]?.[peca] ?? [])]);
    const lista = todas.filter((_, i) => !remover.has(i + 1));
    if (todas.length) modelo.pecas[peca] = lista;
  }
  // o catálogo é de uniformes: modelos que só têm calção ficam de fora
  if (!modelo.pecas.camisa) {
    if (modelo.pecas.calcao) avisos.push(`Modelo ${numero}: só tem calção, fora do catálogo`);
    continue;
  }
  vistos.add(numero);
  fs.writeFileSync(path.join(destino, 'modelos', `${numero}.json`), JSON.stringify(modelo));
  indice.push({
    id: numero,
    camisa: modelo.pecas.camisa?.length ?? 0,
    calcao: modelo.pecas.calcao?.length ?? 0,
    cores: Object.fromEntries(Object.entries(modelo.pecas).map(([p, l]) => [p, l.map((c) => c.cor)])),
  });
}

fs.writeFileSync(path.join(destino, 'modelos.json'), JSON.stringify({ viewBox: VIEWBOX, silhuetas, modelos: indice }, null, 1));
console.log(`${indice.length} modelos convertidos.`);
if (avisos.length) console.log(avisos.join('\n'));
