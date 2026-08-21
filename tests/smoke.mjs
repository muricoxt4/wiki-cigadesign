import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE_URL = process.env.CIGA_TEST_URL || 'http://127.0.0.1:4173';
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9300 + Math.floor(Math.random() * 300);
const profile = await mkdtemp(join(tmpdir(), 'ciga-smoke-'));
const browser = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'about:blank'
], { stdio: 'ignore', windowsHide: true });

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDebugger() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/json/version`);
            if (response.ok) return;
        } catch {}
        await delay(100);
    }
    throw new Error('Chrome DevTools não iniciou.');
}

class CdpClient {
    constructor(socket) {
        this.socket = socket;
        this.nextId = 1;
        this.pending = new Map();
        this.listeners = new Map();
        socket.onmessage = (event) => {
            const message = JSON.parse(String(event.data));
            if (message.id && this.pending.has(message.id)) {
                const { resolve, reject } = this.pending.get(message.id);
                this.pending.delete(message.id);
                if (message.error) reject(new Error(message.error.message));
                else resolve(message.result);
                return;
            }
            const listeners = this.listeners.get(message.method) || [];
            listeners.forEach((listener) => listener(message.params));
        };
    }

    send(method, params = {}) {
        const id = this.nextId++;
        this.socket.send(JSON.stringify({ id, method, params }));
        return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    }

    waitFor(method, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`Timeout aguardando ${method}`)), timeout);
            const listener = (params) => {
                clearTimeout(timer);
                this.listeners.set(method, (this.listeners.get(method) || []).filter((item) => item !== listener));
                resolve(params);
            };
            this.listeners.set(method, [...(this.listeners.get(method) || []), listener]);
        });
    }

    async evaluate(expression) {
        const response = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
        return response.result.value;
    }
}

async function openPage(pathname, viewport = null) {
    const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
    const target = await targetResponse.json();
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        socket.onopen = resolve;
        socket.onerror = reject;
    });
    const client = new CdpClient(socket);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    if (viewport) {
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: true
        });
    }
    const loaded = client.waitFor('Page.loadEventFired');
    await client.send('Page.navigate', { url: `${BASE_URL}${pathname}` });
    await loaded;
    await delay(250);
    return { client, socket, target };
}

async function closePage(page) {
    page.socket.close();
    await fetch(`http://127.0.0.1:${port}/json/close/${page.target.id}`);
}

async function checkResponse(pathname) {
    const response = await fetch(new URL(pathname, BASE_URL));
    assert.equal(response.status, 200, `HTTP ${response.status}: ${pathname}`);
}

