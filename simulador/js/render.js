// Monta o SVG do uniforme. As cores entram por variáveis CSS (--camisa-base,
// --camisa-c1...), assim trocar uma cor não exige redesenhar as estampas.
import { hex } from './cores.js';

export const VB = {
  camisa: { w: 224820, h: 284513 },
  calcao: { w: 182661, h: 157761 },
  meiao: { w: 300, h: 1000 },
};

// ---------------------------------------------------------------- formas fixas

export const GOLAS = {
  // faixa da gola na frente e a abertura (interior da camisa visível)
  careca: {
    nome: 'Careca',
    frente: 'M79000 -500C84000 24500 143000 24500 148000 -500L140200 2400C136500 16200 91000 16200 87300 2400Z',
    abertura: 'M87300 2400C91000 16200 136500 16200 140200 2400C130000 -900 97000 -900 87300 2400Z',
    nervura: 'M83200 1000C87600 20500 139800 20500 144100 1000',
  },
  v: {
    nome: 'Gola V',
    frente: 'M78200 -500L113400 55000L148800 -500L140600 2000L113400 41500L86600 2000Z',
    abertura: 'M86600 2000L113400 41500L140600 2000C130000 -900 97000 -900 86600 2000Z',
    nervura: 'M82400 750L113400 48200L144700 750',
  },
};
export const TIPOS_GOLA = Object.fromEntries(Object.entries(GOLAS).map(([k, g]) => [k, g.nome]));

// faixa interna das costas (vista pela abertura da frente) e gola vista de costas
const GOLA_INTERNA = 'M87300 2400C97000 -900 130000 -900 140200 2400L138600 4600C129000 1600 98500 1600 88900 4600Z';
const GOLA_COSTAS = 'M78800 -500C86500 11500 140500 11500 148200 -500L141000 -500C133500 5200 93500 5200 86000 -500Z';

// área das mangas (para a cor da manga) e costura do ombro
export const MANGAS = [
  'M-2000 -2000H39500V15500C49500 45000 50500 85000 43200 114200L46000 132000H-2000Z',
  'M227000 -2000H186500V16500C176000 45000 175500 85000 184400 109700L182000 132000H227000Z',
];
const COSTURA_MANGA = 'M39500 16500C49500 45000 50500 85000 43200 114200M186500 17500C176000 45000 175500 85000 184400 109700';

export const PUNHOS = 'M-2000 116800H46500V126000H-2000ZM181000 115200H227000V124000H181000Z';
export const TIPOS_PUNHO = { sem: 'Sem punho', simples: 'Punho simples' };

// meião visto de frente
const MEIAO = 'M52 0H248C252 120 262 260 258 380C255 480 236 560 228 650C224 700 232 760 246 820C262 890 258 960 214 985C186 1000 114 1000 86 985C42 960 38 890 54 820C68 760 76 700 72 650C64 560 45 480 42 380C38 260 48 120 52 0Z';

// Áreas onde nome, número e imagens são posicionados (coordenadas da peça).
export const POSICOES_NUMERO_FRENTE = {
  nenhum: { nome: 'Sem número na frente' },
  'peito-direito': { nome: 'Peito direito', x: 80000, y: 88000, t: 30000 },
  centro: { nome: 'Centro do peito', x: 113500, y: 112000, t: 44000 },
  'peito-esquerdo': { nome: 'Peito esquerdo', x: 147000, y: 88000, t: 30000 },
};

