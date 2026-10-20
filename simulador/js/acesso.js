// Tela de cadastro e login. O simulador só abre para clientes com conta:
// os cadastros ficam no Google Sheets, por meio do Google Apps Script (config.js).
import { API_CADASTRO } from './config.js';

const CHAVE_SESSAO = 'marol-sports:sessao';
const CHAVE_CONTA = 'marol-sports:tem-conta'; // depois do primeiro acesso, a tela abre em "Entrar"
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let usuario = null;
export const usuarioAtual = () => usuario;

async function chamar(acao, dados = {}) {
  if (!API_CADASTRO) throw new Error('O cadastro ainda não foi configurado (API_CADASTRO em js/config.js).');
  // text/plain evita a verificação prévia (CORS) que o Apps Script não responde
  const r = await fetch(API_CADASTRO, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao, ...dados }) });
  if (!r.ok) throw new Error('Serviço de cadastro indisponível. Tente novamente.');
  return r.json();
}

function lerSessao() {
  try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null'); } catch { return null; }
}

function gravarSessao(token, u) {
  usuario = u;
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ token, usuario: u }));
    localStorage.setItem(CHAVE_CONTA, '1');
  } catch { /* sem armazenamento */ }
}

export function sair() {
  try { localStorage.removeItem(CHAVE_SESSAO); } catch { /* sem armazenamento */ }
  location.reload();
}

function expirado(token) {
  try {
    const corpo = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(corpo)).exp < Date.now();
  } catch { return true; }
}

// Resolve quando o cliente está identificado; até lá mostra a tela de acesso.
export async function exigirAcesso() {
  const sessao = lerSessao();
  if (sessao?.token && !expirado(sessao.token)) {
    try {
      const r = await chamar('validar', { token: sessao.token });
      if (r.ok) { gravarSessao(sessao.token, r.usuario); return usuario; }
    } catch {
      // sem conexão com o serviço: mantém a sessão ainda válida para não travar o cliente
      usuario = sessao.usuario;
      return usuario;
    }
  }
  return new Promise((resolver) => mostrarTela(resolver));
}

const TELAS = {
  entrar: () => `
    <h2>Entrar</h2><p class="sub">Acesse com o e-mail e a senha da sua conta.</p>
    <form data-form="entrar" novalidate>
      <div class="campo"><label for="ac-email">E-mail</label><input id="ac-email" name="email" type="email" autocomplete="email" required></div>
      <div class="campo"><label for="ac-senha">Senha</label><input id="ac-senha" name="senha" type="password" autocomplete="current-password" required></div>
      <p class="acesso-erro" role="alert" hidden></p>
      <button class="btn-primario largo" type="submit">Entrar</button>
    </form>
    <div class="acesso-links"><button class="btn-link" data-ir="esqueci">Esqueci minha senha</button><span>Não tem conta? <button class="btn-link" data-ir="cadastrar">Criar conta</button></span></div>`,
  cadastrar: () => `
    <h2>Criar conta</h2><p class="sub">É rápido: com a conta você monta o uniforme, salva suas simulações e pede orçamento.</p>
    <form data-form="cadastrar" novalidate>
      <div class="campo"><label for="ac-nome">Nome completo *</label><input id="ac-nome" name="nome" autocomplete="name" maxlength="80" required></div>
      <div class="grade-2">
        <div class="campo"><label for="ac-email">E-mail *</label><input id="ac-email" name="email" type="email" autocomplete="email" required></div>
        <div class="campo"><label for="ac-whats">WhatsApp *</label><input id="ac-whats" name="whatsapp" type="tel" autocomplete="tel" placeholder="(21) 99999-9999" required></div>
      </div>
      <div class="grade-2">
        <div class="campo"><label for="ac-cidade">Cidade *</label><input id="ac-cidade" name="cidade" autocomplete="address-level2" maxlength="60" required></div>
        <div class="campo"><label for="ac-time">Nome do time</label><input id="ac-time" name="time" maxlength="60"></div>
      </div>
      <div class="grade-2">
        <div class="campo"><label for="ac-senha">Senha *</label><input id="ac-senha" name="senha" type="password" autocomplete="new-password" minlength="6" required></div>
        <div class="campo"><label for="ac-senha2">Repita a senha *</label><input id="ac-senha2" name="senha2" type="password" autocomplete="new-password" required></div>
      </div>
      <label class="acesso-aceite"><input type="checkbox" name="aceite" required> Aceito que a Marol Sports guarde meus dados e entre em contato sobre meus orçamentos.</label>
      <p class="acesso-erro" role="alert" hidden></p>
      <button class="btn-primario largo" type="submit">Criar conta e abrir o simulador</button>
    </form>
    <div class="acesso-links"><span>Já tem conta? <button class="btn-link" data-ir="entrar">Entrar</button></span></div>`,
  esqueci: (email = '') => `
    <h2>Redefinir senha</h2><p class="sub">Enviamos um código de 6 dígitos para o seu e-mail.</p>
    <form data-form="esqueci" novalidate>
      <div class="campo"><label for="ac-email">E-mail</label><input id="ac-email" name="email" type="email" autocomplete="email" value="${esc(email)}" required></div>
      <p class="acesso-erro" role="alert" hidden></p>
      <button class="btn-primario largo" type="submit">Enviar código</button>
    </form>
    <div class="acesso-links"><button class="btn-link" data-ir="entrar">Voltar para entrar</button></div>`,
  codigo: (email = '') => `
    <h2>Nova senha</h2><p class="sub">Digite o código que chegou em <b>${esc(email)}</b> e escolha uma nova senha.</p>
    <form data-form="codigo" novalidate>
      <input type="hidden" name="email" value="${esc(email)}">
      <div class="campo"><label for="ac-codigo">Código</label><input id="ac-codigo" name="codigo" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required></div>
      <div class="grade-2">
        <div class="campo"><label for="ac-senha">Nova senha</label><input id="ac-senha" name="senha" type="password" autocomplete="new-password" minlength="6" required></div>
        <div class="campo"><label for="ac-senha2">Repita a senha</label><input id="ac-senha2" name="senha2" type="password" autocomplete="new-password" required></div>
      </div>
      <p class="acesso-erro" role="alert" hidden></p>
      <button class="btn-primario largo" type="submit">Salvar e entrar</button>
    </form>
    <div class="acesso-links"><button class="btn-link" data-ir="esqueci">Reenviar código</button><button class="btn-link" data-ir="entrar">Voltar para entrar</button></div>`,
};

