/**
 * Cadastro e login do Simulador Marol Sports, gravando os clientes no Google Sheets.
 *
 * Como instalar (uma vez):
 *  1. Crie uma planilha no Google Sheets (ex.: "Clientes do simulador").
 *  2. Menu Extensões → Apps Script. Apague o conteúdo e cole este arquivo inteiro.
 *  3. Salve, escolha a função "configurar" e clique em Executar (autorize o acesso).
 *  4. Implantar → Nova implantação → tipo "App da Web":
 *       Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 *  5. Copie a URL que termina em /exec e cole em simulador/js/config.js.
 *
 * A senha nunca é gravada: guardamos só um hash (SHA-256 com sal e 3000 rodadas).
 */

const ABA = 'Clientes';
const COLUNAS = ['Data do cadastro', 'Nome', 'E-mail', 'WhatsApp', 'Cidade', 'Time', 'Aceite de contato',
  'Último acesso', 'Acessos', 'Sal', 'Hash da senha'];
const DIAS_SESSAO = 30;
const MAX_TENTATIVAS = 5; // tentativas de senha erradas por e-mail a cada 15 minutos

/** Rode uma vez pelo editor: cria a aba, o cabeçalho e o segredo que assina os acessos. */
function configurar() {
  aba_();
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SEGREDO')) props.setProperty('SEGREDO', Utilities.getUuid() + Utilities.getUuid());
  Logger.log('Pronto. Agora publique como App da Web (Implantar → Nova implantação).');
}

function doPost(e) {
  let dados = {};
  try {
    dados = JSON.parse(e.postData.contents || '{}');
    const acoes = { cadastrar, entrar, validar, pedirCodigo, redefinirSenha };
    const acao = acoes[dados.acao];
    if (!acao) return resposta_({ ok: false, erro: 'Ação inválida.' });
    return resposta_(acao(dados));
  } catch (err) {
    console.error(err);
    return resposta_({ ok: false, erro: 'Erro inesperado. Tente novamente em instantes.' });
  }
}

function doGet() {
  return resposta_({ ok: true, servico: 'Cadastro do Simulador Marol Sports' });
}

// ------------------------------------------------------------------ ações

function cadastrar(d) {
  const nome = texto_(d.nome, 80);
  const email = email_(d.email);
  const whatsapp = String(d.whatsapp || '').replace(/\D/g, '').slice(0, 13);
  const cidade = texto_(d.cidade, 60);
  const time = texto_(d.time, 60);
  if (!nome || !email || whatsapp.length < 10 || !cidade) return { ok: false, erro: 'Preencha nome, e-mail, WhatsApp com DDD e cidade.' };
  if (!d.aceite) return { ok: false, erro: 'É preciso aceitar o contato para criar a conta.' };
  if (String(d.senha || '').length < 6) return { ok: false, erro: 'A senha precisa ter pelo menos 6 caracteres.' };
  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    if (linhaDoEmail_(email)) return { ok: false, erro: 'Já existe uma conta com este e-mail. Use "Entrar".' };
    const sal = Utilities.getUuid();
    const agora = new Date();
    aba_().appendRow([agora, nome, email, formatarTelefone_(whatsapp), cidade, time, 'Sim', agora, 1, sal, hash_(d.senha, sal)]);
  } finally {
    trava.releaseLock();
  }
  return { ok: true, token: token_(email, nome), usuario: { nome, email, whatsapp: formatarTelefone_(whatsapp), cidade, time } };
}

function entrar(d) {
  const email = email_(d.email);
  if (!email || !d.senha) return { ok: false, erro: 'Informe e-mail e senha.' };
  const cache = CacheService.getScriptCache();
  const chave = 'tentativas:' + email;
  const tentativas = Number(cache.get(chave) || 0);
  if (tentativas >= MAX_TENTATIVAS) return { ok: false, erro: 'Muitas tentativas. Aguarde 15 minutos ou redefina a senha.' };
  const linha = linhaDoEmail_(email);
  const reg = linha && registro_(linha);
  if (!reg || hash_(d.senha, reg.sal) !== reg.hash) {
    cache.put(chave, String(tentativas + 1), 900);
    return { ok: false, erro: 'E-mail ou senha incorretos.' };
  }
  cache.remove(chave);
  const aba = aba_();
  aba.getRange(linha, 8, 1, 2).setValues([[new Date(), Number(reg.acessos || 0) + 1]]);
  return { ok: true, token: token_(email, reg.nome), usuario: publico_(reg) };
}

