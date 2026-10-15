// Monta o SVG do uniforme. As cores entram por variáveis CSS (--camisa-base,
// --camisa-c1...), assim trocar uma cor não exige redesenhar as estampas.
import { hex } from './cores.js';

export const VB = {
  camisa: { w: 224820, h: 284513 },
  calcao: { w: 182661, h: 157761 },
  meiao: { w: 600, h: 690 },
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
    // decote raso, faixa fina e laterais levemente curvas
    frente: 'M79600 -500C88000 11500 104000 28500 113400 37800C122800 28500 138800 11500 147400 -500L141300 1700C133400 11300 120400 23200 113400 31400C106400 23200 93600 11300 85700 1700Z',
    abertura: 'M85700 1700C93600 11300 106400 23200 113400 31400C120400 23200 133400 11300 141300 1700C130000 -900 97000 -900 85700 1700Z',
    nervura: 'M82600 600C90800 11400 105200 25800 113400 34600C121600 25800 136100 11400 144400 600',
    // costura cruzada na ponta do V
    detalhe: 'M113400 37600L117600 31000',
  },
};
export const TIPOS_GOLA = Object.fromEntries(Object.entries(GOLAS).map(([k, g]) => [k, g.nome]));

// faixa interna das costas (vista pela abertura da frente) e gola vista de costas
const GOLA_INTERNA = 'M87300 2400C97000 -900 130000 -900 140200 2400L138600 4600C129000 1600 98500 1600 88900 4600Z';
const GOLA_COSTAS = 'M78800 -500C86500 11500 140500 11500 148200 -500L141000 -500C133500 5200 93500 5200 86000 -500Z';

// costura da manga (manga comum, montada separada do corpo)
const COSTURA_MANGA = 'M39500 16500C49500 45000 50500 85000 43200 114200M186500 17500C176000 45000 175500 85000 184400 109700';

// punhos levemente inclinados, acompanhando a barra de cada manga
export const PUNHOS = 'M-2000 113700L43300 115500V127000H-2000ZM184600 115000L227000 113500V126000H184600Z';
const PUNHOS_COSTURA = 'M-2000 113700L43300 115500M184600 115000L227000 113500';
export const TIPOS_PUNHO = { sem: 'Sem punho', simples: 'Punho simples' };

// par de meiões com chuteira (coordenadas de uma perna: 170 x 470). O meião é
// desenhado curto e esticado na vertical; a chuteira só desce, sem deformar.
const ESTICA_MEIAO = 1.5;
const DESCE_CHUTEIRA = 340 * (ESTICA_MEIAO - 1);
const PERNA = {
  // meião do punho até o tornozelo (a chuteira cobre a parte de baixo)
  meiao: 'M33 0H137C143 40 152 90 151 140C150 200 133 250 123 300C119 320 117 338 118 352H52C53 338 51 320 47 300C37 250 20 200 19 140C18 90 27 40 33 0Z',
  meiaoCostas: 'M33 0H137C144 40 154 92 152 145C150 205 131 255 119 302C114 322 112 338 113 352H57C58 338 56 322 51 302C39 255 20 205 18 145C16 92 26 40 33 0Z',
  // chuteira de frente: cabedal, sola e travas
  chuteiraFrente: 'M48 334C44 356 30 384 22 414C16 438 26 458 50 462H120C144 458 154 438 148 414C140 384 126 356 122 334Z',
  solaFrente: 'M18 440C18 462 32 474 52 475H118C138 474 152 462 152 440C146 456 134 462 120 463H50C36 462 24 456 18 440Z',
  biqueira: 'M28 432C50 447 120 447 142 432',
  lingueta: 'M68 330H102V362C102 368 68 368 68 362Z',
  cadarco: 'M70 362L100 368M70 376L100 370M70 378L100 384M70 392L100 386M70 394L100 400M70 408L100 402',
  // chuteira de costas: calcanhar arredondado
  chuteiraCostas: 'M52 334C47 366 38 398 38 428C38 450 55 462 85 462C115 462 132 450 132 428C132 398 123 366 118 334Z',
  solaCostas: 'M34 440C34 462 54 474 85 474C116 474 136 462 136 440C128 458 110 465 85 465C60 465 42 458 34 440Z',
  travas: 'M34 474h13v7h-13zM62 475h13v7h-13zM95 475h13v7h-13zM123 474h13v7h-13z',
};

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
    <path d="${gola.nervura}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="600"/>
    ${gola.detalhe ? `<path d="${gola.detalhe}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="600"/>` : ''}
    <path d="${gola.frente}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="500"/>`;
}

