import { CORES, cor, hex, rotulo } from './cores.js';
import { exigirAcesso, usuarioAtual, sair } from './acesso.js';
import {
  TRONCO, montarPalco, montarPalcoFoto, overlaysPeca, variaveisCor, VB, GOLAS, PUNHOS,
  TIPOS_GOLA, TIPOS_PUNHO, POSICOES_NUMERO_FRENTE, POSICOES_IMAGEM, FONTES,
} from './render.js';

// Número que recebe os pedidos de orçamento (DDI + DDD + número).
const WHATSAPP = '5521990901418';
const CHAVE_RASCUNHO = 'marol-sports:rascunho';
const CHAVE_ARMARIO = 'marol-sports:armario';
const MAX_UPLOAD = 5 * 1024 * 1024;
const CAMADAS_PADRAO = ['branco', 'vermelho-vivo', 'amarelo-canario', 'azul-celeste', 'verde-esmeralda', 'laranja-vivo'];

const PADRAO = {
  versao: 1,
  pecas: 'ambos',
  modeloCamisa: null,
  modeloCalcao: null,
  sincronizarModelo: true,
  cores: {
    sincronizar: true,
    camisa: { base: 'azul-marinho', camadas: [...CAMADAS_PADRAO] },
    calcao: { base: 'azul-marinho', camadas: [...CAMADAS_PADRAO] },
  },
  gola: { tipo: 'careca', cor: 'branco' },
  manga: { cor: 'corpo' },
  punho: { tipo: 'simples', cor: 'branco' },
  meiao: { ativo: true, cor: 'azul-marinho' },
  nome: {
    texto: '', numero: '10', fonte: 'bebas', cor: 'branco', contorno: 'azul-marinho',
    numeroFrente: 'peito-direito', numeroCalcao: true, posicaoNome: 'acima', tamanhoNome: 1,
  },
  textos: [],
  imagens: [],
  deslocamentos: {},
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clonar = (o) => JSON.parse(JSON.stringify(o));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const novoId = () => Math.random().toString(36).slice(2, 9);

// ------------------------------------------------------------------ estado

let catalogo = null; // dados/modelos.json
let fotoMockup = null; // mockup/foto.json
let visual = 'foto'; // 'foto' (mockup fotográfico) ou 'ilustracao'
let estado = clonar(PADRAO);
const historico = [];
const futuro = [];
let ultimoAgrupamento = { chave: null, quando: 0 };

function idCalcao(e = estado) {
  return e.sincronizarModelo ? e.modeloCamisa : e.modeloCalcao;
}

function infoModelo(id) {
  return catalogo.modelos.find((m) => m.id === id);
}

// Aplica uma alteração com suporte a desfazer. `agrupar` junta alterações
// seguidas do mesmo controle (ex.: arrastar um slider) num único passo.
function atualizar(fn, { agrupar = null, painel = false } = {}) {
  const antes = JSON.stringify(estado);
  fn(estado);
  if (JSON.stringify(estado) === antes) return;
  const agora = Date.now();
  if (!(agrupar && ultimoAgrupamento.chave === agrupar && agora - ultimoAgrupamento.quando < 1200)) {
    historico.push(antes);
    if (historico.length > 80) historico.shift();
  }
  ultimoAgrupamento = { chave: agrupar, quando: agora };
  futuro.length = 0;
  depoisDeMudar(painel);
}

function depoisDeMudar(painel) {
  salvarRascunho();
  renderizar();
  if (painel) renderizarPainel();
  atualizarBotoesHistorico();
}

function desfazer() {
  if (!historico.length) return;
  futuro.push(JSON.stringify(estado));
  estado = JSON.parse(historico.pop());
  ultimoAgrupamento = { chave: null, quando: 0 };
  depoisDeMudar(true);
}

function refazer() {
  if (!futuro.length) return;
  historico.push(JSON.stringify(estado));
  estado = JSON.parse(futuro.pop());
  ultimoAgrupamento = { chave: null, quando: 0 };
  depoisDeMudar(true);
}

function atualizarBotoesHistorico() {
  $('#btn-desfazer').disabled = !historico.length;
  $('#btn-refazer').disabled = !futuro.length;
}

// Completa estados antigos/incompletos (link compartilhado, armário) com o padrão.
function normalizar(e) {
  const base = clonar(PADRAO);
  const r = { ...base, ...e };
  for (const k of ['gola', 'manga', 'punho', 'meiao', 'nome']) r[k] = { ...base[k], ...(e?.[k] ?? {}) };
  r.cores = { ...base.cores, ...(e?.cores ?? {}) };
  for (const p of ['camisa', 'calcao']) r.cores[p] = { ...base.cores[p], ...(e?.cores?.[p] ?? {}) };
  r.textos = Array.isArray(e?.textos) ? e.textos : [];
  r.imagens = Array.isArray(e?.imagens) ? e.imagens : [];
  r.deslocamentos = e?.deslocamentos ?? {};
  // simulações salvas antes das golas Careca/V e do meião de uma cor
  if (!GOLAS[r.gola.tipo]) r.gola.tipo = r.gola.tipo === 'v' ? 'v' : 'careca';
  if (e?.meiao?.base && !e.meiao.cor) r.meiao.cor = e.meiao.base;
  delete r.gola.friso;
  for (const k of ['base', 'punho', 'faixas', 'corFaixas', 'pe']) delete r.meiao[k];
  // a manga é montada separada, mas sempre na cor de fundo do uniforme
  r.manga = { cor: 'corpo' };
  if (!infoModelo(r.modeloCamisa)) r.modeloCamisa = modeloInicial();
  if (!r.sincronizarModelo && !infoModelo(r.modeloCalcao)) r.modeloCalcao = r.modeloCamisa;
  return r;
}

function modeloInicial() {
  return (infoModelo(42) ?? catalogo.modelos.find((m) => m.camisa > 1) ?? catalogo.modelos[0]).id;
}

function salvarRascunho() {
  try { localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(estado)); } catch { /* armazenamento cheio ou bloqueado */ }
}

// ------------------------------------------------------------------ modelos

const cacheModelos = new Map();

function carregarModelo(id) {
  if (id == null) return Promise.resolve(null);
  if (!cacheModelos.has(id)) {
    const p = fetch(`dados/modelos/${id}.json?v=${catalogo.versao ?? ''}`).then((r) => {
      if (!r.ok) throw new Error(`Modelo ${id} indisponível`);
      return r.json();
    });
    p.catch(() => cacheModelos.delete(id));
    cacheModelos.set(id, p);
  }
  return cacheModelos.get(id);
}

// ------------------------------------------------------------------ palco

const palcoSvg = $('#palco-svg');
let vista = 'ambos';
let chaveEstrutura = '';
let chaveOverlay = '';
let renderizacao = 0;

// Zoom do palco: 1 = camisa e calção inteiros na tela (o meião pode passar e o
// palco rola). Os níveis multiplicam esse tamanho base.
let zoom = 1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const PARTE_VISIVEL = 0.74; // fração da altura do desenho que cabe na tela no zoom 1