export const POSICOES_IMAGEM = {
  'escudo-esquerdo': { nome: 'Escudo – peito esquerdo', peca: 'camisa', lado: 'frente', x: 147000, y: 62000, t: 30000 },
  'escudo-direito': { nome: 'Escudo – peito direito', peca: 'camisa', lado: 'frente', x: 80000, y: 62000, t: 30000 },
  'escudo-centro': { nome: 'Escudo – centro', peca: 'camisa', lado: 'frente', x: 113500, y: 58000, t: 28000 },
  'patrocinio-frente': { nome: 'Patrocínio – frente', peca: 'camisa', lado: 'frente', x: 113500, y: 135000, t: 90000 },
  'patrocinio-costas-topo': { nome: 'Patrocínio – costas (topo)', peca: 'camisa', lado: 'verso', x: 113500, y: 28000, t: 56000 },
  'patrocinio-costas-baixo': { nome: 'Patrocínio – costas (baixo)', peca: 'camisa', lado: 'verso', x: 114500, y: 246000, t: 80000 },
  'manga-esquerda': { nome: 'Manga esquerda', peca: 'camisa', lado: 'frente', x: 204000, y: 80000, t: 24000 },
  'manga-direita': { nome: 'Manga direita', peca: 'camisa', lado: 'frente', x: 21000, y: 80000, t: 24000 },
  'calcao-frente': { nome: 'Calção – perna esquerda', peca: 'calcao', lado: 'frente', x: 146000, y: 112000, t: 28000 },
  'calcao-costas': { nome: 'Calção – costas', peca: 'calcao', lado: 'verso', x: 91000, y: 36000, t: 30000 },
};

export const FONTES = {
  bebas: { nome: 'Clássica', familia: 'Bebas Neue', arquivo: 'bebas-neue-400.woff2', escala: 1 },
  oswald: { nome: 'Moderna', familia: 'Oswald', arquivo: 'oswald-600.woff2', escala: 0.86, peso: 600 },
  teko: { nome: 'Esportiva', familia: 'Teko', arquivo: 'teko-600.woff2', escala: 1.12, peso: 600 },
  // estilo College: a Graduate engrossada por um traço da mesma cor e um pouco mais alta
  graduate: { nome: 'Universitária', familia: 'Graduate', arquivo: 'graduate-400.woff2', escala: 0.8, engrossar: 0.09, esticar: 1.12 },
};

// ---------------------------------------------------------------- utilidades

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Variáveis CSS com todas as cores do estado.
export function variaveisCor(estado, camadasCamisa = 6, camadasCalcao = 6) {
  const c = estado.cores;
  const calcao = c.sincronizar ? c.camisa : c.calcao;
  const v = {
    '--camisa-base': hex(c.camisa.base),
    '--calcao-base': hex(calcao.base),
    '--gola': hex(estado.gola.cor),
    '--manga': hex(estado.manga.cor === 'corpo' ? c.camisa.base : estado.manga.cor),
    '--punho': hex(estado.punho.cor),
    '--meiao': hex(estado.meiao.cor),
    '--texto': hex(estado.nome.cor),
    '--texto-contorno': estado.nome.contorno === 'nenhum' ? 'transparent' : hex(estado.nome.contorno),
  };
  for (let i = 0; i < Math.max(camadasCamisa, c.camisa.camadas.length); i++)
    v[`--camisa-c${i + 1}`] = hex(c.camisa.camadas[i] ?? c.camisa.base);
  for (let i = 0; i < Math.max(camadasCalcao, calcao.camadas.length); i++)
    v[`--calcao-c${i + 1}`] = hex(calcao.camadas[i] ?? calcao.base);
  return v;
}

// ---------------------------------------------------------------- peças

function camadasModelo(modelo, peca, lado) {
  const camadas = modelo?.pecas?.[peca] ?? [];
  return camadas
    .map((c, i) => {
      const l = c[lado];
      if (!l) return '';
      const { w, h } = VB[peca];
      return `<svg x="0" y="0" width="${w}" height="${h}" viewBox="${l.viewBox}" preserveAspectRatio="none" overflow="visible" style="color:var(--${peca}-c${i + 1})" fill="currentColor">${l.svg}</svg>`;
    })
    .join('');
}

// Filtros de desfoque em coordenadas da peça (pequeno, médio e grande).
function filtros(id, w, h) {
  return [['b1', 1400], ['b2', 4200], ['b3', 9000], ['b4', 16000]]
    .map(([n, d]) => `<filter id="${id}-${n}" filterUnits="userSpaceOnUse" x="${-w * 0.2}" y="${-h * 0.2}" width="${w * 1.4}" height="${h * 1.4}"><feGaussianBlur stdDeviation="${d}"/></filter>`)
    .join('');
}

