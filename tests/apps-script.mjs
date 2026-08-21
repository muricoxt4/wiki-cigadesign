import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const pricingHeaders = ['Codigo', 'Descrição', 'IPI', 'Foto', 'SKU', 'NCM', 'EAN', 'CIGA WEB', 'BRAZIL WEB', 'BRAZIL WHOSALE'];
const pricingData = [
    pricingHeaders,
    ...Array.from({ length: 60 }, (_, index) => [null, `Produto ${index + 1}`, 0.2, null, `SKU-${index + 1}`, '9102.21.00', null, 100, 1000, 660])
];
const pricingJson = JSON.stringify(pricingData);
const pricingHash = createHash('sha256').update(pricingJson, 'utf8').digest('hex');

let source = await readFile(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
source = source.replace(/SPREADSHEET_ID:\s*'[^']*'/, "SPREADSHEET_ID: 'PLANILHA_TESTE'");
source = source.replace(/PRICING_IMPORT_SHA256:\s*'[^']*'/, `PRICING_IMPORT_SHA256: '${pricingHash}'`);

function createSheetMock() {
    const sheet = {
        rows: [],
        getLastRow: () => {
            for (let index = sheet.rows.length - 1; index >= 1; index -= 1) if (sheet.rows[index]?.some(value => value !== '')) return index;
            return 0;
        },
        clearContents: () => { sheet.rows = []; return sheet; },
        setFrozenRows: () => sheet,
        autoResizeColumns: () => sheet,
        setColumnWidth: () => sheet,
        getRange: (row, column) => ({
            setValues: (values) => {
                values.forEach((valueRow, rowOffset) => {
                    const targetRow = row + rowOffset;
                    if (!sheet.rows[targetRow]) sheet.rows[targetRow] = [];
                    valueRow.forEach((value, columnOffset) => { sheet.rows[targetRow][column - 1 + columnOffset] = value; });
                });
                return sheet;
            },
            setFontWeight: () => sheet,
            setNumberFormat: () => sheet
        })
    };
    return sheet;
}

const salesSheet = createSheetMock();
const pricingSheet = createSheetMock();
const spreadsheet = {
    getSheetByName: (name) => name === 'Vendas' ? salesSheet : pricingSheet,
    insertSheet: (name) => name === 'Vendas' ? salesSheet : pricingSheet
};
const context = vm.createContext({
    console: { log: console.log, error: () => {} },
    SpreadsheetApp: { openById: (id) => { assert.equal(id, 'PLANILHA_TESTE'); return spreadsheet; } },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    Utilities: {
        DigestAlgorithm: { SHA_256: 'sha256' },
        Charset: { UTF_8: 'utf8' },
        computeDigest: (_algorithm, text) => [...createHash('sha256').update(text, 'utf8').digest()]
    },
    ContentService: {
        MimeType: { JSON: 'json' },
        createTextOutput: (text) => ({ text, setMimeType() { return this; } })
    },
    HtmlService: {
        XFrameOptionsMode: { ALLOWALL: 'allowall' },
        createHtmlOutput: (html) => ({ html, setXFrameOptionsMode() { return this; } })
    }
});
vm.runInContext(source, context);

assert.equal(vm.runInContext("isValidDocument_('52998224725')", context), true, 'CPF válido');
assert.equal(vm.runInContext("isValidDocument_('11111111111')", context), false, 'CPF repetido inválido');
assert.equal(vm.runInContext("isValidDocument_('04252011000110')", context), true, 'CNPJ válido');

context.testEvent = {
    parameter: {
        callbackToken: 'token-teste',
        iniciadoEm: new Date(Date.now() - 3000).toISOString(),
        empresa: '',
        modelo: 'Moon Walker Edition',
        nome: 'Teste Local',
        email: 'teste@example.com',
        telefone: '45999999999',
        documento: '52998224725',
        sku: 'SKU-TESTE-001',
        codigoVenda: 'TESTE-001',
        pagina: 'http://127.0.0.1:4173/moon-walker/'
    }
};
const success = vm.runInContext('doPost(testEvent)', context);
assert.match(success.html, /"ok":true/);
assert.match(success.html, /"token":"token-teste"/);
assert.equal(salesSheet.rows[2][1], 'Moon Walker Edition');
assert.equal(salesSheet.rows[2][5], '52998224725');
assert.equal(salesSheet.rows[1][8], 'SKU');
assert.equal(salesSheet.rows[2][8], 'SKU-TESTE-001');

context.testEvent.parameter.documento = '11111111111';
const failure = vm.runInContext('doPost(testEvent)', context);
assert.match(failure.html, /"ok":false/);
assert.match(failure.html, /CPF ou CNPJ válido/);
assert.equal(salesSheet.getLastRow(), 2, 'Requisição inválida não deve criar nova linha');

context.pricingEvent = { parameter: { action: 'importPricing', callbackToken: 'token-precos', pricingData: pricingJson } };
const pricingSuccess = vm.runInContext('doPost(pricingEvent)', context);
assert.match(pricingSuccess.html, /"ok":true/);
assert.match(pricingSuccess.html, /"rows":60/);
assert.equal(pricingSheet.rows[1][8], 'BRAZIL WEB');
assert.equal(pricingSheet.rows[2][4], 'SKU-1');

context.pricingEvent.parameter.pricingData = pricingJson.replace('SKU-1', 'SKU-ALTERADO');
const pricingFailure = vm.runInContext('doPost(pricingEvent)', context);
assert.match(pricingFailure.html, /"ok":false/);
assert.match(pricingFailure.html, /não foi autorizada/);

console.log('Apps Script aprovado: vendas, validações e importação protegida da tabela de preços.');
