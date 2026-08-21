import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

let source = await readFile(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
source = source.replace(/SPREADSHEET_ID:\s*'[^']*'/, "SPREADSHEET_ID: 'PLANILHA_TESTE'");

const rows = [];
let lastRow = 0;
const sheet = {
    getLastRow: () => lastRow,
    setFrozenRows: () => {},
    getRange: (row, column) => ({
        setValues: (values) => {
            rows[row] = values[0];
            lastRow = Math.max(lastRow, row);
            return sheet;
        },
        setFontWeight: () => sheet,
        setNumberFormat: () => sheet
    })
};
const spreadsheet = {
    getSheetByName: () => sheet,
    insertSheet: () => sheet
};
const context = vm.createContext({
    console: { log: console.log, error: () => {} },
    SpreadsheetApp: { openById: (id) => { assert.equal(id, 'PLANILHA_TESTE'); return spreadsheet; } },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
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
assert.equal(rows[2][1], 'Moon Walker Edition');
assert.equal(rows[2][5], '52998224725');
assert.equal(rows[1][8], 'SKU');
assert.equal(rows[2][8], 'SKU-TESTE-001');

context.testEvent.parameter.documento = '11111111111';
const failure = vm.runInContext('doPost(testEvent)', context);
assert.match(failure.html, /"ok":false/);
assert.match(failure.html, /CPF ou CNPJ válido/);
assert.equal(lastRow, 2, 'Requisição inválida não deve criar nova linha');

console.log('Apps Script aprovado: validação, gravação e respostas success/error.');