// Sombreamento da camisa: sombras (preto) e luzes (branco) suaves e desfocadas,
// imitando o caimento do tecido. Fica por cima das estampas, nomes e escudos.
function sombraCamisa(id, lado) {
  const frente = lado === 'frente';
  const e = (cx, cy, rx, ry, op, cor = '#000', rot = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cor}" fill-opacity="${op}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  return `<g pointer-events="none">
    <g filter="url(#${id}-b4)">
      ${e(50000, 200000, 11000, 110000, 0.4)}${e(180000, 200000, 11000, 110000, 0.4)}
      ${e(22000, 110000, 24000, 12000, 0.22)}${e(203000, 108000, 24000, 12000, 0.22)}
      ${e(frente ? 96000 : 92000, 110000, 30000, 75000, frente ? 0.2 : 0.14, '#fff')}${e(frente ? 138000 : 140000, 115000, 22000, 60000, 0.1, '#fff')}
      ${e(113000, 284000, 80000, 9000, 0.25)}
      ${e(4000, 75000, 7000, 48000, 0.3)}${e(221000, 75000, 7000, 48000, 0.3)}
      ${frente ? '' : e(113000, 40000, 60000, 18000, 0.1, '#fff')}
    </g>
    <g filter="url(#${id}-b3)">
      ${e(28000, 42000, 20000, 11000, 0.3, '#fff', -25)}${e(197000, 42000, 20000, 11000, 0.3, '#fff', 25)}
      ${e(20000, 85000, 8000, 26000, 0.16, '#fff')}${e(205000, 85000, 8000, 26000, 0.16, '#fff')}
      ${e(56000, 140000, 5000, 26000, 0.3, '#000', -14)}${e(174000, 138000, 5000, 26000, 0.3, '#000', 14)}
      ${e(80000, 215000, 5200, 62000, 0.13, '#000', 4)}${e(146000, 218000, 5200, 58000, 0.13, '#000', -4)}
      ${e(98000, 220000, 4200, 52000, 0.12, '#fff', 3)}${e(128000, 222000, 4200, 50000, 0.1, '#fff', -3)}
      ${e(113000, 170000, 4000, 45000, 0.07)}
    </g>
    <g filter="url(#${id}-b2)">
      ${frente ? e(113000, 21000, 30000, 6500, 0.3) : e(113000, 9000, 34000, 4500, 0.22)}
      ${e(22000, 119000, 24000, 2600, 0.24)}${e(203000, 117500, 24000, 2600, 0.24)}
      ${e(66000, 160000, 3000, 22000, 0.12, '#000', -22)}${e(160000, 160000, 3000, 22000, 0.12, '#000', 22)}
      <path d="M8000 279000C60000 286000 165000 286000 200000 276000" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="5000"/>
    </g>
    <path d="${COSTURA_MANGA}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="900" filter="url(#${id}-b1)"/>
    <path d="${COSTURA_MANGA}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="700" transform="translate(-1200 0)" filter="url(#${id}-b1)"/>
  </g>`;
}

function golaFrente(id, gola) {
  return `<path d="${gola.abertura}" fill="var(--camisa-base)"/>
    <path d="${gola.abertura}" fill="url(#${id}-interno)"/>
    <path d="${GOLA_INTERNA}" fill="var(--gola)"/><path d="${GOLA_INTERNA}" fill="#000" fill-opacity=".4"/>
    <path d="${gola.frente}" fill="var(--gola)"/>
    <path d="${gola.frente}" fill="url(#${id}-rib)"/>
    <path d="${gola.nervura}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="700"/>
    <path d="${gola.frente}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="500"/>`;
}