function camisa({ id, modelo, lado, estado, silhueta, overlays }) {
  const { w, h } = VB.camisa;
  const gola = GOLAS[estado.gola.tipo] ?? GOLAS.careca;
  const frente = lado === 'frente';
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs><clipPath id="${id}-clip"><path d="${silhueta}"/></clipPath>${filtros(id, w, h)}
      <linearGradient id="${id}-interno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
      <linearGradient id="${id}-rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
    <g clip-path="url(#${id}-clip)">
      <rect x="-5000" y="-5000" width="${w + 10000}" height="${h + 10000}" fill="var(--camisa-base)"/>
      ${camadasModelo(modelo, 'camisa', lado)}
      ${estado.punho.tipo === 'simples' ? `<path d="${PUNHOS}" fill="var(--punho)"/>` : ''}
      <g data-ov="camisa-${lado}">${overlays}</g>
      ${estado.punho.tipo === 'simples' ? `<path d="${PUNHOS_COSTURA}" stroke="#000" stroke-opacity=".25" stroke-width="500" pointer-events="none"/>` : ''}
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

function perna(id, lado, n) {
  const frente = lado === 'frente';
  const meiaoPath = frente ? PERNA.meiao : PERNA.meiaoCostas;
  const pid = `${id}-${n}`;
  const nervuras = Array.from({ length: 13 }, (_, i) => `<path d="M${37 + i * 8} 2V30"/>`).join('');
  return `<defs><clipPath id="${pid}-clip"><path d="${meiaoPath}"/></clipPath></defs>
    <g transform="scale(1 ${ESTICA_MEIAO})">
    <g clip-path="url(#${pid}-clip)">
      <rect width="170" height="470" fill="var(--meiao)"/>
      <g stroke="#000" stroke-opacity=".12" stroke-width="2.4">${nervuras}</g>
      <rect width="170" height="470" fill="url(#${id}-cil)"/>
      <g filter="url(#${id}-b)">
        <rect x="0" y="30" width="170" height="7" fill="#000" fill-opacity=".28"/>
        <rect x="0" y="22" width="170" height="5" fill="#fff" fill-opacity=".18"/>
        <ellipse cx="${frente ? 66 : 70}" cy="150" rx="14" ry="95" fill="#fff" fill-opacity=".22"/>
        <ellipse cx="${frente ? 128 : 125}" cy="170" rx="10" ry="110" fill="#000" fill-opacity=".22"/>
        <ellipse cx="85" cy="320" rx="50" ry="10" fill="#000" fill-opacity=".14"/>
        ${frente ? '' : '<ellipse cx="85" cy="250" rx="7" ry="80" fill="#000" fill-opacity=".12"/>'}
      </g>
    </g>
    <path d="${meiaoPath}" fill="none" stroke="#1b1f24" stroke-opacity=".45" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
    </g>
    <g transform="translate(0 ${DESCE_CHUTEIRA})">
    ${frente
      ? `<path d="${PERNA.chuteiraFrente}" fill="url(#${id}-couro)"/>
         <path d="${PERNA.lingueta}" fill="#f4f5f6" stroke="#9aa3aa" stroke-width="1.2"/>
         <path d="${PERNA.cadarco}" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>
         <path d="${PERNA.cadarco}" stroke="#7d8790" stroke-width="1" stroke-linecap="round" fill="none"/>
         <path d="${PERNA.biqueira}" fill="none" stroke="#b5bcc2" stroke-width="1.6"/>
         <ellipse cx="72" cy="448" rx="30" ry="7" fill="#fff" fill-opacity=".8" filter="url(#${id}-b)"/>
         <path d="${PERNA.chuteiraFrente}" fill="none" stroke="#5f6a73" stroke-opacity=".7" stroke-width="1.4"/>
         <path d="${PERNA.solaFrente}" fill="#d9dde0" stroke="#5f6a73" stroke-opacity=".7" stroke-width="1.2"/>`
      : `<path d="${PERNA.chuteiraCostas}" fill="url(#${id}-couro)"/>
         <path d="M85 340V452" stroke="#9aa3aa" stroke-width="1.4"/>
         <path d="M64 342C64 376 70 404 85 412C100 404 106 376 106 342" fill="none" stroke="#c3c9ce" stroke-width="2"/>
         <path d="M52 336C70 344 100 344 118 336" fill="none" stroke="#8d969d" stroke-width="2.4"/>
         <ellipse cx="72" cy="420" rx="12" ry="30" fill="#fff" fill-opacity=".7" filter="url(#${id}-b)"/>
         <path d="${PERNA.chuteiraCostas}" fill="none" stroke="#5f6a73" stroke-opacity=".7" stroke-width="1.4"/>
         <path d="${PERNA.solaCostas}" fill="#d9dde0" stroke="#5f6a73" stroke-opacity=".7" stroke-width="1.2"/>`}
    <path d="${PERNA.travas}" fill="#3a4148"/>
    </g>`;
}

// Par de pernas com meião e chuteira, de frente ou de costas.
function meiao(id, lado) {
  const { w, h } = VB.meiao;
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs>
      <filter id="${id}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      <linearGradient id="${id}-cil" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".22" stop-color="#000" stop-opacity=".08"/>
        <stop offset=".38" stop-color="#fff" stop-opacity=".14"/><stop offset=".6" stop-color="#000" stop-opacity="0"/>
        <stop offset=".85" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
      <linearGradient id="${id}-couro" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#b9c0c6"/><stop offset=".3" stop-color="#ffffff"/>
        <stop offset=".65" stop-color="#f1f3f4"/><stop offset="1" stop-color="#aab2b9"/></linearGradient>
    </defs>
    <ellipse cx="132" cy="672" rx="92" ry="9" fill="#000" fill-opacity=".18" filter="url(#${id}-b)"/>
    <ellipse cx="468" cy="672" rx="92" ry="9" fill="#000" fill-opacity=".18" filter="url(#${id}-b)"/>
    <g transform="translate(37 0) scale(1.12 1.04) rotate(2.5 85 0)">${perna(id, lado, 'e')}</g>
    <g transform="translate(373 0) scale(1.12 1.04) rotate(-2.5 85 0)">${perna(id, lado, 'd')}</g>
  </svg>`;
}

// ---------------------------------------------------------------- textos e imagens

function textoSvg({ texto, x, y, t, fonte, alvo, fx = 1 }) {
  const f = FONTES[fonte] ?? FONTES.bebas;
  // o Chrome limita o tamanho de fonte (~10000 unidades); por isso o texto é
  // desenhado 100x menor dentro de um grupo ampliado
  const tam = (t * f.escala) / 100;
  const grosso = tam * (f.engrossar ?? 0);
  const atributos = `x="0" y="0" font-family="'${f.familia}'" font-weight="${f.peso ?? 400}" font-size="${tam}" text-anchor="middle"`;
  const conteudo = esc(texto);
  return `<g transform="translate(${x} ${y}) scale(${100 * fx} ${100 * (f.esticar ?? 1)})" data-arrastar="${alvo}">
    <text ${atributos} fill="var(--texto-contorno)" stroke="var(--texto-contorno)" stroke-width="${grosso + tam * 0.08}" stroke-linejoin="round">${conteudo}</text>
    <text ${atributos} fill="var(--texto)"${grosso ? ` stroke="var(--texto)" stroke-width="${grosso}" stroke-linejoin="miter"` : ''}>${conteudo}</text></g>`;
}

// fx compensa peças esticadas na horizontal (mockup em foto), para os textos e
// imagens não ficarem deformados
export function overlaysPeca(estado, peca, lado, fx = 1) {
  const partes = [];
  const n = estado.nome;
  const desl = (k) => estado.deslocamentos?.[k] ?? [0, 0];
  const mover = (k, svg) => {
    const [dx, dy] = desl(k);
    return `<g transform="translate(${dx} ${dy})">${svg}</g>`;
  };
  if (peca === 'camisa' && lado === 'verso') {
    const yNome = n.posicaoNome === 'abaixo' ? 218000 : 62000;
    if (n.texto.trim()) partes.push(mover('nome', textoSvg({ fx, texto: n.texto.trim(), x: 114000, y: yNome, t: n.tamanhoNome * 26000, fonte: n.fonte, alvo: 'nome' })));
    if (String(n.numero).trim()) {
      const yNum = n.posicaoNome === 'abaixo' ? 160000 : 178000;
      partes.push(mover('numero', textoSvg({ fx, texto: n.numero, x: 114000, y: yNum, t: 100000, fonte: n.fonte, alvo: 'numero' })));
    }
  }
  if (peca === 'camisa' && lado === 'frente' && String(n.numero).trim()) {
    const p = POSICOES_NUMERO_FRENTE[n.numeroFrente];
    if (p?.x) partes.push(mover('numero-frente', textoSvg({ fx, texto: n.numero, x: p.x, y: p.y, t: p.t, fonte: n.fonte, alvo: 'numero-frente' })));
  }
  if (peca === 'calcao' && lado === 'frente' && n.numeroCalcao && String(n.numero).trim())
    partes.push(mover('numero-calcao', textoSvg({ fx, texto: n.numero, x: 32000, y: 118000, t: 30000, fonte: n.fonte, alvo: 'numero-calcao' })));
  for (const tx of estado.textos) {
    if (tx.peca !== peca || tx.lado !== lado || !tx.texto.trim()) continue;
    const vb = VB[peca];
    const x = { esquerda: vb.w * 0.32, centro: vb.w * 0.505, direita: vb.w * 0.68 }[tx.alinhamento];
    partes.push(mover(`texto-${tx.id}`, textoSvg({ fx, texto: tx.texto, x, y: vb.h * tx.altura, t: tx.tamanho * 1000, fonte: n.fonte, alvo: `texto-${tx.id}` })));
  }
  for (const img of estado.imagens) {
    const p = POSICOES_IMAGEM[img.posicao];
    if (!p || p.peca !== peca || p.lado !== lado) continue;
    const t = p.t * img.escala;
    partes.push(mover(`img-${img.id}`, `<image href="${img.src}" x="${p.x - (t * fx) / 2}" y="${p.y - t / 2}" width="${t * fx}" height="${t}" preserveAspectRatio="none" data-arrastar="img-${img.id}"/>`));
  }
  return partes.join('');
}

// ---------------------------------------------------------------- composição

// Posições das peças dentro de cada coluna (frente / verso).
const LARGURA_COLUNA = 440;

export function layout(estado) {
  const temCamisa = estado.pecas !== 'calcao';
  const temCalcao = estado.pecas !== 'camisa';
  const temMeiao = estado.meiao.ativo;
  const itens = [];
  let y = 0;
  if (temCamisa) {
    itens.push({ peca: 'camisa', x: 20, y: 0, w: 400 });
    y = 470;
  }
  if (temCalcao) {
    const w = temCamisa ? 300 : 360;
    const x = temCamisa ? 70 : 40;
    itens.push({ peca: 'calcao', x, y, w });
    // os meiões ficam alinhados às pernas do calção, logo abaixo da barra
    if (temMeiao) itens.push({ peca: 'meiao', x, y: y + (w * VB.calcao.h) / VB.calcao.w + 18, w });
  } else if (temMeiao) {
    itens.push({ peca: 'meiao', x: 70, y: y + 30, w: 300 });
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
          else corpo = meiao(id, lado);
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

// ---------------------------------------------------------------- mockup em foto

// Monta o palco sobre a foto do mockup: as estampas são encaixadas na caixa de
// cada peça da foto e a própria foto entra por cima como luz e sombra
// (multiplicar para sombras, tela para brilhos). `foto` é o mockup/foto.json.
export function montarPalcoFoto({ estado, modelos, foto, vista, prefixo = 'f', base = 'mockup/' }) {
  const lados = vista === 'ambos' ? ['frente', 'verso'] : [vista];
  const temCamisa = estado.pecas !== 'calcao';
  const temCalcao = estado.pecas !== 'camisa';
  const GAP = 40;
  let ox = 0;
  let alturaMax = 0;
  const colunas = lados.map((lado) => {
    const f = foto.lados[lado === 'verso' ? 'costas' : 'frente'];
    const [x0, y0, w, h] = f.recorte;
    const id = `${prefixo}-${lado}`;
    const cam = f.pecas.camisa;
    const cal = f.pecas.calcao;
    // camisa: estica a arte plana até a caixa da peça na foto
    const [cx0, cy0, cx1, cy1] = cam.caixa;
    const sxCam = (cx1 - cx0) / VB.camisa.w;
    const syCam = (cy1 - cy0) / VB.camisa.h;
    // calção: escala uniforme pela largura, alinhado pela barra das pernas
    const [kx0, , kx1, ky1] = cal.caixa;
    const sCal = (kx1 - kx0) / VB.calcao.w;
    const hCal = VB.calcao.h * sCal;
    const clipes = [temCamisa && cam.caminho, temCalcao && cal.caminho].filter(Boolean).join('');
    const frente = lado === 'frente';
    // gola careca na frente: mapas de luz sem o V da foto + gola redonda desenhada
    const careca = frente && estado.gola.tipo === 'careca' && f.careca;
    const mapa = `${frente ? 'frente' : 'costas'}${careca ? '-careca' : ''}`;
    let meiao_ = '';
    let altura = h;
    if (estado.meiao.ativo && temCalcao) {
      const mw = kx1 - kx0;
      const mh = (mw * VB.meiao.h) / VB.meiao.w;
      meiao_ = `<g data-peca="meiao">${meiao(`${id}-meiao`, lado).replace('<svg ', `<svg x="${kx0}" y="${ky1 + 14}" width="${mw}" height="${mh}" `)}</g>`;
      altura = Math.max(h, ky1 + 14 + mh - y0);
    }
    alturaMax = Math.max(alturaMax, altura);
    const conteudo = `<g transform="translate(${ox - x0} ${-y0})">
      <defs>
        <clipPath id="${id}-cam"><path d="${cam.caminho}"/></clipPath>
        <clipPath id="${id}-cal"><path d="${cal.caminho}"/></clipPath>
        <clipPath id="${id}-pecas"><path d="${clipes}"/></clipPath>
        <linearGradient id="${id}-interno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
        <linearGradient id="${id}-rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
        <filter id="${id}-sb" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <g data-peca="foto" style="isolation:isolate">
      ${temCalcao ? `<g clip-path="url(#${id}-cal)">
        <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--calcao-base)"/>
        <svg x="${kx0}" y="${ky1 - hCal}" width="${kx1 - kx0}" height="${hCal}" viewBox="0 0 ${VB.calcao.w} ${VB.calcao.h}" overflow="visible">
          ${camadasModelo(modelos.calcao, 'calcao', lado)}<g data-ov="calcao-${lado}" data-fx="1">${overlaysPeca(estado, 'calcao', lado)}</g>
        </svg></g>` : ''}
      ${temCamisa ? `<g clip-path="url(#${id}-cam)">
        <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--camisa-base)"/>
        <svg x="${cx0}" y="${cy0}" width="${cx1 - cx0}" height="${cy1 - cy0}" viewBox="0 0 ${VB.camisa.w} ${VB.camisa.h}" preserveAspectRatio="none" overflow="visible">
          ${camadasModelo(modelos.camisa, 'camisa', lado)}
          <path d="${COSTURA_MANGA}" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
          <path d="${COSTURA_MANGA}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1" vector-effect="non-scaling-stroke" transform="translate(-900 0)"/>
        </svg>
        ${estado.punho.tipo === 'simples' ? `<path d="${f.punhos}" fill="var(--punho)"/>` : ''}
        <svg x="${cx0}" y="${cy0}" width="${cx1 - cx0}" height="${cy1 - cy0}" viewBox="0 0 ${VB.camisa.w} ${VB.camisa.h}" preserveAspectRatio="none" overflow="visible">
          <g data-ov="camisa-${lado}" data-fx="${syCam / sxCam}">${overlaysPeca(estado, 'camisa', lado, syCam / sxCam)}</g>
        </svg>
        ${careca
          ? `<path d="${careca.abertura}" fill="var(--camisa-base)"/><path d="${careca.golaInterna}" fill="var(--gola)"/><path d="${careca.gola}" fill="var(--gola)"/>`
          : `${frente ? `<path d="${f.abertura}" fill="var(--camisa-base)"/><path d="${f.golaInterna}" fill="var(--gola)"/>` : ''}<path d="${f.gola}" fill="var(--gola)"/>`}
      </g>` : ''}
      <!-- o recorte vai em cada imagem: um grupo recortado isolaria a mistura das cores -->
      <image href="${base}sombra-${mapa}.webp" x="${x0}" y="${y0}" width="${w}" height="${h}" clip-path="url(#${id}-pecas)" style="mix-blend-mode:multiply" pointer-events="none"/>
      <image href="${base}brilho-${mapa}.webp" x="${x0}" y="${y0}" width="${w}" height="${h}" clip-path="url(#${id}-pecas)" style="mix-blend-mode:screen" opacity=".38" pointer-events="none"/>
      ${careca && temCamisa ? `<g pointer-events="none">
        <path d="${careca.gola}" fill="#000" fill-opacity=".35" filter="url(#${id}-sb)" transform="translate(0 3)"/>
        <path d="${careca.abertura}" fill="url(#${id}-interno)"/>
        <path d="${careca.golaInterna}" fill="#000" fill-opacity=".35"/>
        <path d="${careca.gola}" fill="var(--gola)"/>
        <path d="${careca.gola}" fill="url(#${id}-rib)"/>
        <path d="${careca.nervura}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width=".8"/>
        <path d="${careca.gola}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width=".7"/>
      </g>` : ''}
      </g>
      ${meiao_}
    </g>`;
    const legenda = vista === 'ambos' ? `<text x="${ox + w / 2}" y="${altura + 30}" text-anchor="middle" class="legenda-lado" style="font-size:18px">${frente ? 'FRENTE' : 'COSTAS'}</text>` : '';
    const largura = w;
    ox += largura + GAP;
    return conteudo + legenda;
  });
  const total = ox - GAP;
  const m = 30;
  return { svg: colunas.join(''), viewBox: `${-m} ${-m} ${total + 2 * m} ${alturaMax + (vista === 'ambos' ? 44 : 0) + 2 * m}` };
}