function ajustarPalco(manterCentro = false) {
  const palcoEl = $('#palco');
  const vb = palcoSvg.viewBox.baseVal;
  if (!vb || !vb.width) return;
  const proporcao = vb.width / vb.height;
  const W = palcoEl.clientWidth - 2;
  const H = palcoEl.clientHeight - 2;
  // centro visível antes da mudança, para manter o foco ao dar zoom
  const cx = (palcoEl.scrollLeft + palcoEl.clientWidth / 2) / Math.max(palcoEl.scrollWidth, 1);
  const cy = (palcoEl.scrollTop + palcoEl.clientHeight / 2) / Math.max(palcoEl.scrollHeight, 1);
  const base = Math.min(W / proporcao, H / PARTE_VISIVEL);
  const h = base * zoom;
  palcoSvg.style.height = `${h}px`;
  palcoSvg.style.width = `${h * proporcao}px`;
  if (manterCentro) {
    palcoEl.scrollLeft = cx * palcoEl.scrollWidth - palcoEl.clientWidth / 2;
    palcoEl.scrollTop = cy * palcoEl.scrollHeight - palcoEl.clientHeight / 2;
  }
  $('#zoom-valor').textContent = `${Math.round(zoom * 100)}%`;
}

function mudarZoom(novo) {
  zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(novo * 100) / 100));
  ajustarPalco(true);
}

function estrutura(e) {
  return JSON.stringify({
    vista, visual, pecas: e.pecas, camisa: e.modeloCamisa, calcao: idCalcao(e), meiao: e.meiao.ativo,
    gola: e.gola.tipo, punho: e.punho.tipo,
  });
}

function overlay(e) {
  return JSON.stringify({ n: e.nome, t: e.textos, i: e.imagens.map((i) => [i.id, i.posicao, i.escala]), d: e.deslocamentos });
}

function aplicarCores(el, e) {
  const camisa = infoModelo(e.modeloCamisa)?.camisa ?? 0;
  const calcao = infoModelo(idCalcao(e))?.calcao ?? 0;
  for (const [k, v] of Object.entries(variaveisCor(e, camisa, calcao))) el.style.setProperty(k, v);
}

function palco({ estado: e, modelos, vista: v, prefixo }) {
  return visual === 'foto' && fotoMockup
    ? montarPalcoFoto({ estado: e, modelos, foto: fotoMockup, vista: v, prefixo })
    : montarPalco({ estado: e, modelos, silhuetas: catalogo.silhuetas, vista: v, prefixo });
}

async function renderizar() {
  const minha = ++renderizacao;
  aplicarCores(palcoSvg, estado);
  atualizarTitulo();
  const novaEstrutura = estrutura(estado);
  const novoOverlay = overlay(estado);
  if (novaEstrutura === chaveEstrutura) {
    if (novoOverlay !== chaveOverlay) {
      chaveOverlay = novoOverlay;
      for (const g of $$('[data-ov]', palcoSvg)) {
        const [peca, lado] = g.dataset.ov.split('-');
        g.innerHTML = overlaysPeca(estado, peca, lado, Number(g.dataset.fx ?? 1));
      }
    }
    return;
  }
  const carregando = $('#carregando');
  const timer = setTimeout(() => { carregando.hidden = false; }, 150);
  try {
    const [mCamisa, mCalcao] = await Promise.all([carregarModelo(estado.modeloCamisa), carregarModelo(idCalcao())]);
    if (minha !== renderizacao) return;
    const { svg, viewBox } = palco({ estado, modelos: { camisa: mCamisa, calcao: mCalcao }, vista });
    palcoSvg.setAttribute('viewBox', viewBox);
    palcoSvg.innerHTML = svg;
    ajustarPalco();
    chaveEstrutura = novaEstrutura;
    chaveOverlay = novoOverlay;
  } catch (err) {
    console.error(err);
    avisar('Não foi possível carregar o modelo. Verifique sua conexão.');
  } finally {
    clearTimeout(timer);
    if (minha === renderizacao) carregando.hidden = true;
  }
}

function atualizarTitulo() {
  const c = estado.modeloCamisa;
  const k = idCalcao();
  let t;
  if (estado.pecas === 'camisa') t = `Camisa – modelo ${c}`;
  else if (estado.pecas === 'calcao') t = `Calção – modelo ${k}`;
  else t = c === k ? `Modelo ${c}` : `Camisa ${c} · Calção ${k}`;
  $('#titulo-modelo').textContent = t;
  document.title = `${t} – Simulador Marol Sports`;
}

// Arrastar nomes, números e imagens no palco.
function iniciarArrastar() {
  let ativo = null;
  palcoSvg.addEventListener('pointerdown', (ev) => {
    const alvo = ev.target.closest('[data-arrastar]');
    if (!alvo) return;
    const peca = alvo.closest('svg[viewBox]');
    const ctm = peca.getScreenCTM();
    if (!ctm) return;
    const chave = alvo.dataset.arrastar;
    const [dx, dy] = estado.deslocamentos[chave] ?? [0, 0];
    ativo = { chave, grupo: alvo.parentNode, inv: ctm.inverse(), x0: ev.clientX, y0: ev.clientY, dx, dy, nx: dx, ny: dy };
    palcoSvg.setPointerCapture(ev.pointerId);
    palcoSvg.classList.add('arrastando');
    ev.preventDefault();
  });
  palcoSvg.addEventListener('pointermove', (ev) => {
    if (!ativo) return;
    const a = ativo.inv;
    ativo.nx = ativo.dx + a.a * (ev.clientX - ativo.x0) + a.c * (ev.clientY - ativo.y0);
    ativo.ny = ativo.dy + a.b * (ev.clientX - ativo.x0) + a.d * (ev.clientY - ativo.y0);
    ativo.grupo.setAttribute('transform', `translate(${ativo.nx} ${ativo.ny})`);
  });
  const fim = () => {
    if (!ativo) return;
    const { chave, nx, ny } = ativo;
    ativo = null;
    palcoSvg.classList.remove('arrastando');
    atualizar((e) => { e.deslocamentos[chave] = [Math.round(nx), Math.round(ny)]; });
  };
  palcoSvg.addEventListener('pointerup', fim);
  palcoSvg.addEventListener('pointercancel', fim);
}

// ------------------------------------------------------------------ componentes do painel

let abaAtual = 'modelos';
const alvoAtivo = {};
let alvoModelo = 'camisa';
let filtroModelos = { busca: '', cores: 'todas' };

function blocoCores(aba, alvos) {
  if (!alvos.length) return '';
  const ativo = alvos.find((a) => a.chave === alvoAtivo[aba]) ?? alvos[0];
  alvoAtivo[aba] = ativo.chave;
  const linhas = alvos.map((a) => {
    const v = a.valor();
    const especial = a.especiais?.find((s) => s.valor === v);
    return `<button class="alvo-cor" data-alvo="${a.chave}" aria-pressed="${a === ativo}">
      <span class="amostra ${especial ? 'vazia' : ''}" style="${especial ? '' : `background:${hex(v)}`}"></span>
      <span class="txt"><b>${esc(a.rotulo)}</b><small>${esc(especial ? especial.rotulo : rotulo(v))}</small></span></button>`;
  }).join('');
  const atual = ativo.valor();
  const especiais = (ativo.especiais ?? []).map((s) => `<button class="especial" data-cor="${s.valor}" aria-pressed="${atual === s.valor}">${esc(s.rotulo)}</button>`).join('');
  const cartela = CORES.map((c) => `<button data-cor="${c.id}" title="${esc(rotulo(c.id))}" aria-label="${esc(rotulo(c.id))}" aria-pressed="${atual === c.id}" style="background:${c.hex}"></button>`).join('');
  return `<div class="alvos-cor" data-bloco-cores="${aba}">${linhas}</div>
    <div class="cartela" data-cartela="${aba}">${especiais}${cartela}</div>
    <div class="cartela-nome" data-cartela-nome="${aba}">Selecionado: ${esc(ativo.especiais?.find((s) => s.valor === atual)?.rotulo ?? rotulo(atual))}</div>`;
}

