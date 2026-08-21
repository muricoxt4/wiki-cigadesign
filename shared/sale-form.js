(function () {
    'use strict';

    const currentScript = document.currentScript;
    if (currentScript && !document.querySelector('link[data-sale-form-style]')) {
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = new URL('sale-form.css', currentScript.src).href;
        stylesheet.dataset.saleFormStyle = '';
        document.head.appendChild(stylesheet);
    }

    const pricingSheetUrl = 'https://docs.google.com/spreadsheets/d/1ObSm5woDBo3rejyG67yWBrVyWDGTEnr35Djx_tufVYc/edit';
    const legacyNavLinks = document.querySelector('.nav-links');
    const catalogNav = document.querySelector('.catalog-nav');

    if (legacyNavLinks && !legacyNavLinks.querySelector('[data-pricing-sheet-link]')) {
        const item = document.createElement('li');
        item.innerHTML = `<a href="${pricingSheetUrl}" target="_blank" rel="noopener" data-pricing-sheet-link>Planilha de Preços</a>`;
        legacyNavLinks.appendChild(item);
    }

    if (catalogNav && !catalogNav.querySelector('[data-pricing-sheet-link]')) {
        const pricingLink = document.createElement('a');
        pricingLink.href = pricingSheetUrl;
        pricingLink.target = '_blank';
        pricingLink.rel = 'noopener';
        pricingLink.className = 'sale-pricing-header-link';
        pricingLink.dataset.pricingSheetLink = '';
        pricingLink.textContent = 'Planilha de Preços ↗';
        catalogNav.querySelector('.catalog-back')?.insertAdjacentElement('beforebegin', pricingLink);
        catalogNav.classList.add('sale-pricing-nav-active');
    }

    const titleNode = document.querySelector('.hero-title');
    const heroContent = document.querySelector('.hero-content');
    const footer = document.querySelector('footer');
    if (!titleNode || !heroContent || !footer || document.getElementById('formulario-venda')) return;

    const model = titleNode.textContent.replace(/\s+/g, ' ').trim();
    const currentPriceSummary = heroContent.querySelector('.catalog-price-summary');
    const priceValueNode = document.querySelector('.purchase-price-value');
    const priceLabelNode = document.querySelector('.purchase-price-label');
    let topPrice = currentPriceSummary;

    if (!topPrice && priceValueNode) {
        topPrice = document.createElement('div');
        topPrice.innerHTML = `
            <span>${priceLabelNode?.textContent.trim() || 'Preço Brasil'}</span>
            <strong>${priceValueNode.textContent.trim()}</strong>
        `;
    }

    if (topPrice) {
        topPrice.classList.add('sale-top-price');
        topPrice.setAttribute('aria-label', `Preço de ${model}`);
        titleNode.insertAdjacentElement('afterend', topPrice);
        heroContent.classList.add('sale-price-promoted');
    }

    const sellButton = document.createElement('a');
    sellButton.href = '#formulario-venda';
    sellButton.className = 'sale-hero-btn';
    sellButton.textContent = 'VENDER';
    sellButton.addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('formulario-venda')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    heroContent.appendChild(sellButton);

    const section = document.createElement('section');
    section.id = 'formulario-venda';
    section.className = 'sale-section';
    section.innerHTML = `
        <div class="sale-shell">
            <div class="sale-intro">
                <span class="sale-eyebrow">Registro comercial</span>
                <h2>Registrar venda</h2>
                <p>Preencha os dados para registrar a venda do <strong>${model}</strong>. Os dados serão enviados diretamente à planilha comercial.</p>
                <p class="sale-privacy">Dados pessoais utilizados exclusivamente para identificação e controle desta venda.</p>
            </div>
            <form class="sale-form" novalidate>
                <input type="hidden" name="modelo" value="${model.replace(/"/g, '&quot;')}">
                <input type="hidden" name="pagina" value="${window.location.href}">
                <input type="hidden" name="iniciadoEm" value="${new Date().toISOString()}">
                <div class="sale-honeypot" aria-hidden="true"><label>Empresa<input type="text" name="empresa" tabindex="-1" autocomplete="off"></label></div>
                <label class="sale-field"><span>Nome</span><input type="text" name="nome" autocomplete="name" maxlength="120" required></label>
                <label class="sale-field"><span>E-mail</span><input type="email" name="email" autocomplete="email" maxlength="160" required></label>
                <label class="sale-field"><span>Telefone</span><input type="tel" name="telefone" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="(00) 00000-0000" required></label>
                <label class="sale-field"><span>CPF ou CNPJ</span><input type="text" name="documento" inputmode="numeric" maxlength="18" placeholder="Somente números" required></label>
                <label class="sale-field"><span>SKU</span><input type="text" name="sku" autocomplete="off" maxlength="100" required></label>
                <label class="sale-field"><span>Código de venda</span><input type="text" name="codigoVenda" maxlength="80" required></label>
                <p class="sale-form-error" role="alert" aria-live="polite"></p>
                <button type="submit" class="sale-submit"><span>Enviar venda</span></button>
            </form>
        </div>
    `;

    const insertionPoint = document.querySelector('.back-to-menu-section') || footer;
    insertionPoint.parentNode.insertBefore(section, insertionPoint);

    const popup = document.createElement('div');
    popup.className = 'sale-popup';
    popup.hidden = true;
    popup.innerHTML = `
        <div class="sale-popup-card" role="dialog" aria-modal="true" aria-labelledby="salePopupTitle">
            <div class="sale-popup-icon" aria-hidden="true"></div>
            <h2 id="salePopupTitle"></h2>
            <p></p>
            <button type="button">Fechar</button>
        </div>
    `;
    document.body.appendChild(popup);

    const closePopup = () => {
        popup.hidden = true;
        document.body.classList.remove('sale-popup-open');
        sellButton.focus();
    };
    popup.querySelector('button').addEventListener('click', closePopup);
    popup.addEventListener('click', (event) => { if (event.target === popup) closePopup(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !popup.hidden) closePopup(); });

    const showPopup = (success, message) => {
        popup.classList.toggle('sale-popup--success', success);
        popup.classList.toggle('sale-popup--error', !success);
        popup.querySelector('h2').textContent = success ? 'Venda registrada' : 'Não foi possível enviar';
        popup.querySelector('p').textContent = message;
        popup.hidden = false;
        document.body.classList.add('sale-popup-open');
        popup.querySelector('button').focus();
    };

    const onlyDigits = (value) => value.replace(/\D/g, '');
    const formatPhone = (value) => {
        const digits = onlyDigits(value).slice(0, 11);
        if (digits.length <= 10) return digits.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_, a, b, c) => `(${a}) ${b}${c ? `-${c}` : ''}`).trim();
        return digits.replace(/(\d{2})(\d{0,5})(\d{0,4})/, (_, a, b, c) => `(${a}) ${b}${c ? `-${c}` : ''}`).trim();
    };
    const formatDocument = (value) => {
        const digits = onlyDigits(value).slice(0, 14);
        if (digits.length <= 11) return digits.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_, a, b, c, d) => [a, b, c].filter(Boolean).join('.') + (d ? `-${d}` : ''));
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, a, b, c, d, e) => `${a}.${b}.${c}/${d}${e ? `-${e}` : ''}`);
    };

    const submitToAppsScript = (endpoint, payload) => new Promise((resolve, reject) => {
        const token = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const frameName = `ciga-sales-${token.replace(/[^a-z0-9]/gi, '')}`;
        const frame = document.createElement('iframe');
        const transportForm = document.createElement('form');
        let settled = false;

        frame.name = frameName;
        frame.title = 'Envio seguro do registro de venda';
        frame.hidden = true;
        transportForm.method = 'POST';
        transportForm.action = endpoint;
        transportForm.target = frameName;
        transportForm.hidden = true;

        const cleanup = () => {
            window.removeEventListener('message', handleMessage);
            frame.remove();
            transportForm.remove();
        };
        const finish = (callback) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            cleanup();
            callback();
        };
        const handleMessage = (event) => {
            const data = event.data;
            if (event.source !== frame.contentWindow || !data || data.source !== 'ciga-sales' || data.token !== token) return;
            finish(() => data.ok ? resolve(data) : reject(new Error(data.message || 'O servidor recusou o registro.')));
        };
        const timeout = window.setTimeout(() => {
            finish(() => reject(new Error('A solicitação demorou demais. Verifique sua conexão e tente novamente.')));
        }, 15000);

        window.addEventListener('message', handleMessage);
        Object.entries({ ...payload, callbackToken: token }).forEach(([name, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = String(value == null ? '' : value);
            transportForm.appendChild(input);
        });
        document.body.append(frame, transportForm);
        transportForm.submit();
    });

    const form = section.querySelector('.sale-form');
    const phoneInput = form.elements.telefone;
    const documentInput = form.elements.documento;
    phoneInput.addEventListener('input', () => { phoneInput.value = formatPhone(phoneInput.value); });
    documentInput.addEventListener('input', () => { documentInput.value = formatDocument(documentInput.value); });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const errorNode = form.querySelector('.sale-form-error');
        const submit = form.querySelector('.sale-submit');
        errorNode.textContent = '';

        if (!form.reportValidity()) return;
        const documentDigits = onlyDigits(documentInput.value);
        const phoneDigits = onlyDigits(phoneInput.value);
        if (![11, 14].includes(documentDigits.length)) {
            errorNode.textContent = 'Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.';
            documentInput.focus();
            return;
        }
        if (phoneDigits.length < 10) {
            errorNode.textContent = 'Informe um telefone válido com DDD.';
            phoneInput.focus();
            return;
        }

        const endpoint = String(window.CIGA_SALES_ENDPOINT || '').trim();
        if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) {
            showPopup(false, 'A integração ainda não foi configurada. Informe a URL /exec no arquivo shared/sale-form-config.js.');
            return;
        }

        const payload = Object.fromEntries(new FormData(form).entries());
        payload.telefone = phoneDigits;
        payload.documento = documentDigits;
        submit.disabled = true;
        submit.querySelector('span').textContent = 'Enviando…';

        try {
            const result = await submitToAppsScript(endpoint, payload);
            form.reset();
            form.elements.modelo.value = model;
            form.elements.pagina.value = window.location.href;
            form.elements.iniciadoEm.value = new Date().toISOString();
            showPopup(true, result.message || 'Os dados foram enviados para a planilha com sucesso.');
        } catch (error) {
            showPopup(false, error.message || 'Verifique a conexão e tente novamente.');
        } finally {
            submit.disabled = false;
            submit.querySelector('span').textContent = 'Enviar venda';
        }
    });
})();