function camisa({ id, modelo, lado, estado, silhueta, overlays }) {
  const { w, h } = VB.camisa;
  const gola = GOLAS[estado.gola.tipo] ?? GOLAS.careca;
  const corManga = estado.manga.cor !== 'corpo';
  const frente = lado === 'frente';
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs><clipPath id="${id}-clip"><path d="${silhueta}"/></clipPath>${filtros(id, w, h)}
      <linearGradient id="${id}-interno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
      <linearGradient id="${id}-rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
    <g clip-path="url(#${id}-clip)">
      <rect x="-5000" y="-5000" width="${w + 10000}" height="${h + 10000}" fill="var(--camisa-base)"/>
      ${camadasModelo(modelo, 'camisa', lado)}
      ${corManga ? `<path d="${MANGAS.join('')}" fill="var(--manga)"/>` : ''}
      ${estado.punho.tipo === 'simples' ? `<path d="${PUNHOS}" fill="var(--punho)"/>` : ''}
      <g data-ov="camisa-${lado}">${overlays}</g>
      ${estado.punho.tipo === 'simples' ? `<path d="M-2000 116800H46500M181000 115200H227000" stroke="#000" stroke-opacity=".25" stroke-width="500" pointer-events="none"/>` : ''}
      ${sombraCamisa(id, lado)}
    </g>
    ${frente ? golaFrente(id, gola) : `<path d="${GOLA_COSTAS}" fill="var(--gola)"/><path d="${GOLA_COSTAS}" fill="url(#${id}-rib)"/><path d="${GOLA_COSTAS}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="500"/>`}
    <path d="${silhueta}" fill="none" stroke="#1b1f24" stroke-opacity=".45" stroke-width="700"/>
  </svg>`;
}

function sombraCalcao(id, lado) {
  const e = (cx, cy, rx, ry, op, cor = '#000', rot = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cor}" fill-opacity="${op}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const franzido = Array.from({ length: 14 }, (_, i) => e(10000 + i * 12000, 8500, 1300, 5500, 0.13)).join('');
  return `<g pointer-events="none">
    <g filter="url(#${id}-b4)">
      ${e(6000, 85000, 9000, 80000, 0.32)}${e(177000, 85000, 9000, 80000, 0.32)}
      ${e(46000, 75000, 20000, 45000, 0.18, '#fff')}${e(136000, 78000, 20000, 45000, 0.15, '#fff')}
    </g>
    <g filter="url(#${id}-b3)">
      ${e(91000, 100000, 6500, 42000, 0.38)}
      ${e(76000, 118000, 4500, 26000, 0.18, '#000', 18)}${e(106000, 118000, 4500, 26000, 0.18, '#000', -18)}
      ${e(40000, 150000, 34000, 5000, 0.2, '#000', 8)}${e(142000, 150000, 34000, 5000, 0.2, '#000', -8)}
      ${lado === 'verso' ? e(91000, 40000, 30000, 14000, 0.1, '#fff') : ''}
    </g>
    <g filter="url(#${id}-b1)">${franzido}
      <path d="M0 17000C40000 21000 140000 21000 182661 17000" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1000"/>
      <path d="M0 15500C40000 19500 140000 19500 182661 15500" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="700"/>
    </g>
  </g>`;
}

function calcao({ id, modelo, lado, silhueta, overlays }) {
  const { w, h } = VB.calcao;
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs><clipPath id="${id}-clip"><path d="${silhueta}"/></clipPath>${filtros(id, w, h)}</defs>
    <g clip-path="url(#${id}-clip)">
      <rect x="-5000" y="-5000" width="${w + 10000}" height="${h + 10000}" fill="var(--calcao-base)"/>
      ${camadasModelo(modelo, 'calcao', lado)}
      <g data-ov="calcao-${lado}">${overlays}</g>
      ${sombraCalcao(id, lado)}
    </g>
    <path d="${silhueta}" fill="none" stroke="#1b1f24" stroke-opacity=".45" stroke-width="650"/>
  </svg>`;
}