function ligarBlocoCores(aba, alvos) {
  const painel = $('#painel');
  $$(`[data-bloco-cores="${aba}"] [data-alvo]`, painel).forEach((b) => b.addEventListener('click', () => {
    alvoAtivo[aba] = b.dataset.alvo;
    renderizarPainel();
  }));
  $$(`[data-cartela="${aba}"] [data-cor]`, painel).forEach((b) => {
    b.addEventListener('click', () => {
      const alvo = alvos.find((a) => a.chave === alvoAtivo[aba]);
      atualizar((e) => alvo.definir(e, b.dataset.cor), { painel: true });
    });
    b.addEventListener('mouseenter', () => {
      const n = $(`[data-cartela-nome="${aba}"]`, painel);
      const s = alvos.find((a) => a.chave === alvoAtivo[aba])?.especiais?.find((x) => x.valor === b.dataset.cor);
      n.textContent = s ? s.rotulo : rotulo(b.dataset.cor);
    });
  });
}

function segmentado(nome, opcoes, atual, largo = true) {
  return `<div class="segmentado ${largo ? 'largo' : ''}" data-seg="${nome}">${Object.entries(opcoes)
    .map(([v, r]) => `<button data-valor="${v}" aria-pressed="${String(atual) === String(v)}">${esc(r)}</button>`).join('')}</div>`;
}

function ligarSegmentado(nome, fn) {
  $$(`[data-seg="${nome}"] button`, $('#painel')).forEach((b) => b.addEventListener('click', () => {
    atualizar((e) => fn(e, b.dataset.valor), { painel: true });
  }));
}

function interruptor(id, rotuloTxt, marcado) {
  return `<label class="interruptor"><span>${esc(rotuloTxt)}</span><input type="checkbox" id="${id}" ${marcado ? 'checked' : ''}></label>`;
}

function ligarInterruptor(id, fn) {
  $(`#${id}`)?.addEventListener('change', (ev) => atualizar((e) => fn(e, ev.target.checked), { painel: true }));
}

// Mini ilustração da parte superior da camisa para os cartões de opção.
function iconeCamisa(conteudo) {
  return `<svg viewBox="-4000 -12000 233000 150000" aria-hidden="true"><path d="${catalogo.silhuetas.camisa}" fill="#e3e9ee" stroke="#5b6b77" stroke-width="2200"/>${conteudo}</svg>`;
}

// ------------------------------------------------------------------ abas

