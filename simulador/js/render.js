// Monta o SVG do uniforme. As cores entram por variáveis CSS (--camisa-base,
// --camisa-c1...), assim trocar uma cor não exige redesenhar as estampas.
import { hex } from './cores.js';

export const VB = {
  camisa: { w: 224820, h: 284513 },
  calcao: { w: 182661, h: 157761 },
  meiao: { w: 480, h: 1000 },
};

// ---------------------------------------------------------------- formas fixas

export const GOLAS = {
  // cada gola: faixa da frente, abertura (interior visível) e faixa das costas
  redonda: {
    nome: 'Redonda',
    frente: 'M78500 -500C82000 33000 144500 33000 148500 -500L140800 2200C137500 23500 89500 23500 86200 2200Z',
    abertura: 'M86200 2200C89500 23500 137500 23500 140800 2200C130000 -1500 97000 -1500 86200 2200Z',
    friso: 'M82300 1000C85800 28500 141000 28500 144600 1000',
  },
  careca: {
    nome: 'Careca',
    frente: 'M79500 -500C84000 21000 143000 21000 147500 -500L140500 1800C137000 13500 90500 13500 86800 1800Z',
    abertura: 'M86800 1800C90500 13500 137000 13500 140500 1800C130000 -1200 97000 -1200 86800 1800Z',
    friso: 'M83100 700C87300 17500 140000 17500 144000 700',
  },
  v: {
    nome: 'Gola V',
    frente: 'M78000 -500L113400 52000L149000 -500L140000 1800L113400 40500L87000 1800Z',
    abertura: 'M87000 1800L113400 40500L140000 1800C130000 -1200 97000 -1200 87000 1800Z',
    friso: 'M82500 650L113400 46300L144500 650',
  },
  polo: {
    nome: 'Polo',
    frente:
      'M78500 -500C80500 14000 92000 26000 108000 33500L106500 46000C92000 40500 80500 29500 75500 12000Z' +
      'M148500 -500C146500 14000 135000 26000 119000 33500L120500 46000C135000 40500 146500 29500 151500 12000Z' +
      'M107600 22000H119400V66000H107600Z',
    abertura: 'M84000 1500C88000 16000 100000 26000 113500 30000C127000 26000 139000 16000 143000 1500C131000 -1200 96000 -1200 84000 1500Z',
    friso: 'M77500 6000C80000 22000 91500 33500 107300 40000M149500 6000C147000 22000 135500 33500 119700 40000',
    botoes: [[113500, 36000], [113500, 52000]],
  },
};
export const TIPOS_GOLA = Object.fromEntries(Object.entries(GOLAS).map(([k, g]) => [k, g.nome]));

const GOLA_COSTAS = 'M78500 -500C86000 10500 141000 10500 148500 -500L141500 -500C134000 4800 93000 4800 85500 -500Z';

export const MANGAS = {
  tradicional: [
    'M-2000 -2000H39500V15500C49500 45000 50500 85000 43200 114200L46000 132000H-2000Z',
    'M227000 -2000H186500V16500C176000 45000 175500 85000 184400 109700L182000 132000H227000Z',
  ],
  raglan: [
    'M-2000 -2000H80500L83000 2200C70000 40000 55500 80000 43200 114200L46000 132000H-2000Z',
    'M227000 -2000H146500L144000 2400C157500 40000 171500 75000 184400 109700L182000 132000H227000Z',
  ],
};
export const TIPOS_MANGA = { tradicional: 'Tradicional', raglan: 'Raglan' };

export const PUNHOS = 'M-2000 116800H46500V126000H-2000ZM181000 115200H227000V124000H181000Z';
export const TIPOS_PUNHO = { sem: 'Sem punho', simples: 'Punho simples' };

