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
        pricingPageLink: document.querySelector('.nav-pricing-link')?.getAttribute('href'),
        links: [...document.querySelectorAll('.watch-card-btn')].map(link => link.getAttribute('href')),
        images: [...document.querySelectorAll('.watch-card-img')].map(image => image.getAttribute('src'))
    })`);
    assert.deepEqual({ cards: initial.cards, visible: initial.visible, prices: initial.prices, filters: initial.filters, search: initial.search }, { cards: 28, visible: 28, prices: 28, filters: 6, search: true });
    assert.equal(initial.pricingPageLink, 'precos/');

    const aventurCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="aventur"]').click(); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(aventurCount, 6, 'Filtro Aventur');
    const edgeCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="edge"]').click(); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(edgeCount, 7, 'Filtro Edge');
    const everestCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="everest"]').click(); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(everestCount, 3, 'Filtro Everest');
    const legacyCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="outros"]').click(); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(legacyCount, 9, 'Filtro Outros / Legado');
    const moonCount = await home.client.evaluate(`(() => { document.querySelector('[data-filter="todos"]').click(); const input = document.getElementById('watchSearch'); input.value = 'moon'; input.dispatchEvent(new Event('input', { bubbles: true })); return [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length; })()`);
    assert.equal(moonCount, 1, 'Busca por modelo');
    const empty = await home.client.evaluate(`(() => { const input = document.getElementById('watchSearch'); input.value = 'modelo inexistente xyz'; input.dispatchEvent(new Event('input', { bubbles: true })); return { visible: [...document.querySelectorAll('.watch-card')].filter(card => !card.classList.contains('hidden')).length, shown: !document.getElementById('catalogEmpty').hidden }; })()`);
    assert.deepEqual(empty, { visible: 0, shown: true });

    for (const pathname of [...new Set([...initial.links, ...initial.images])]) await checkResponse(pathname);
    await closePage(home);

    const tabletHome = await openPage('/', { width: 1024, height: 768 });
    const tabletHomeState = await tabletHome.client.evaluate(`({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        toggleVisible: getComputedStyle(document.querySelector('.nav-toggle')).display !== 'none'
    })`);
    assert(tabletHomeState.scrollWidth <= tabletHomeState.innerWidth + 1, `Overflow no cabeçalho tablet: ${JSON.stringify(tabletHomeState)}`);
    assert.equal(tabletHomeState.toggleVisible, true, 'Menu tablet deve usar o botão hambúrguer');
    const tabletMenuState = await tabletHome.client.evaluate(`(() => {
        document.querySelector('.nav-toggle').click();
        const link = document.querySelector('.nav-pricing-link');
        return {
            open: document.querySelector('.nav-header').classList.contains('nav-open'),
            linkVisible: Boolean(link && link.getBoundingClientRect().height)
        };
    })()`);
    assert.deepEqual(tabletMenuState, { open: true, linkVisible: true }, 'Tabela de preços deve aparecer dentro do menu hambúrguer');
    await closePage(tabletHome);

    for (const href of initial.links.filter((item) => !['hunter/', 'moon-walker/'].includes(item))) {
        const page = await openPage(`/${href}`);
        const saleState = await page.client.evaluate(`({
            button: document.querySelectorAll('.sale-hero-btn').length,
            form: document.querySelectorAll('#formulario-venda .sale-form').length,
            model: document.querySelector('[name="modelo"]')?.value,
            pricingPageLink: document.querySelectorAll('[data-pricing-page-link]').length,
            topPrice: document.querySelector('.sale-top-price strong')?.textContent.trim(),
            priceImmediatelyAfterTitle: document.querySelector('.hero-title')?.nextElementSibling?.classList.contains('sale-top-price')
        })`);
        assert.equal(saleState.button, 1, `Botão VENDER ausente em ${href}`);
        assert.equal(saleState.form, 1, `Formulário ausente em ${href}`);
        assert(saleState.model, `Modelo oculto ausente em ${href}`);
        assert.equal(saleState.pricingPageLink, 1, `Link da tabela de preços ausente em ${href}`);
        assert(saleState.topPrice, `Preço destacado ausente em ${href}`);
        assert.equal(saleState.priceImmediatelyAfterTitle, true, `Preço fora do topo em ${href}`);
        await closePage(page);
    }

    const legacy = await openPage('/hunter/');
    const legacyState = await legacy.client.evaluate(`({
        sellButtons: document.querySelectorAll('.sale-hero-btn').length,
        forms: document.querySelectorAll('#formulario-venda .sale-form').length,
        fields: [...document.querySelectorAll('#formulario-venda [name]')].map(field => field.name),
        pricingPageLink: document.querySelectorAll('[data-pricing-page-link]').length,
        price: document.querySelector('.purchase-price-value')?.textContent.trim(),
        blackGoldPrice: [...document.querySelectorAll('.purchase-variant-prices li')].find(item => item.textContent.includes('Black Gold'))?.querySelector('span:last-child')?.textContent.trim(),
        topPrice: document.querySelector('.sale-top-price strong')?.textContent.trim(),
        priceImmediatelyAfterTitle: document.querySelector('.hero-title')?.nextElementSibling?.classList.contains('sale-top-price')
    })`);
    assert.equal(legacyState.sellButtons, 1);
    assert.equal(legacyState.forms, 1);
    assert.equal(legacyState.pricingPageLink, 1);
    assert.equal(legacyState.price, 'R$ 5.990,00');
    assert.equal(legacyState.blackGoldPrice, 'R$ 4.990,00');
    assert.equal(legacyState.topPrice, 'R$ 5.990,00');
    assert.equal(legacyState.priceImmediatelyAfterTitle, true);
    for (const field of ['nome', 'email', 'telefone', 'documento', 'sku', 'codigoVenda']) assert(legacyState.fields.includes(field), `Campo ausente: ${field}`);

    const popupState = await legacy.client.evaluate(`(() => {
        const form = document.querySelector('.sale-form');
        window.CIGA_SALES_ENDPOINT = '';
        form.elements.nome.value = 'Teste Local';
        form.elements.email.value = 'teste@example.com';
        form.elements.telefone.value = '45999999999';
        form.elements.documento.value = '52998224725';
        form.elements.sku.value = 'SKU-TESTE-LOCAL';
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
        topPrice: document.querySelector('.sale-top-price strong')?.textContent.trim(),
        priceImmediatelyAfterTitle: document.querySelector('.hero-title')?.nextElementSibling?.classList.contains('sale-top-price'),
        pricingPageLink: document.querySelectorAll('[data-pricing-page-link]').length,
        menuToggle: document.querySelectorAll('.catalog-menu-toggle').length,
        sellButtons: document.querySelectorAll('.sale-hero-btn').length,
        forms: document.querySelectorAll('#formulario-venda .sale-form').length
    })`);
    assert.deepEqual(currentState, {
        title: 'Moon Walker Edition',
        imageLoaded: true,
        price: 'R$ 16.990,00',
        topPrice: 'R$ 16.990,00',
        priceImmediatelyAfterTitle: true,
        pricingPageLink: 1,
        menuToggle: 1,
        sellButtons: 1,
        forms: 1
    });
    const currentMenuState = await current.client.evaluate(`(() => {
        document.querySelector('.catalog-menu-toggle').click();
        const menu = document.querySelector('.catalog-menu');
        const pricingLink = menu.querySelector('[data-pricing-page-link]');
        return {
            open: document.querySelector('.catalog-nav').classList.contains('catalog-menu-open'),
            expanded: document.querySelector('.catalog-menu-toggle').getAttribute('aria-expanded'),
            hidden: menu.hidden,
            pricingLinkVisible: Boolean(pricingLink.getBoundingClientRect().height)
        };
    })()`);
    assert.deepEqual(currentMenuState, { open: true, expanded: 'true', hidden: false, pricingLinkVisible: true }, 'Tabela de preços deve abrir dentro do menu do produto');
    await closePage(current);

    const pricing = await openPage('/precos/');
    const pricingState = await pricing.client.evaluate(`({
        products: window.CIGA_PRICING?.length,
        cards: document.querySelectorAll('.pricing-card').length,
        images: [...document.querySelectorAll('.pricing-card-image img')].map(image => new URL(image.src).pathname),
        uniqueImages: new Set([...document.querySelectorAll('.pricing-card-image img')].map(image => image.getAttribute('src'))).size,
        firstPrice: document.querySelector('.pricing-card .pricing-price strong')?.textContent.trim(),
        googleSheetLinks: document.querySelectorAll('a[href*="docs.google.com/spreadsheets"]').length,
        menuToggle: document.querySelectorAll('.pricing-menu-toggle').length
    })`);
    assert.equal(pricingState.products, 60, 'A página deve receber as 60 linhas da CIGA PRICCING');
    assert.equal(pricingState.cards, 60, 'A página deve renderizar os 60 itens da planilha');
    assert.equal(pricingState.uniqueImages, 52, 'As 52 imagens incorporadas devem ser reaproveitadas');
    assert.equal(pricingState.firstPrice, 'R$ 14.990,00', 'O primeiro preço deve vir da coluna BRAZIL WEB');
    assert.equal(pricingState.googleSheetLinks, 0, 'A página de preços não deve depender do Google Sheets');
    assert.equal(pricingState.menuToggle, 1);
    for (const pathname of [...new Set(pricingState.images)]) await checkResponse(pathname);

    const pricingSearchState = await pricing.client.evaluate(`(() => {
        const input = document.getElementById('pricingSearch');
        input.value = 'U055-TIGR-6B';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return {
            cards: document.querySelectorAll('.pricing-card').length,
            description: document.querySelector('.pricing-card h3')?.textContent
        };
    })()`);
    assert.equal(pricingSearchState.cards, 1, 'Busca da tabela deve localizar um SKU específico');
    assert.match(pricingSearchState.description, /Moon Walker/i);
    await closePage(pricing);

    const mobile = await openPage('/moon-walker/', { width: 390, height: 844 });
    const mobileState = await mobile.client.evaluate(`({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, navWidth: document.querySelector('.catalog-nav').getBoundingClientRect().width })`);
    assert(mobileState.scrollWidth <= mobileState.innerWidth + 1, `Overflow mobile: ${JSON.stringify(mobileState)}`);
    await closePage(mobile);

    const pricingMobile = await openPage('/precos/', { width: 390, height: 844 });
    const pricingMobileState = await pricingMobile.client.evaluate(`(() => {
        document.querySelector('.pricing-menu-toggle').click();
        return {
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            menuOpen: document.querySelector('.pricing-nav').classList.contains('pricing-menu-open'),
            menuVisible: !document.getElementById('pricingMenu').hidden
        };
    })()`);
    assert(pricingMobileState.scrollWidth <= pricingMobileState.innerWidth + 1, `Overflow na tabela mobile: ${JSON.stringify(pricingMobileState)}`);
    assert.equal(pricingMobileState.menuOpen, true);
    assert.equal(pricingMobileState.menuVisible, true);
    await closePage(pricingMobile);

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