const ABAS = {
  modelos: {
    html() {
      const sinc = estado.sincronizarModelo;
      return `<h2>Modelos</h2><p class="sub">Escolha as peças e o desenho do uniforme. São ${catalogo.modelos.length} modelos exclusivos.</p>
        <h3>Peças</h3>
        <div class="grupo">
          ${segmentado('pecas', { ambos: 'Camisa e calção', camisa: 'Só camisa', calcao: 'Só calção' }, estado.pecas)}
          ${interruptor('chk-meiao', 'Incluir meião', estado.meiao.ativo)}
          ${estado.pecas === 'ambos' ? interruptor('chk-sinc-modelo', 'Mesmo modelo na camisa e no calção', sinc) : ''}
        </div>
        ${!sinc && estado.pecas === 'ambos' ? `<h3>Escolhendo o modelo da</h3><div class="segmentado largo" id="seg-alvo-modelo">
          <button data-valor="camisa" aria-pressed="${alvoModelo === 'camisa'}">Camisa · ${estado.modeloCamisa}</button>
          <button data-valor="calcao" aria-pressed="${alvoModelo === 'calcao'}">Calção · ${idCalcao()}</button></div>` : ''}
        <h3>Catálogo</h3>
        <div class="filtros">
          <input type="search" id="busca-modelo" placeholder="Buscar pelo número do modelo" inputmode="numeric" value="${esc(filtroModelos.busca)}">
          <div class="linha"><span class="rotulo">Cores</span>${segmentado('filtro-cores', { todas: 'Todas', '1c': '1', '2c': '2', '3c': '3', '4+': '4+' }, filtroModelos.cores)}</div>
        </div>
        <div class="grade-modelos" id="grade-modelos"></div>`;
    },
    ligar() {
      ligarSegmentado('pecas', (e, v) => { e.pecas = v; });
      ligarInterruptor('chk-meiao', (e, v) => { e.meiao.ativo = v; });
      ligarInterruptor('chk-sinc-modelo', (e, v) => {
        e.sincronizarModelo = v;
        if (!v) e.modeloCalcao = e.modeloCamisa;
        alvoModelo = 'camisa';
      });
      $$('#seg-alvo-modelo button').forEach((b) => b.addEventListener('click', () => { alvoModelo = b.dataset.valor; renderizarPainel(); }));
      $$('[data-seg="filtro-cores"] button').forEach((b) => b.addEventListener('click', () => {
        filtroModelos.cores = b.dataset.valor;
        $$('[data-seg="filtro-cores"] button').forEach((x) => x.setAttribute('aria-pressed', x === b));
        desenharGradeModelos();
      }));
      $('#busca-modelo').addEventListener('input', (ev) => { filtroModelos.busca = ev.target.value.trim(); desenharGradeModelos(); });
      desenharGradeModelos();
    },
  },

  cores: {
    alvos() {
      const camisa = infoModelo(estado.modeloCamisa);
      const calcao = infoModelo(idCalcao());
      const alvos = [];
      const temCamisa = estado.pecas !== 'calcao';
      const temCalcao = estado.pecas !== 'camisa';
      const sinc = estado.cores.sincronizar && temCamisa && temCalcao;
      const grupo = (peca, nomePeca, n) => {
        alvos.push({ chave: `${peca}-base`, rotulo: `${nomePeca} – cor base`, valor: () => estado.cores[peca].base, definir: (e, v) => { e.cores[peca].base = v; } });
        for (let i = 0; i < n; i++)
          alvos.push({
            chave: `${peca}-${i}`, rotulo: `${nomePeca} – cor ${i + 2}`,
            valor: () => estado.cores[peca].camadas[i] ?? CAMADAS_PADRAO[i],
            definir: (e, v) => { e.cores[peca].camadas[i] = v; },
          });
      };
      if (temCamisa) grupo('camisa', sinc ? 'Uniforme' : 'Camisa', Math.max(camisa?.camisa ?? 0, sinc ? calcao?.calcao ?? 0 : 0));
      if (temCalcao && !sinc) grupo(estado.cores.sincronizar && !temCamisa ? 'camisa' : 'calcao', 'Calção', calcao?.calcao ?? 0);
      return alvos;
    },
    html() {
      const ambos = estado.pecas === 'ambos';
      return `<h2>Cores</h2><p class="sub">Toque em uma parte do uniforme e escolha a cor na cartela. As cores seguem a referência Pantone usada na produção.</p>
        ${ambos ? `<div class="grupo">${interruptor('chk-sinc-cores', 'Mesmas cores na camisa e no calção', estado.cores.sincronizar)}</div><h3>Partes</h3>` : '<h3>Partes</h3>'}
        ${blocoCores('cores', this.alvos())}`;
    },
    ligar() {
      ligarInterruptor('chk-sinc-cores', (e, v) => {
        e.cores.sincronizar = v;
        if (!v) e.cores.calcao = clonar(e.cores.camisa);
      });
      ligarBlocoCores('cores', this.alvos());
    },
  },

  acabamentos: {
    alvos() {
      const a = [
        { chave: 'gola', rotulo: 'Gola', valor: () => estado.gola.cor, definir: (e, v) => { e.gola.cor = v; } },
      ];
      if (estado.punho.tipo !== 'sem') a.push({ chave: 'punho', rotulo: 'Punho', valor: () => estado.punho.cor, definir: (e, v) => { e.punho.cor = v; } });
      return a;
    },
    html() {
      if (estado.pecas === 'calcao') return '<h2>Gola e punho</h2><p class="sub">Inclua a camisa em “Modelos” para escolher a gola e o punho.</p>';
      const golas = Object.entries(GOLAS).map(([k, g]) => `<button class="opcao" data-gola="${k}" aria-pressed="${estado.gola.tipo === k}">
        ${iconeCamisa(`<path d="${g.abertura}" fill="#8796a1"/><path d="${g.frente}" fill="#1d4251"/>`)}${esc(g.nome)}</button>`).join('');
      const punhos = Object.entries(TIPOS_PUNHO).map(([k, n]) => `<button class="opcao" data-punho="${k}" aria-pressed="${estado.punho.tipo === k}">
        ${iconeCamisa(k === 'simples' ? `<clipPath id="ic-p"><path d="${catalogo.silhuetas.camisa}"/></clipPath><path clip-path="url(#ic-p)" d="${PUNHOS}" fill="#ef6a28"/>` : '')}${esc(n)}</button>`).join('');
      return `<h2>Gola e punho</h2><p class="sub">Escolha a gola, o punho e as cores dos acabamentos. As mangas acompanham a cor de fundo do uniforme.</p>
        <h3>Gola</h3><div class="opcoes">${golas}</div>
        <h3>Punho</h3><div class="opcoes">${punhos}</div>
        <h3>Cores dos acabamentos</h3>${blocoCores('acabamentos', this.alvos())}`;
    },
    ligar() {
      if (estado.pecas === 'calcao') return;
      $$('[data-gola]').forEach((b) => b.addEventListener('click', () => atualizar((e) => { e.gola.tipo = b.dataset.gola; }, { painel: true })));
      $$('[data-punho]').forEach((b) => b.addEventListener('click', () => atualizar((e) => { e.punho.tipo = b.dataset.punho; }, { painel: true })));
      ligarBlocoCores('acabamentos', this.alvos());
    },
  },

  meiao: {
    alvos() {
      return [{ chave: 'cor', rotulo: 'Cor do meião', valor: () => estado.meiao.cor, definir: (e, v) => { e.meiao.cor = v; } }];
    },
    html() {
      return `<h2>Meião</h2><p class="sub">Combine o meião com o restante do uniforme.</p>
        <div class="grupo">${interruptor('chk-meiao-aba', 'Incluir meião', estado.meiao.ativo)}</div>
        ${estado.meiao.ativo ? `<h3>Cor</h3>${blocoCores('meiao', this.alvos())}` : ''}`;
    },
    ligar() {
      ligarInterruptor('chk-meiao-aba', (e, v) => { e.meiao.ativo = v; });
      ligarBlocoCores('meiao', this.alvos());
    },
  },

  nome: {
    alvos() {
      return [
        { chave: 'cor', rotulo: 'Cor do nome e número', valor: () => estado.nome.cor, definir: (e, v) => { e.nome.cor = v; } },
        { chave: 'contorno', rotulo: 'Contorno', valor: () => estado.nome.contorno, definir: (e, v) => { e.nome.contorno = v; }, especiais: [{ valor: 'nenhum', rotulo: 'Sem contorno' }] },
      ];
    },
    html() {
      const n = estado.nome;
      const fontes = Object.entries(FONTES).map(([k, f]) => `<button class="opcao" data-fonte="${k}" aria-pressed="${n.fonte === k}">
        <span class="amostra-fonte" style="font-family:'${f.familia}';font-weight:${f.peso ?? 400}">10</span>${esc(f.nome)}</button>`).join('');
      const posFrente = Object.fromEntries(Object.entries(POSICOES_NUMERO_FRENTE).map(([k, p]) => [k, p.nome]));
      const textos = estado.textos.map((t) => `<div class="item-texto" data-texto="${t.id}">
          <div class="linha"><input type="text" data-campo="texto" value="${esc(t.texto)}" maxlength="30" placeholder="Digite o texto"><button class="btn-link btn-perigo" data-remover-texto>Remover</button></div>
          <div class="grade-2">
            <div class="campo"><label>Peça</label><select data-campo="peca"><option value="camisa" ${t.peca === 'camisa' ? 'selected' : ''}>Camisa</option><option value="calcao" ${t.peca === 'calcao' ? 'selected' : ''}>Calção</option></select></div>
            <div class="campo"><label>Lado</label><select data-campo="lado"><option value="frente" ${t.lado === 'frente' ? 'selected' : ''}>Frente</option><option value="verso" ${t.lado === 'verso' ? 'selected' : ''}>Costas</option></select></div>
          </div>
          <div class="segmentado largo" data-alinhamento>${['esquerda', 'centro', 'direita'].map((a) => `<button data-valor="${a}" aria-pressed="${t.alinhamento === a}">${a[0].toUpperCase() + a.slice(1)}</button>`).join('')}</div>
          <div class="campo"><label>Altura</label><input type="range" data-campo="altura" min="0.06" max="0.95" step="0.01" value="${t.altura}"></div>
          <div class="campo"><label>Tamanho</label><input type="range" data-campo="tamanho" min="6" max="60" step="1" value="${t.tamanho}"></div>
        </div>`).join('');
      return `<h2>Nome e número</h2><p class="sub">Personalize as costas, a frente e o calção. Você pode arrastar os textos no uniforme.</p>
        <div class="grade-2">
          <div class="campo"><label for="inp-nome">Nome</label><input type="text" id="inp-nome" maxlength="14" placeholder="Seu nome" value="${esc(n.texto)}"></div>
          <div class="campo"><label for="inp-numero">Número</label><input type="text" id="inp-numero" maxlength="2" inputmode="numeric" placeholder="10" value="${esc(n.numero)}"></div>
        </div>
        <h3>Fonte</h3><div class="opcoes">${fontes}</div>
        <h3>Posição do nome</h3>${segmentado('pos-nome', { acima: 'Acima do número', abaixo: 'Abaixo do número' }, n.posicaoNome)}
        <div class="campo" style="margin-top:12px"><label for="rng-nome">Tamanho do nome</label><input type="range" id="rng-nome" min="0.6" max="1.4" step="0.05" value="${n.tamanhoNome}"></div>
        <h3>Número na frente e no calção</h3>
        <div class="grupo">${segmentado('num-frente', posFrente, n.numeroFrente)}${estado.pecas !== 'camisa' ? interruptor('chk-num-calcao', 'Número no calção', n.numeroCalcao) : ''}</div>
        <h3>Cores</h3>${blocoCores('nome', this.alvos())}
        <h3>Textos extras</h3>
        <button class="btn-secundario" id="btn-add-texto"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>Adicionar texto</button>
        ${textos}`;
    },
    ligar() {
      $('#inp-nome').addEventListener('input', (ev) => atualizar((e) => { e.nome.texto = ev.target.value.toUpperCase(); }, { agrupar: 'nome' }));
      $('#inp-numero').addEventListener('input', (ev) => {
        ev.target.value = ev.target.value.replace(/\D/g, '');
        atualizar((e) => { e.nome.numero = ev.target.value; }, { agrupar: 'numero' });
      });
      $$('[data-fonte]').forEach((b) => b.addEventListener('click', () => atualizar((e) => { e.nome.fonte = b.dataset.fonte; }, { painel: true })));
      ligarSegmentado('pos-nome', (e, v) => { e.nome.posicaoNome = v; });
      ligarSegmentado('num-frente', (e, v) => { e.nome.numeroFrente = v; });
      ligarInterruptor('chk-num-calcao', (e, v) => { e.nome.numeroCalcao = v; });
      $('#rng-nome').addEventListener('input', (ev) => atualizar((e) => { e.nome.tamanhoNome = Number(ev.target.value); }, { agrupar: 'tam-nome' }));
      ligarBlocoCores('nome', this.alvos());
      $('#btn-add-texto').addEventListener('click', () => atualizar((e) => {
        e.textos.push({ id: novoId(), texto: 'TEXTO', peca: e.pecas === 'calcao' ? 'calcao' : 'camisa', lado: 'verso', alinhamento: 'centro', altura: 0.88, tamanho: 18 });
      }, { painel: true }));
      $$('[data-texto]').forEach((item) => {
        const id = item.dataset.texto;
        const mudar = (fn, opts) => atualizar((e) => { const t = e.textos.find((x) => x.id === id); if (t) fn(t); }, opts);
        $$('[data-campo]', item).forEach((inp) => {
          const campo = inp.dataset.campo;
          inp.addEventListener(inp.tagName === 'SELECT' ? 'change' : 'input', () => {
            const v = inp.type === 'range' ? Number(inp.value) : inp.value;
            mudar((t) => { t[campo] = campo === 'texto' ? v.toUpperCase() : v; }, { agrupar: `${id}-${campo}`, painel: inp.tagName === 'SELECT' });
          });
        });
        $$('[data-alinhamento] button', item).forEach((b) => b.addEventListener('click', () => mudar((t) => { t.alinhamento = b.dataset.valor; }, { painel: true })));
        $('[data-remover-texto]', item).addEventListener('click', () => atualizar((e) => {
          e.textos = e.textos.filter((x) => x.id !== id);
          delete e.deslocamentos[`texto-${id}`];
        }, { painel: true }));
      });
    },
  },

  imagens: {
    html() {
      const pos = (img) => Object.entries(POSICOES_IMAGEM)
        .filter(([, p]) => (p.peca === 'camisa' ? estado.pecas !== 'calcao' : estado.pecas !== 'camisa') || img.posicao === undefined)
        .map(([k, p]) => `<option value="${k}" ${img.posicao === k ? 'selected' : ''}>${esc(p.nome)}</option>`).join('');
      const itens = estado.imagens.map((img) => `<div class="item-imagem" data-imagem="${img.id}">
          <div class="topo-item"><img src="${img.src}" alt=""><div class="campo" style="flex:1;margin:0"><label>Posição</label><select data-campo="posicao">${pos(img)}</select></div></div>
          <div class="campo"><label>Tamanho</label><input type="range" data-campo="escala" min="0.4" max="2.6" step="0.05" value="${img.escala}"></div>
          <div class="linha" style="justify-content:space-between"><button class="btn-link" data-centralizar>Voltar à posição original</button><button class="btn-link btn-perigo" data-remover>Remover</button></div>
        </div>`).join('');
      return `<h2>Escudo e patrocínio</h2><p class="sub">Envie o escudo do time e as marcas dos patrocinadores. Depois escolha a posição e arraste no uniforme para o ajuste fino.</p>
        <label class="upload" id="area-upload"><input type="file" id="inp-imagem" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple hidden>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/></svg>
          <span><b>Escolher arquivo</b> ou arrastar para cá</span><small>PNG, JPG, WEBP ou SVG · até 5 MB · prefira fundo transparente</small></label>
        ${itens || '<p class="vazio">Nenhuma imagem adicionada.</p>'}`;
    },
    ligar() {
      const area = $('#area-upload');
      $('#inp-imagem').addEventListener('change', (ev) => { adicionarImagens(ev.target.files); ev.target.value = ''; });
      area.addEventListener('dragover', (ev) => { ev.preventDefault(); area.classList.add('arrastando'); });
      area.addEventListener('dragleave', () => area.classList.remove('arrastando'));
      area.addEventListener('drop', (ev) => { ev.preventDefault(); area.classList.remove('arrastando'); adicionarImagens(ev.dataTransfer.files); });
      $$('[data-imagem]').forEach((item) => {
        const id = item.dataset.imagem;
        const mudar = (fn, opts) => atualizar((e) => { const i = e.imagens.find((x) => x.id === id); if (i) fn(i, e); }, opts);
        $('[data-campo="posicao"]', item).addEventListener('change', (ev) => mudar((i, e) => { i.posicao = ev.target.value; delete e.deslocamentos[`img-${id}`]; }));
        $('[data-campo="escala"]', item).addEventListener('input', (ev) => mudar((i) => { i.escala = Number(ev.target.value); }, { agrupar: `esc-${id}` }));
        $('[data-centralizar]', item).addEventListener('click', () => mudar((i, e) => { delete e.deslocamentos[`img-${id}`]; }));
        $('[data-remover]', item).addEventListener('click', () => atualizar((e) => {
          e.imagens = e.imagens.filter((x) => x.id !== id);
          delete e.deslocamentos[`img-${id}`];
        }, { painel: true }));
      });
    },
  },
};