try {
    await waitForDebugger();

    const home = await openPage('/');
    const initial = await home.client.evaluate(`({
        cards: document.querySelectorAll('.watch-card').length,
        visible: [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length,
        prices: document.querySelectorAll('.watch-card-price').length,
        filters: document.querySelectorAll('.filter-btn').length,
        search: Boolean(document.getElementById('watchSearch')),
        links: [...document.querySelectorAll('.watch-card-btn')].map(link => link.getAttribute('href')),
        images: [...document.querySelectorAll('.watch-card-img')].map(image => image.getAttribute('src'))
    })`);
    assert.deepEqual({ cards: initial.cards, visible: initial.visible, prices: initial.prices, filters: initial.filters, search: initial.search }, { cards: 26, visible: 26, prices: 26, filters: 6, search: true });

    const aventurCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="aventur"]').click(); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(aventurCount, 6, 'Filtro Aventur');
    const edgeCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="edge"]').click(); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(edgeCount, 7, 'Filtro Edge');
    const moonCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="todos"]').click(); const input = document.getElementById('watchSearch'); input.value = 'moon'; input.dispatchEvent(new Event('input', { bubbles: true })); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(moonCount, 1, 'Busca por modelo');
    const empty = await home.client.evaluate(`(() => { const input = document.getElementById('watchSearch'); input.value = 'modelo inexistente xyz'; input.dispatchEvent(new Event('input', { bubbles: true })); return { visible: [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length, shown: !document.getElementById('catalogEmpty').hidden }; })()`);
    assert.deepEqual(empty, { visible: 0, shown: true });

    for (const pathname of [...new Set([...initial.links, ...initial.images])]) await checkResponse(pathname);
    await closePage(home);

    for (const href of initial.links.filter((item) => !['hunter/', 'moon-walker/'].includes(item))) {
        const page = await openPage(`/${href}`);
        const saleState = await page.client.evaluate(`({ button: document.querySelectorAll('.sale-hero-btn').length, form: document.querySelectorAll('#formulario-venda .sale-form').length, model: document.querySelector('[name="modelo"]')?.value })`);
        assert.equal(saleState.button, 1, `Botão VENDER ausente em ${href}`);
        assert.equal(saleState.form, 1, `Formulário ausente em ${href}`);
        assert(saleState.model, `Modelo oculto ausente em ${href}`);
        await closePage(page);
    }

    const legacy = await openPage('/hunter/');
    const legacyState = await legacy.client.evaluate(`({
        sellButtons: document.querySelectorAll('.sale-hero-btn').length,
        forms: document.querySelectorAll('#formulario-venda .sale-form').length,
        fields: [...document.querySelectorAll('#formulario-venda [name]')].map(field => field.name),
        price: document.querySelector('.purchase-price-value')?.textContent.trim()
    })`);
    assert.equal(legacyState.sellButtons, 1);
    assert.equal(legacyState.forms, 1);
    assert.equal(legacyState.price, 'R$ 5.990,00');
    for (const field of ['nome', 'email', 'telefone', 'documento', 'codigoVenda']) assert(legacyState.fields.includes(field), `Campo ausente: ${field}`);

    const popupState = await legacy.client.evaluate(`(() => {
        const form = document.querySelector('.sale-form');
        form.elements.nome.value = 'Teste Local';
        form.elements.email.value = 'teste@example.com';
        form.elements.telefone.value = '45999999999';
        form.elements.documento.value = '52998224725';
        form.elements.codigoVenda.value = 'TESTE-LOCAL';
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        return { hidden: document.querySelector('.sale-popup').hidden, title: document.getElementById('salePopupTitle').textContent };
    })()`);
    assert.deepEqual(popupState, { hidden: false, title: 'Não foi possível enviar' });
    await closePage(legacy);

    const current = await openPage('/moon-walker/');
    const currentState = await current.client.evaluate(`({
        title: document.querySelector('.hero-title')?.textContent.trim(),
        imageLoaded: Boolean(document.querySelector('.catalog-product-image img')?.complete && document.querySelector('.catalog-product-image img')?.naturalWidth),
        price: document.querySelector('.catalog-price-summary strong')?.textContent.trim(),
        sellButtons: document.querySelectorAll('.sale-hero-btn').length,
        forms: document.querySelectorAll('#formulario-venda .sale-form').length
    })`);
    assert.deepEqual(currentState, { title: 'Moon Walker Edition', imageLoaded: true, price: 'R$ 16.990,00', sellButtons: 1, forms: 1 });
    await closePage(current);

    const mobile = await openPage('/moon-walker/', { width: 390, height: 844 });
    const mobileState = await mobile.client.evaluate(`({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, navWidth: document.querySelector('.catalog-nav').getBoundingClientRect().width })`);
    assert(mobileState.scrollWidth <= mobileState.innerWidth + 1, `Overflow mobile: ${JSON.stringify(mobileState)}`);
    await closePage(mobile);

    console.log('Smoke test aprovado: catálogo, filtros, busca, rotas, imagens, preços e formulário.');
} finally {
    if (browser.exitCode === null) {
        const exited = new Promise((resolve) => browser.once('exit', resolve));
        browser.kill();
        await Promise.race([exited, delay(2000)]);
    }
    for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
            await rm(profile, { recursive: true, force: true });
            break;
        } catch (error) {
            if (error.code !== 'EBUSY' || attempt === 4) throw error;
            await delay(250);
        }
    }
}