const MEIAO = {
  contorno: 'M60 0H260V600C260 668 284 716 340 748L424 798C478 830 478 952 404 966L176 974C96 976 56 930 56 858L60 600Z',
  punho: 'M0 0H480V96H0Z',
  pe: 'M0 820H160C200 820 210 870 210 900V1000H0ZM400 760H480V1000H360C360 900 380 820 400 760Z',
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
  graduate: { nome: 'Universitária', familia: 'Graduate', arquivo: 'graduate-400.woff2', escala: 0.78 },
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
    '--gola-friso': estado.gola.friso === 'nenhum' ? 'transparent' : hex(estado.gola.friso),
    '--manga': hex(estado.manga.cor === 'corpo' ? c.camisa.base : estado.manga.cor),
    '--punho': hex(estado.punho.cor),
    '--meiao-base': hex(estado.meiao.base),
    '--meiao-punho': hex(estado.meiao.punho),
    '--meiao-faixas': hex(estado.meiao.corFaixas),
    '--meiao-pe': hex(estado.meiao.pe),
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

function sombreamentoCamisa(id) {
  return `
  <linearGradient id="${id}-lat" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".2" stop-color="#000" stop-opacity=".04"/>
    <stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".04"/>
    <stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  <radialGradient id="${id}-luz" cx=".5" cy=".32" r=".55">
    <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}-vert" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".06"/><stop offset=".15" stop-color="#000" stop-opacity="0"/>
    <stop offset=".9" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>`;
}

function camisa({ id, modelo, lado, estado, silhueta, overlays }) {
  const { w, h } = VB.camisa;
  const gola = GOLAS[estado.gola.tipo] ?? GOLAS.redonda;
  const mangas = MANGAS[estado.manga.tipo] ?? MANGAS.tradicional;
  const corManga = estado.manga.cor !== 'corpo';
  const frente = lado === 'frente';
  const dobras = `<g fill="none" stroke-linecap="round">
      <path d="M50000 135000C70000 150000 75000 175000 70000 205000" stroke="#000" stroke-opacity=".06" stroke-width="3500"/>
      <path d="M178000 132000C158000 152000 154000 185000 160000 215000" stroke="#000" stroke-opacity=".06" stroke-width="3500"/>
      <path d="M43000 60000C44000 80000 44000 95000 42000 112000" stroke="#000" stroke-opacity=".1" stroke-width="2200"/>
      <path d="M184000 60000C183000 80000 183000 95000 185000 110000" stroke="#000" stroke-opacity=".1" stroke-width="2200"/>
      <path d="M95000 160000C100000 200000 98000 240000 92000 275000" stroke="#fff" stroke-opacity=".07" stroke-width="5000"/></g>`;
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs><clipPath id="${id}-clip"><path d="${silhueta}"/></clipPath>${sombreamentoCamisa(id)}</defs>
    <g clip-path="url(#${id}-clip)">
      <rect x="-5000" y="-5000" width="${w + 10000}" height="${h + 10000}" fill="var(--camisa-base)"/>
      ${camadasModelo(modelo, 'camisa', lado)}
      ${corManga ? `<path d="${mangas.join('')}" fill="var(--manga)"/><path d="${mangas.join('')}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="700"/>` : ''}
      ${estado.punho.tipo === 'simples' ? `<path d="${PUNHOS}" fill="var(--punho)"/><path d="${PUNHOS}" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="500"/>` : ''}
      ${dobras}
      <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${id}-lat)"/>
      <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${id}-vert)"/>
      ${frente ? `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#${id}-luz)"/>` : ''}
      <g data-ov="camisa-${lado}">${overlays}</g>
    </g>
    ${frente ? `<path d="${gola.abertura}" fill="var(--camisa-base)"/><path d="${gola.abertura}" fill="#000" fill-opacity=".45"/>` : ''}
    ${frente
      ? `<path d="${gola.frente}" fill="var(--gola)"/><path d="${gola.friso}" fill="none" stroke="var(--gola-friso)" stroke-width="1600"/>
         <path d="${gola.frente}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="600"/>
         ${(gola.botoes ?? []).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2300" fill="#fff" stroke="#000" stroke-opacity=".35" stroke-width="500"/>`).join('')}`
      : `<path d="${GOLA_COSTAS}" fill="var(--gola)"/><path d="${GOLA_COSTAS}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="600"/>`}
    <path d="${silhueta}" fill="none" stroke="#1b1f24" stroke-opacity=".55" stroke-width="900"/>
  </svg>`;
}

function calcao({ id, modelo, lado, silhueta, overlays }) {
  const { w, h } = VB.calcao;
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs><clipPath id="${id}-clip"><path d="${silhueta}"/></clipPath>
      <linearGradient id="${id}-lat" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".25" stop-color="#000" stop-opacity=".02"/>
        <stop offset=".44" stop-color="#000" stop-opacity=".1"/><stop offset=".5" stop-color="#000" stop-opacity=".16"/>
        <stop offset=".56" stop-color="#000" stop-opacity=".1"/><stop offset=".75" stop-color="#000" stop-opacity=".02"/>
        <stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient></defs>
    <g clip-path="url(#${id}-clip)">
      <rect x="-5000" y="-5000" width="${w + 10000}" height="${h + 10000}" fill="var(--calcao-base)"/>
      ${camadasModelo(modelo, 'calcao', lado)}
      <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${id}-lat)"/>
      <path d="M0 15500C40000 19500 140000 19500 182661 15500" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="900"/>
      ${lado === 'frente' ? '<path d="M88000 19000C90000 40000 90500 60000 90400 76000" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="900"/>' : ''}
      <g data-ov="calcao-${lado}">${overlays}</g>
    </g>
    <path d="${silhueta}" fill="none" stroke="#1b1f24" stroke-opacity=".55" stroke-width="800"/>
  </svg>`;
}