function desenharGradeModelos() {
  const grade = $('#grade-modelos');
  if (!grade) return;
  const escolhendoCalcao = (!estado.sincronizarModelo && estado.pecas === 'ambos' && alvoModelo === 'calcao') || estado.pecas === 'calcao';
  const selecionado = escolhendoCalcao ? idCalcao() : estado.modeloCamisa;
  const { busca, cores } = filtroModelos;
  const lista = catalogo.modelos.filter((m) => {
    const n = escolhendoCalcao ? m.calcao : m.camisa;
    if (estado.pecas === 'camisa' && !m.camisa) return false;
    if (escolhendoCalcao && !m.calcao) return false;
    if (busca && !String(m.id).includes(busca)) return false;
    if (cores === 'todas') return true;
    return cores === '4+' ? n + 1 >= 4 : n + 1 === parseInt(cores, 10);
  });
  grade.innerHTML = lista.length
    ? lista.map((m) => {
      const n = (escolhendoCalcao ? m.calcao : m.camisa) + 1;
      return `<button class="cartao-modelo" data-modelo="${m.id}" aria-pressed="${m.id === selecionado}" title="Modelo ${m.id}">
        <img src="dados/miniaturas/${escolhendoCalcao ? 'calcao-' : ''}${m.id}.webp?v=${catalogo.versao ?? ''}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        Modelo ${m.id}<small>${n} ${n === 1 ? 'cor' : 'cores'}</small></button>`;
    }).join('')
    : '<p class="vazio" style="grid-column:1/-1">Nenhum modelo encontrado.</p>';
  $$('[data-modelo]', grade).forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.dataset.modelo);
    atualizar((e) => {
      if (escolhendoCalcao && !e.sincronizarModelo) e.modeloCalcao = id;
      else if (escolhendoCalcao) { e.modeloCamisa = id; }
      else e.modeloCamisa = id;
    });
    $$('[data-modelo]', grade).forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (!estado.sincronizarModelo && estado.pecas === 'ambos') renderizarPainel();
  }));
}

