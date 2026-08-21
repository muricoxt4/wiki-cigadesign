/**
 * CIGA design Brasil — receptor do formulário de vendas.
 *
 * 1. A planilha Google Sheets já está configurada em SPREADSHEET_ID.
 * 2. Ajuste SHEET_NAME se desejar usar outro nome de aba.
 * 3. Implante como app da Web seguindo o README desta pasta.
 */
const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1ObSm5woDBo3rejyG67yWBrVyWDGTEnr35Djx_tufVYc',
  SHEET_NAME: 'Vendas',
  MAX_LENGTHS: Object.freeze({
    nome: 120,
    email: 160,
    telefone: 13,
    documento: 14,
    sku: 100,
    codigoVenda: 80,
    modelo: 160,
    pagina: 500
  })
});

const HEADERS = Object.freeze([
  'Registrado em',
  'Modelo',
  'Nome',
  'E-mail',
  'Telefone',
  'CPF/CNPJ',
  'Código de venda',
  'Página de origem',
  'SKU'
]);

function doGet() {
  return jsonResponse_({ ok: true, service: 'CIGA design — registro de vendas' });
}

function doPost(event) {
  const callbackToken = clean_(event && event.parameter && event.parameter.callbackToken, 120);
  try {
    const payload = parsePayload_(event);
    const sale = validateSale_(payload);
    saveSale_(sale);
    return browserResponse_({ source: 'ciga-sales', token: callbackToken, ok: true, message: 'Venda registrada com sucesso.' });
  } catch (error) {
    console.error(error);
    return browserResponse_({
      source: 'ciga-sales',
      token: callbackToken,
      ok: false,
      message: error && error.message ? error.message : 'Não foi possível registrar a venda.'
    });
  }
}

function parsePayload_(event) {
  if (event && event.parameter && Object.keys(event.parameter).length) {
    return event.parameter;
  }
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error('Requisição vazia.');
  }

  let payload;
  try {
    payload = JSON.parse(event.postData.contents);
  } catch (error) {
    throw new Error('Formato de envio inválido.');
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Dados de venda inválidos.');
  }
  return payload;
}

function validateSale_(payload) {
  if (clean_(payload.empresa, 200)) throw new Error('Envio não aceito.');

  const startedAt = new Date(String(payload.iniciadoEm || ''));
  if (Number.isNaN(startedAt.getTime()) || Date.now() - startedAt.getTime() < 800) {
    throw new Error('Envio rápido demais. Aguarde um instante e tente novamente.');
  }

  const sale = {
    modelo: required_(payload.modelo, 'Modelo', CONFIG.MAX_LENGTHS.modelo),
    nome: required_(payload.nome, 'Nome', CONFIG.MAX_LENGTHS.nome),
    email: required_(payload.email, 'E-mail', CONFIG.MAX_LENGTHS.email).toLowerCase(),
    telefone: digits_(payload.telefone).slice(0, CONFIG.MAX_LENGTHS.telefone),
    documento: digits_(payload.documento).slice(0, CONFIG.MAX_LENGTHS.documento),
    sku: required_(payload.sku, 'SKU', CONFIG.MAX_LENGTHS.sku),
    codigoVenda: required_(payload.codigoVenda, 'Código de venda', CONFIG.MAX_LENGTHS.codigoVenda),
    pagina: clean_(payload.pagina, CONFIG.MAX_LENGTHS.pagina)
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(sale.email)) {
    throw new Error('Informe um e-mail válido.');
  }
  if (!/^\d{10,13}$/.test(sale.telefone)) {
    throw new Error('Informe um telefone válido com DDD.');
  }
  if (!isValidDocument_(sale.documento)) {
    throw new Error('Informe um CPF ou CNPJ válido.');
  }
  if (sale.pagina && !/^https?:\/\//i.test(sale.pagina)) {
    throw new Error('Página de origem inválida.');
  }
  return sale;
}

function saveSale_(sale) {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === 'COLE_AQUI_O_ID_DA_PLANILHA') {
    throw new Error('A planilha ainda não foi configurada no Apps Script.');
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('O sistema está ocupado. Tente novamente em instantes.');

  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 5, 1, 2).setNumberFormat('@');
    sheet.getRange(nextRow, 7, 1, 1).setNumberFormat('@');
    sheet.getRange(nextRow, 9, 1, 1).setNumberFormat('@');
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
      new Date(),
      safeCell_(sale.modelo),
      safeCell_(sale.nome),
      safeCell_(sale.email),
      safeCell_(sale.telefone),
      safeCell_(sale.documento),
      safeCell_(sale.codigoVenda),
      safeCell_(sale.pagina),
      safeCell_(sale.sku)
    ]]);
  } finally {
    lock.releaseLock();
  }
}

function required_(value, label, maxLength) {
  const cleaned = clean_(value, maxLength);
  if (!cleaned) throw new Error(label + ' é obrigatório.');
  return cleaned;
}

function clean_(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function digits_(value) {
  return String(value == null ? '' : value).replace(/\D/g, '');
}

function safeCell_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function isValidDocument_(document) {
  if (!/^\d{11}$|^\d{14}$/.test(document) || /^(\d)\1+$/.test(document)) return false;
  return document.length === 11 ? isValidCpf_(document) : isValidCnpj_(document);
}

function isValidCpf_(cpf) {
  const calculate = function (length) {
    let total = 0;
    for (let index = 0; index < length; index += 1) total += Number(cpf[index]) * (length + 1 - index);
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calculate(9) === Number(cpf[9]) && calculate(10) === Number(cpf[10]);
}

function isValidCnpj_(cnpj) {
  const calculate = function (length) {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let total = 0;
    for (let index = 0; index < length; index += 1) total += Number(cnpj[index]) * weights[index];
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return calculate(12) === Number(cnpj[12]) && calculate(13) === Number(cnpj[13]);
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function browserResponse_(body) {
  const serialized = JSON.stringify(body).replace(/</g, '\u003c');
  const html = '<!doctype html><html><body><script>parent.postMessage(' + serialized + ", '*');</script></body></html>";
  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