function validar(d) {
  const dados = lerToken_(d.token);
  if (!dados) return { ok: false, erro: 'Sessão expirada. Entre novamente.' };
  const linha = linhaDoEmail_(dados.email);
  if (!linha) return { ok: false, erro: 'Conta não encontrada.' };
  return { ok: true, usuario: publico_(registro_(linha)) };
}

function pedirCodigo(d) {
  const email = email_(d.email);
  const linha = email && linhaDoEmail_(email);
  // a resposta é a mesma exista ou não a conta, para não revelar quem é cliente
  if (linha) {
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    CacheService.getScriptCache().put('codigo:' + email, codigo, 900);
    MailApp.sendEmail({
      to: email,
      subject: 'Código para redefinir sua senha – Simulador Marol Sports',
      body: 'Seu código é ' + codigo + '. Ele vale por 15 minutos.\n\nSe não foi você que pediu, ignore este e-mail.',
    });
  }
  return { ok: true, mensagem: 'Se houver uma conta com este e-mail, enviamos um código de 6 dígitos.' };
}

function redefinirSenha(d) {
  const email = email_(d.email);
  const cache = CacheService.getScriptCache();
  const codigo = email && cache.get('codigo:' + email);
  if (!codigo || String(d.codigo || '').trim() !== codigo) return { ok: false, erro: 'Código inválido ou expirado.' };
  if (String(d.senha || '').length < 6) return { ok: false, erro: 'A senha precisa ter pelo menos 6 caracteres.' };
  const linha = linhaDoEmail_(email);
  if (!linha) return { ok: false, erro: 'Conta não encontrada.' };
  const sal = Utilities.getUuid();
  aba_().getRange(linha, 10, 1, 2).setValues([[sal, hash_(d.senha, sal)]]);
  cache.remove('codigo:' + email);
  cache.remove('tentativas:' + email);
  const reg = registro_(linha);
  return { ok: true, token: token_(email, reg.nome), usuario: publico_(reg) };
}

// ------------------------------------------------------------------ planilha

function aba_() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
    aba.hideColumns(10, 2); // sal e hash ficam ocultos
  }
  return aba;
}

function linhaDoEmail_(email) {
  const aba = aba_();
  const n = aba.getLastRow() - 1;
  if (n < 1) return 0;
  const emails = aba.getRange(2, 3, n, 1).getValues();
  for (let i = 0; i < emails.length; i++) if (String(emails[i][0]).toLowerCase() === email) return i + 2;
  return 0;
}

function registro_(linha) {
  const v = aba_().getRange(linha, 1, 1, COLUNAS.length).getValues()[0];
  return { nome: v[1], email: v[2], whatsapp: v[3], cidade: v[4], time: v[5], acessos: v[8], sal: v[9], hash: v[10] };
}

function publico_(r) {
  return { nome: r.nome, email: r.email, whatsapp: r.whatsapp, cidade: r.cidade, time: r.time };
}

// ------------------------------------------------------------------ utilidades

function hash_(senha, sal) {
  let h = String(sal) + ':' + String(senha);
  for (let i = 0; i < 3000; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + String(sal), Utilities.Charset.UTF_8));
  }
  return h;
}

function segredo_() {
  const s = PropertiesService.getScriptProperties().getProperty('SEGREDO');
  if (!s) throw new Error('Rode a função configurar() antes de publicar.');
  return s;
}

function b64url_(bytesOuTexto) {
  return Utilities.base64EncodeWebSafe(bytesOuTexto).replace(/=+$/, '');
}

/** Passe de acesso: dados + assinatura HMAC; vale DIAS_SESSAO dias. */
function token_(email, nome) {
  const corpo = b64url_(JSON.stringify({ email, nome, exp: Date.now() + DIAS_SESSAO * 864e5 }));
  const assinatura = b64url_(Utilities.computeHmacSha256Signature(corpo, segredo_()));
  return corpo + '.' + assinatura;
}

function lerToken_(token) {
  const [corpo, assinatura] = String(token || '').split('.');
  if (!corpo || !assinatura) return null;
  if (b64url_(Utilities.computeHmacSha256Signature(corpo, segredo_())) !== assinatura) return null;
  const dados = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(corpo + '==='.slice((corpo.length + 3) % 4))).getDataAsString());
  return dados.exp > Date.now() ? dados : null;
}

function email_(e) {
  const v = String(e || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 120 ? v : '';
}

function texto_(v, max) {
  // evita fórmulas injetadas na planilha (=, +, -, @ no início)
  return String(v || '').trim().slice(0, max).replace(/^[=+\-@]+/, '');
}

function formatarTelefone_(d) {
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d;
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