function meiao(id, estado) {
  const { w, h } = VB.meiao;
  const n = estado.meiao.faixas;
  const faixas = Array.from({ length: n }, (_, i) => `<rect x="0" y="${130 + i * 70}" width="${w}" height="38"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" overflow="visible">
    <defs><clipPath id="${id}-clip"><path d="${MEIAO.contorno}"/></clipPath>
      <linearGradient id="${id}-lat" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/>
        <stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".08"/>
        <stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient></defs>
    <g clip-path="url(#${id}-clip)">
      <rect width="${w}" height="${h}" fill="var(--meiao-base)"/>
      <path d="${MEIAO.punho}" fill="var(--meiao-punho)"/>
      <g fill="var(--meiao-faixas)">${faixas}</g>
      <path d="${MEIAO.pe}" fill="var(--meiao-pe)"/>
      <path d="M0 96H480" stroke="#000" stroke-opacity=".2" stroke-width="5"/>
      <rect width="${w}" height="${h}" fill="url(#${id}-lat)"/>
    </g>
    <path d="${MEIAO.contorno}" fill="none" stroke="#1b1f24" stroke-opacity=".55" stroke-width="5"/>
  </svg>`;
}

// ---------------------------------------------------------------- textos e imagens

function textoSvg({ texto, x, y, t, fonte, alvo, extra = '' }) {
  const f = FONTES[fonte] ?? FONTES.bebas;
  // o Chrome limita o tamanho de fonte (~10000 unidades); por isso o texto é
  // desenhado 100x menor dentro de um grupo ampliado
  const tam = (t * f.escala) / 100;
  return `<g transform="translate(${x} ${y}) scale(100)" data-arrastar="${alvo}"><text x="0" y="0" font-family="'${f.familia}'" font-weight="${f.peso ?? 400}" font-size="${tam}"
    text-anchor="middle" fill="var(--texto)" stroke="var(--texto-contorno)" stroke-width="${tam * 0.07}"
    stroke-linejoin="round" paint-order="stroke" ${extra}>${esc(texto)}</text></g>`;
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
    if (temMeiao) itens.push({ peca: 'meiao', x: temCamisa ? 405 : 445, y: y + 40, w: 100 });
  } else if (temMeiao) {
    itens.push({ peca: 'meiao', x: 200, y: y + 20, w: 100 });
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
          else corpo = meiao(id, estado);
          const espelho = it.peca === 'meiao' && lado === 'verso' ? ` transform="translate(${ox * 2 + it.x * 2 + it.w} 0) scale(-1 1)"` : '';
          return `<g${espelho} data-peca="${it.peca}" data-lado="${lado}">${corpo.replace('<svg ', `<svg x="${ox + it.x}" y="${it.y}" width="${it.w}" height="${h}" `)}</g>`;
        })
        // a camisa vai por cima do calção
        .sort((a, b) => (a.includes('data-peca="camisa"') ? 1 : 0) - (b.includes('data-peca="camisa"') ? 1 : 0))
        .join('');
      const legenda = vista === 'ambos' ? `<text x="${ox + largura / 2}" y="${altura + 6}" text-anchor="middle" class="legenda-lado">${lado === 'frente' ? 'FRENTE' : 'COSTAS'}</text>` : '';
      return pecas + legenda;
    })
    .join('');
  const total = lados.length * largura;
  return { svg: colunas, viewBox: `0 0 ${total} ${altura + (vista === 'ambos' ? 24 : 0)}` };
}