function meiao(id) {
  const { w, h } = VB.meiao;
  const nervuras = Array.from({ length: 19 }, (_, i) => `<path d="M${60 + i * 10} 6V104" />`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs><clipPath id="${id}-clip"><path d="${MEIAO}"/></clipPath>
      <filter id="${id}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
      <linearGradient id="${id}-lat" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".38"/>
        <stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".16"/>
        <stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient></defs>
    <g clip-path="url(#${id}-clip)">
      <rect width="${w}" height="${h}" fill="var(--meiao)"/>
      <g stroke="#000" stroke-opacity=".1" stroke-width="3">${nervuras}</g>
      <rect width="${w}" height="${h}" fill="url(#${id}-lat)"/>
      <g filter="url(#${id}-b)">
        <rect x="0" y="100" width="${w}" height="14" fill="#000" fill-opacity=".2"/>
        <ellipse cx="150" cy="690" rx="90" ry="22" fill="#000" fill-opacity=".14"/>
        <ellipse cx="150" cy="985" rx="110" ry="30" fill="#000" fill-opacity=".3"/>
        <ellipse cx="130" cy="330" rx="34" ry="140" fill="#fff" fill-opacity=".14"/>
      </g>
    </g>
    <path d="${MEIAO}" fill="none" stroke="#1b1f24" stroke-opacity=".45" stroke-width="4"/>
  </svg>`;
}

// ---------------------------------------------------------------- textos e imagens

function textoSvg({ texto, x, y, t, fonte, alvo }) {
  const f = FONTES[fonte] ?? FONTES.bebas;
  // o Chrome limita o tamanho de fonte (~10000 unidades); por isso o texto é
  // desenhado 100x menor dentro de um grupo ampliado
  const tam = (t * f.escala) / 100;
  const grosso = tam * (f.engrossar ?? 0);
  const atributos = `x="0" y="0" font-family="'${f.familia}'" font-weight="${f.peso ?? 400}" font-size="${tam}" text-anchor="middle"`;
  const conteudo = esc(texto);
  return `<g transform="translate(${x} ${y}) scale(100 ${100 * (f.esticar ?? 1)})" data-arrastar="${alvo}">
    <text ${atributos} fill="var(--texto-contorno)" stroke="var(--texto-contorno)" stroke-width="${grosso + tam * 0.08}" stroke-linejoin="round">${conteudo}</text>
    <text ${atributos} fill="var(--texto)"${grosso ? ` stroke="var(--texto)" stroke-width="${grosso}" stroke-linejoin="miter"` : ''}>${conteudo}</text></g>`;
}

export function overlaysPeca(estado, peca, lado) {
  const partes = [];
  const n = estado.nome;
  const desl = (k) => estado.deslocamentos?.[k] ?? [0, 0];
  const mover = (k, svg) => {
    const [dx, dy] = desl(k);
    return `<g transform="translate(${dx} ${dy})">${svg}</g>`;
  };
  if (peca === 'camisa' && lado === 'verso') {
    const yNome = n.posicaoNome === 'abaixo' ? 218000 : 62000;
    if (n.texto.trim()) partes.push(mover('nome', textoSvg({ texto: n.texto.trim(), x: 114000, y: yNome, t: n.tamanhoNome * 26000, fonte: n.fonte, alvo: 'nome' })));
    if (String(n.numero).trim()) {
      const yNum = n.posicaoNome === 'abaixo' ? 160000 : 178000;
      partes.push(mover('numero', textoSvg({ texto: n.numero, x: 114000, y: yNum, t: 100000, fonte: n.fonte, alvo: 'numero' })));
    }
  }
  if (peca === 'camisa' && lado === 'frente' && String(n.numero).trim()) {
    const p = POSICOES_NUMERO_FRENTE[n.numeroFrente];
    if (p?.x) partes.push(mover('numero-frente', textoSvg({ texto: n.numero, x: p.x, y: p.y, t: p.t, fonte: n.fonte, alvo: 'numero-frente' })));
  }
  if (peca === 'calcao' && lado === 'frente' && n.numeroCalcao && String(n.numero).trim())
    partes.push(mover('numero-calcao', textoSvg({ texto: n.numero, x: 32000, y: 118000, t: 30000, fonte: n.fonte, alvo: 'numero-calcao' })));
  for (const tx of estado.textos) {
    if (tx.peca !== peca || tx.lado !== lado || !tx.texto.trim()) continue;
    const vb = VB[peca];
    const x = { esquerda: vb.w * 0.32, centro: vb.w * 0.505, direita: vb.w * 0.68 }[tx.alinhamento];
    partes.push(mover(`texto-${tx.id}`, textoSvg({ texto: tx.texto, x, y: vb.h * tx.altura, t: tx.tamanho * 1000, fonte: n.fonte, alvo: `texto-${tx.id}` })));
  }
  for (const img of estado.imagens) {
    const p = POSICOES_IMAGEM[img.posicao];
    if (!p || p.peca !== peca || p.lado !== lado) continue;
    const t = p.t * img.escala;
    partes.push(mover(`img-${img.id}`, `<image href="${img.src}" x="${p.x - t / 2}" y="${p.y - t / 2}" width="${t}" height="${t}" preserveAspectRatio="xMidYMid meet" data-arrastar="img-${img.id}"/>`));
  }
  return partes.join('');
}

// ---------------------------------------------------------------- composição

// Posições das peças dentro de cada coluna (frente / verso).
const LARGURA_COLUNA = 520;

export function layout(estado) {
  const temCamisa = estado.pecas !== 'calcao';
  const temCalcao = estado.pecas !== 'camisa';
  const temMeiao = estado.meiao.ativo;
  const itens = [];
  let y = 0;
  if (temCamisa) {
    itens.push({ peca: 'camisa', x: 40, y: 0, w: 400 });
    y = 470;
  }
  if (temCalcao) {
    const w = temCamisa ? 300 : 400;
    itens.push({ peca: 'calcao', x: temCamisa ? 90 : 40, y, w });
    if (temMeiao) itens.push({ peca: 'meiao', x: temCamisa ? 405 : 450, y: y + 30, w: 76 });
  } else if (temMeiao) {
    itens.push({ peca: 'meiao', x: 200, y: y + 20, w: 90 });
  }
  const altura = Math.max(...itens.map((i) => i.y + (i.w * VB[i.peca].h) / VB[i.peca].w)) + 20;
  return { itens, altura, largura: LARGURA_COLUNA };
}

// Gera o SVG completo do palco. `modelos` = { camisa, calcao } (JSON carregado).
export function montarPalco({ estado, modelos, silhuetas, vista, prefixo = 'p' }) {
  const lados = vista === 'ambos' ? ['frente', 'verso'] : [vista];
  const { itens, altura, largura } = layout(estado);
  const colunas = lados
    .map((lado, col) => {
      const ox = col * largura;
      const pecas = itens
        .map((it) => {
          const h = (it.w * VB[it.peca].h) / VB[it.peca].w;
          const id = `${prefixo}-${lado}-${it.peca}`;
          let corpo;
          if (it.peca === 'camisa')
            corpo = camisa({ id, modelo: modelos.camisa, lado, estado, silhueta: silhuetas.camisa, overlays: overlaysPeca(estado, 'camisa', lado) });
          else if (it.peca === 'calcao')
            corpo = calcao({ id, modelo: modelos.calcao, lado, silhueta: silhuetas.calcao, overlays: overlaysPeca(estado, 'calcao', lado) });
          else corpo = meiao(id);
          return `<g data-peca="${it.peca}" data-lado="${lado}">${corpo.replace('<svg ', `<svg x="${ox + it.x}" y="${it.y}" width="${it.w}" height="${h}" `)}</g>`;
        })
        // a camisa vai por cima do calção
        .sort((a, b) => (a.includes('data-peca="camisa"') ? 1 : 0) - (b.includes('data-peca="camisa"') ? 1 : 0))
        .join('');
      const legenda = vista === 'ambos' ? `<text x="${ox + largura / 2}" y="${altura + 6}" text-anchor="middle" class="legenda-lado">${lado === 'frente' ? 'FRENTE' : 'COSTAS'}</text>` : '';
      return pecas + legenda;
    })
    .join('');
  // margem de respiro em volta do uniforme
  const mx = 60;
  const my = 50;
  const total = lados.length * largura;
  return { svg: colunas, viewBox: `${-mx} ${-my} ${total + mx * 2} ${altura + (vista === 'ambos' ? 24 : 0) + my * 2}` };
}