function renderizarPainel() {
  const painel = $('#painel');
  const rolagem = painel.scrollTop;
  const aba = ABAS[abaAtual];
  painel.innerHTML = aba.html();
  aba.ligar();
  painel.scrollTop = rolagem;
}

function trocarAba(nome) {
  abaAtual = nome;
  $$('.abas [data-aba]').forEach((b) => b.setAttribute('aria-selected', b.dataset.aba === nome));
  renderizarPainel();
  $('#painel').scrollTop = 0;
}

// ------------------------------------------------------------------ imagens enviadas

function lerArquivo(arquivo) {
  return new Promise((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.onerror = erro;
    r.readAsDataURL(arquivo);
  });
}

// Reduz imagens grandes para no máximo 800 px (mantém transparência).
async function prepararImagem(arquivo) {
  const url = await lerArquivo(arquivo);
  if (arquivo.type === 'image/svg+xml') return url;
  const img = new Image();
  img.src = url;
  await img.decode();
  const max = 800;
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

async function adicionarImagens(arquivos) {
  const ordem = ['escudo-esquerdo', 'patrocinio-frente', 'patrocinio-costas-baixo', 'manga-direita', 'manga-esquerda', 'calcao-frente'];
  for (const arq of arquivos) {
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(arq.type)) { avisar(`"${arq.name}" não é uma imagem aceita.`); continue; }
    if (arq.size > MAX_UPLOAD) { avisar(`"${arq.name}" passa de 5 MB.`); continue; }
    try {
      const src = await prepararImagem(arq);
      atualizar((e) => {
        const usadas = new Set(e.imagens.map((i) => i.posicao));
        const posicao = ordem.find((p) => !usadas.has(p) && (POSICOES_IMAGEM[p].peca === 'camisa' ? e.pecas !== 'calcao' : e.pecas !== 'camisa')) ?? 'patrocinio-frente';
        e.imagens.push({ id: novoId(), src, posicao, escala: 1 });
      }, { painel: true });
    } catch {
      avisar(`Não foi possível abrir "${arq.name}".`);
    }
  }
}

// ------------------------------------------------------------------ exportação

let fontesEmbutidas = null;

async function base64(url) {
  const blob = await (await fetch(url)).blob();
  return new Promise((ok) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.readAsDataURL(blob);
  });
}

async function cssFontes() {
  if (!fontesEmbutidas) {
    const partes = await Promise.all([
      ['Inter', 'inter.woff2', '100 900'],
      ...Object.values(FONTES).map((f) => [f.familia, f.arquivo, f.peso ?? 400]),
    ].map(async ([familia, arquivo, peso]) => `@font-face{font-family:'${familia}';font-weight:${peso};src:url(${await base64(`fontes/${arquivo}`)}) format('woff2')}`));
    fontesEmbutidas = partes.join('');
  }
  return fontesEmbutidas;
}

let logoEmbutido = null;
const imagensMockup = {};