function mascaraTelefone(inp) {
  inp?.addEventListener('input', () => {
    const v = inp.value.replace(/\D/g, '').slice(0, 11);
    inp.value = v.length > 6 ? `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}` : v.length > 2 ? `(${v.slice(0, 2)}) ${v.slice(2)}` : v;
  });
}

function mostrarTela(resolver) {
  document.body.classList.add('bloqueado');
  const tela = $('#acesso');
  tela.hidden = false;
  // o vídeo só é baixado e tocado quando a tela de acesso aparece (e não toca para quem pede menos movimento)
  const video = $('.acesso-video', tela);
  if (video && !matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(() => {});
  const cartao = $('.acesso-cartao', tela);
  const aviso = API_CADASTRO ? '' : '<p class="acesso-erro">O cadastro ainda não foi configurado neste site. Veja as instruções no README.</p>';

  const ir = (nome, extra) => {
    cartao.innerHTML = aviso + TELAS[nome](extra);
    mascaraTelefone($('[name="whatsapp"]', cartao));
    cartao.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => ir(b.dataset.ir, $('[name="email"]', cartao)?.value)));
    const form = $('form', cartao);
    form.addEventListener('submit', (ev) => { ev.preventDefault(); enviar(form, nome, ir); });
    $('input:not([type=hidden])', cartao)?.focus();
  };

  async function enviar(form, nome, irPara) {
    const erro = $('form .acesso-erro', cartao);
    const botao = $('button[type=submit]', form);
    const d = Object.fromEntries(new FormData(form));
    d.aceite = form.aceite?.checked ?? undefined;
    const falhar = (msg) => { erro.textContent = msg; erro.hidden = false; };
    erro.hidden = true;
    if ((nome === 'cadastrar' || nome === 'codigo') && d.senha !== d.senha2) return falhar('As senhas não são iguais.');
    if (nome === 'cadastrar' && !d.aceite) return falhar('Marque o aceite para criar a conta.');
    const acao = { entrar: 'entrar', cadastrar: 'cadastrar', esqueci: 'pedirCodigo', codigo: 'redefinirSenha' }[nome];
    botao.disabled = true;
    const rotulo = botao.textContent;
    botao.textContent = 'Aguarde…';
    try {
      const r = await chamar(acao, d);
      if (!r.ok) return falhar(r.erro || 'Não foi possível concluir.');
      if (nome === 'esqueci') return irPara('codigo', d.email);
      gravarSessao(r.token, r.usuario);
      $('#acesso').hidden = true;
      $('.acesso-video')?.pause();
      document.body.classList.remove('bloqueado');
      resolver(usuario);
    } catch (e) {
      falhar(e.message || 'Sem conexão. Tente novamente.');
    } finally {
      botao.disabled = false;
      botao.textContent = rotulo;
    }
  }

  let temConta = false;
  try { temConta = !!localStorage.getItem(CHAVE_CONTA); } catch { /* sem armazenamento */ }
  ir(temConta ? 'entrar' : 'cadastrar');
}