// Gera um PNG com o uniforme, o logo e a lista de cores.
async function gerarImagem({ largura = 1800, tipo = 'image/png', comLegenda = true, e = estado } = {}) {
  const [mCamisa, mCalcao] = await Promise.all([carregarModelo(e.modeloCamisa), carregarModelo(idCalcao(e))]);
  let { svg, viewBox } = palco({ estado: e, modelos: { camisa: mCamisa, calcao: mCalcao }, vista: 'ambos', prefixo: 'x' });
  // imagens do mockup em foto precisam ir embutidas para a exportação
  for (const arq of new Set(svg.match(/mockup\/[\w-]+\.webp(?:\?v=\w+)?/g) ?? [])) {
    imagensMockup[arq] ??= await base64(arq);
    svg = svg.replaceAll(`"${arq}"`, `"${imagensMockup[arq]}"`);
  }
  const [, , vw, vh] = viewBox.split(' ').map(Number);
  const topo = comLegenda ? 90 : 0;
  const linhas = comLegenda ? resumo(e).slice(0, 6) : [];
  const rodape = comLegenda ? 30 + linhas.length * 20 : 0;
  const W = vw + 80;
  const H = vh + topo + rodape + 40;
  logoEmbutido ??= await base64('logo_branca.webp');
  const vars = Object.entries(variaveisCor(e, infoModelo(e.modeloCamisa)?.camisa, infoModelo(idCalcao(e))?.calcao)).map(([k, v]) => `${k}:${v}`).join(';');
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <style>${await cssFontes()} svg{${vars}} [data-peca]{filter:drop-shadow(0 6px 10px rgba(10,20,30,.28))}
      .legenda-lado{font:700 12px Inter,sans-serif;letter-spacing:.14em;fill:#24323c;opacity:.65} .info{font:500 13px Inter,sans-serif;fill:#24323c}</style>
    <defs><radialGradient id="fundo" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#c9d1d8"/><stop offset=".7" stop-color="#a9b4bd"/><stop offset="1" stop-color="#9aa6b0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#fundo)"/>
    ${comLegenda ? `<rect width="${W}" height="70" fill="#1d4251"/><image href="${logoEmbutido}" x="28" y="10" width="74" height="50"/>
      <text x="${W - 28}" y="32" text-anchor="end" style="font:700 18px Inter,sans-serif;fill:#fff">${esc($('#titulo-modelo').textContent)}</text>
      <text x="${W - 28}" y="52" text-anchor="end" style="font:500 12px Inter,sans-serif;fill:#fff;opacity:.75">Simulação gerada em ${new Date().toLocaleDateString('pt-BR')} · marolsports.com</text>` : ''}
    <svg x="40" y="${topo}" width="${vw}" height="${vh}" viewBox="${viewBox}" overflow="visible">${svg}</svg>
    ${linhas.map((l, i) => `<text class="info" x="40" y="${topo + vh + 40 + i * 20}">${esc(l)}</text>`).join('')}
  </svg>`;
  const url = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = largura / W;
    const c = document.createElement('canvas');
    c.width = Math.round(W * k);
    c.height = Math.round(H * k);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((ok) => c.toBlob(ok, tipo, 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function baixarImagem() {
  avisar('Gerando imagem…');
  try {
    const blob = await gerarImagem();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `marol-sports-${$('#titulo-modelo').textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    avisar('Imagem baixada.');
  } catch (err) {
    console.error(err);
    avisar('Não foi possível gerar a imagem.');
  }
}

// ------------------------------------------------------------------ resumo, link e orçamento

function resumo(e = estado) {
  const linhas = [];
  const temCamisa = e.pecas !== 'calcao';
  const temCalcao = e.pecas !== 'camisa';
  const cores = (p, n) => [`base ${rotulo(e.cores[p].base)}`, ...Array.from({ length: n }, (_, i) => `cor ${i + 2} ${rotulo(e.cores[p].camadas[i] ?? CAMADAS_PADRAO[i])}`)].join('; ');
  const nCamisa = infoModelo(e.modeloCamisa)?.camisa ?? 0;
  const nCalcao = infoModelo(idCalcao(e))?.calcao ?? 0;
  const sinc = e.cores.sincronizar && temCamisa && temCalcao;
  if (temCamisa) linhas.push(`Camisa (modelo ${e.modeloCamisa}): ${cores('camisa', sinc ? Math.max(nCamisa, nCalcao) : nCamisa)}`);
  if (temCalcao) linhas.push(`Calção (modelo ${idCalcao(e)}): ${sinc ? 'mesmas cores da camisa' : cores(e.cores.sincronizar && !temCamisa ? 'camisa' : 'calcao', nCalcao)}`);
  if (temCamisa) {
    linhas.push(`Gola ${TIPOS_GOLA[e.gola.tipo]} ${rotulo(e.gola.cor)} · ${TIPOS_PUNHO[e.punho.tipo]}${e.punho.tipo !== 'sem' ? ` ${rotulo(e.punho.cor)}` : ''}`);
  }
  if (e.meiao.ativo) linhas.push(`Meião: ${rotulo(e.meiao.cor)}`);
  const n = e.nome;
  if (n.texto || n.numero) linhas.push(`Nome "${n.texto || '—'}" · Número ${n.numero || '—'} · Fonte ${FONTES[n.fonte].nome} · ${rotulo(n.cor)}${n.contorno !== 'nenhum' ? ` com contorno ${rotulo(n.contorno)}` : ''} · Frente: ${POSICOES_NUMERO_FRENTE[n.numeroFrente].nome}${temCalcao ? ` · No calção: ${n.numeroCalcao ? 'sim' : 'não'}` : ''}`);
  if (e.textos.length) linhas.push(`Textos extras: ${e.textos.map((t) => `"${t.texto}" (${t.peca === 'camisa' ? 'camisa' : 'calção'}, ${t.lado === 'frente' ? 'frente' : 'costas'})`).join(', ')}`);
  if (e.imagens.length) linhas.push(`Imagens: ${e.imagens.map((i) => POSICOES_IMAGEM[i.posicao]?.nome).join(', ')}`);
  return linhas;
}

function codificar(e) {
  const semImagens = { ...e, imagens: [] };
  const bytes = new TextEncoder().encode(JSON.stringify(semImagens));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodificar(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
}

function linkSimulacao() {
  return `${location.origin}${location.pathname}#s=${codificar(estado)}`;
}

const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

function abrirOrcamento() {
  const d = $('#dialogo');
  // dados do cadastro preenchem o orçamento
  const u = usuarioAtual() ?? {};
  const salvo = { nome: u.nome, telefone: u.whatsapp, cidade: u.cidade, ...JSON.parse(localStorage.getItem('marol-sports:contato') || '{}') };
  d.innerHTML = `<form method="dialog" id="form-orcamento" novalidate>
    <h2>Pedir orçamento</h2>
    <p class="sub">Preencha seus dados e as quantidades. Vamos abrir o WhatsApp da Marol Sports com o resumo da sua simulação, e a imagem do uniforme será baixada para você anexar na conversa.</p>
    <div class="campo"><label for="orc-nome">Nome completo *</label><input type="text" id="orc-nome" required value="${esc(salvo.nome)}" autocomplete="name"></div>
    <div class="grade-2">
      <div class="campo"><label for="orc-tel">Telefone / WhatsApp *</label><input type="tel" id="orc-tel" required placeholder="(21) 99999-9999" value="${esc(salvo.telefone)}" autocomplete="tel"></div>
      <div class="campo"><label for="orc-cidade">Cidade *</label><input type="text" id="orc-cidade" required value="${esc(salvo.cidade)}" autocomplete="address-level2"></div>
    </div>
    <div class="campo"><span class="rotulo">Quantidade por tamanho</span><div class="tamanhos">${TAMANHOS.map((t) => `<label>${t}<input type="number" min="0" max="999" inputmode="numeric" data-tamanho="${t}" placeholder="0"></label>`).join('')}</div></div>
    <div class="campo"><label for="orc-obs">Observações</label><textarea id="orc-obs" rows="3" placeholder="Prazo, uniforme de goleiro, tamanhos infantis..."></textarea></div>
    <p class="sub" id="orc-erro" style="color:#b42318;margin:0" hidden></p>
    <div class="rodape"><button type="button" class="btn-secundario" data-fechar>Cancelar</button><button type="submit" class="btn-primario">Enviar pelo WhatsApp</button></div>
  </form>`;
  const tel = $('#orc-tel', d);
  tel.addEventListener('input', () => {
    const v = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = v.length > 6 ? `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}` : v.length > 2 ? `(${v.slice(0, 2)}) ${v.slice(2)}` : v;
  });
  $('[data-fechar]', d).addEventListener('click', () => d.close());
  $('#form-orcamento', d).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const nome = $('#orc-nome', d).value.trim();
    const telefone = tel.value.trim();
    const cidade = $('#orc-cidade', d).value.trim();
    const erro = $('#orc-erro', d);
    if (!nome || telefone.replace(/\D/g, '').length < 10 || !cidade) {
      erro.textContent = 'Preencha nome, telefone com DDD e cidade.';
      erro.hidden = false;
      return;
    }
    try { localStorage.setItem('marol-sports:contato', JSON.stringify({ nome, telefone, cidade })); } catch { /* sem armazenamento */ }
    const qtd = $$('[data-tamanho]', d).map((i) => [i.dataset.tamanho, Number(i.value) || 0]).filter(([, n]) => n > 0);
    const total = qtd.reduce((s, [, n]) => s + n, 0);
    const obs = $('#orc-obs', d).value.trim();
    const msg = [
      '*Pedido de orçamento – Simulador Marol Sports*',
      `Nome: ${nome}`, `Telefone: ${telefone}`, `Cidade: ${cidade}`,
      ...(usuarioAtual()?.email ? [`E-mail: ${usuarioAtual().email}`] : []), ...(usuarioAtual()?.time ? [`Time: ${usuarioAtual().time}`] : []), '',
      '*Uniforme*', ...resumo().map((l) => `• ${l}`), '',
      qtd.length ? `*Quantidades:* ${qtd.map(([t, n]) => `${t}: ${n}`).join(' · ')} (total ${total})` : '*Quantidades:* a definir',
      obs ? `*Observações:* ${obs}` : '',
      '', `Simulação: ${linkSimulacao()}`,
      'A imagem do uniforme segue em anexo.',
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
    // a janela precisa abrir dentro do clique para não ser bloqueada
    const janela = window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    d.close();
    await baixarImagem();
    if (!janela) avisar('Permita pop-ups para abrir o WhatsApp.');
  });
  d.showModal();
}

// ------------------------------------------------------------------ armário (simulações salvas)

function lerArmario() {
  try { return JSON.parse(localStorage.getItem(CHAVE_ARMARIO) || '[]'); } catch { return []; }
}

async function salvarNoArmario() {
  const d = $('#dialogo');
  d.innerHTML = `<form method="dialog" id="form-salvar"><h2>Salvar no armário</h2>
    <p class="sub">A simulação fica guardada neste navegador para você continuar depois.</p>
    <div class="campo"><label for="nome-sim">Nome da simulação</label><input type="text" id="nome-sim" maxlength="40" required value="${esc($('#titulo-modelo').textContent)}"></div>
    <div class="rodape"><button type="button" class="btn-secundario" data-fechar>Cancelar</button><button class="btn-primario" type="submit">Salvar</button></div></form>`;
  $('[data-fechar]', d).addEventListener('click', () => d.close());
  $('#form-salvar', d).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const nome = $('#nome-sim', d).value.trim() || 'Simulação';
    d.close();
    try {
      const blob = await gerarImagem({ largura: 360, tipo: 'image/jpeg', comLegenda: false });
      const miniatura = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
      const lista = lerArmario();
      lista.unshift({ id: novoId(), nome, data: Date.now(), estado: clonar(estado), miniatura });
      localStorage.setItem(CHAVE_ARMARIO, JSON.stringify(lista));
      avisar('Simulação salva no armário.');
    } catch (err) {
      console.error(err);
      avisar('Não há espaço no navegador. Remova simulações antigas ou imagens grandes.');
    }
  });
  d.showModal();
  $('#nome-sim', d).select();
}

function abrirArmario() {
  const d = $('#dialogo');
  const desenhar = () => {
    const lista = lerArmario();
    d.innerHTML = `<div class="corpo"><h2>Armário</h2><p class="sub">Simulações salvas neste navegador.</p>
      ${lista.length ? `<div class="lista-armario">${lista.map((s) => `<div class="item-armario" data-id="${s.id}">
        <img src="${s.miniatura}" alt=""><div class="info"><b title="${esc(s.nome)}">${esc(s.nome)}</b><small>${new Date(s.data).toLocaleString('pt-BR')}</small></div>
        <div class="botoes"><button data-abrir>Abrir</button><button data-excluir class="btn-perigo">Excluir</button></div></div>`).join('')}</div>`
        : '<p class="vazio">Você ainda não salvou nenhuma simulação.</p>'}
      <div class="rodape"><button type="button" class="btn-secundario" id="btn-copiar-link">Copiar link da simulação atual</button><button type="button" class="btn-primario" data-fechar>Fechar</button></div></div>`;
    $('[data-fechar]', d).addEventListener('click', () => d.close());
    $('#btn-copiar-link', d).addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(linkSimulacao()); avisar('Link copiado. Imagens enviadas não vão no link.'); } catch { avisar('Não foi possível copiar o link.'); }
    });
    $$('[data-id]', d).forEach((item) => {
      const s = lista.find((x) => x.id === item.dataset.id);
      $('[data-abrir]', item).addEventListener('click', () => {
        atualizar((e) => { Object.assign(e, normalizar(s.estado)); }, { painel: true });
        d.close();
        avisar(`"${s.nome}" aberta.`);
      });
      $('[data-excluir]', item).addEventListener('click', () => {
        if (!confirm(`Excluir "${s.nome}" permanentemente?`)) return;
        localStorage.setItem(CHAVE_ARMARIO, JSON.stringify(lerArmario().filter((x) => x.id !== s.id)));
        desenhar();
      });
    });
  };
  desenhar();
  d.showModal();
}

function novaSimulacao() {
  if (!confirm('Começar uma nova simulação? A atual pode ser recuperada com “Desfazer”.')) return;
  atualizar((e) => {
    const modelo = e.modeloCamisa;
    Object.assign(e, clonar(PADRAO), { modeloCamisa: modelo });
  }, { painel: true });
}

// ------------------------------------------------------------------ avisos

let timerAviso;
function avisar(texto) {
  const el = $('#aviso');
  el.textContent = texto;
  el.hidden = false;
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => { el.hidden = true; }, 3200);
}

// ------------------------------------------------------------------ início

async function iniciar() {
  // o índice e o mockup vêm sempre do servidor; os demais arquivos levam a versão no endereço
  catalogo = await (await fetch('dados/modelos.json', { cache: 'no-store' })).json();
  try { fotoMockup = await (await fetch('mockup/foto.json', { cache: 'no-store' })).json(); } catch { fotoMockup = null; }
  try { visual = localStorage.getItem('marol-sports:visual') || visual; } catch { /* sem armazenamento */ }
  $$('#visual [data-visual]').forEach((b) => {
    b.setAttribute('aria-pressed', b.dataset.visual === visual);
    b.addEventListener('click', () => {
      visual = b.dataset.visual;
      $$('#visual button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      try { localStorage.setItem('marol-sports:visual', visual); } catch { /* sem armazenamento */ }
      renderizar();
      if (abaAtual === 'acabamentos') renderizarPainel();
    });
  });
  let inicial = null;
  const hash = location.hash.match(/#s=([\w-]+)/);
  if (hash) {
    try { inicial = decodificar(hash[1]); } catch { avisar('Link de simulação inválido.'); }
    history.replaceState(null, '', location.pathname + location.search);
  }
  if (!inicial) {
    try { inicial = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO) || 'null'); } catch { inicial = null; }
  }
  estado = normalizar(inicial ?? {});

  // em telas pequenas a vista só de frente aproveita melhor o espaço
  if (matchMedia('(max-width: 860px)').matches) {
    vista = 'frente';
    $$('#vista button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.vista === vista));
  }
  $$('.abas [data-aba]').forEach((b) => b.addEventListener('click', () => trocarAba(b.dataset.aba)));
  $$('#vista [data-vista]').forEach((b) => b.addEventListener('click', () => {
    vista = b.dataset.vista;
    $$('#vista button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    renderizar();
  }));
  $$('#fundo [data-fundo]').forEach((b) => b.addEventListener('click', () => {
    $('#palco').dataset.fundo = b.dataset.fundo;
    $$('#fundo button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    try { localStorage.setItem('marol-sports:fundo', b.dataset.fundo); } catch { /* sem armazenamento */ }
  }));
  try {
    const fundo = localStorage.getItem('marol-sports:fundo');
    if (fundo) $(`#fundo [data-fundo="${fundo}"]`)?.click();
  } catch { /* sem armazenamento */ }
  $$('#zoom [data-zoom]').forEach((b) => b.addEventListener('click', () => {
    const z = b.dataset.zoom;
    mudarZoom(z === '+' ? zoom + 0.25 : z === '-' ? zoom - 0.25 : 1);
  }));
  $('#palco').addEventListener('wheel', (ev) => {
    if (!ev.ctrlKey && !ev.metaKey) return;
    ev.preventDefault();
    mudarZoom(zoom * (ev.deltaY < 0 ? 1.1 : 1 / 1.1));
  }, { passive: false });
  new ResizeObserver(() => ajustarPalco()).observe($('#palco'));
  $('#btn-desfazer').addEventListener('click', desfazer);
  $('#btn-refazer').addEventListener('click', refazer);
  $('#btn-nova').addEventListener('click', novaSimulacao);
  $('#btn-armario').addEventListener('click', abrirArmario);
  $('#btn-salvar').addEventListener('click', salvarNoArmario);
  $('#btn-baixar').addEventListener('click', baixarImagem);
  $('#btn-orcamento').addEventListener('click', abrirOrcamento);
  document.addEventListener('keydown', (ev) => {
    if (ev.target.closest('input, textarea, select') || !(ev.ctrlKey || ev.metaKey)) return;
    const k = ev.key.toLowerCase();
    if (k === 'z' && !ev.shiftKey) { ev.preventDefault(); desfazer(); }
    if (k === 'y' || (k === 'z' && ev.shiftKey)) { ev.preventDefault(); refazer(); }
  });
  iniciarArrastar();
  renderizarPainel();
  atualizarBotoesHistorico();
  await renderizar();
}

// Usado pela ferramenta que gera as miniaturas do catálogo.
window.simulador = { montarPalco, variaveisCor, PADRAO, VB, TRONCO, get catalogo() { return catalogo; }, carregarModelo };

// o simulador só abre depois do cadastro/login
exigirAcesso().then((u) => {
  $('#usuario-nome').textContent = u?.nome?.split(' ')[0] ?? '';
  $('#usuario').hidden = !u;
  $('#btn-sair').addEventListener('click', sair);
  return iniciar();
}).catch((err) => {
  console.error(err);
  avisar('Não foi possível iniciar o simulador.');
});
