(function () {
    'use strict';

    const products = Array.isArray(window.CIGA_PRICING) ? window.CIGA_PRICING : [];
    const grid = document.getElementById('pricingGrid');
    const search = document.getElementById('pricingSearch');
    const collection = document.getElementById('pricingCollection');
    const count = document.getElementById('pricingCount');
    const empty = document.getElementById('pricingEmpty');
    const nav = document.querySelector('.pricing-nav');
    const menu = document.getElementById('pricingMenu');
    const menuToggle = document.querySelector('.pricing-menu-toggle');

    const normalize = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    const collectionSlug = (value) => normalize(value).replace(/\s+/g, '-');

    function appendText(parent, tag, text, className) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        node.textContent = text;
        parent.appendChild(node);
        return node;
    }

    function createCard(product) {
        const card = document.createElement('article');
        card.className = 'pricing-card';

        const imageWrap = appendText(card, 'div', '', 'pricing-card-image');
        const image = document.createElement('img');
        image.src = product.image;
        image.alt = product.description;
        image.loading = 'lazy';
        imageWrap.appendChild(image);

        const body = appendText(card, 'div', '', 'pricing-card-body');
        const meta = appendText(body, 'div', '', 'pricing-card-meta');
        appendText(meta, 'span', `Item ${String(product.row - 1).padStart(2, '0')}`);
        appendText(meta, 'span', product.collection, 'pricing-card-collection');
        appendText(body, 'h3', product.description);

        const identifiers = appendText(body, 'div', '', 'pricing-identifiers');
        const sku = appendText(identifiers, 'span', '');
        appendText(sku, 'strong', 'SKU');
        sku.append(document.createTextNode(product.sku || 'Não informado'));
        if (product.code) {
            const code = appendText(identifiers, 'span', '');
            appendText(code, 'strong', 'Código');
            code.append(document.createTextNode(product.code));
        }

        const price = appendText(body, 'div', '', 'pricing-price');
        appendText(price, 'span', 'Brazil Web');
        appendText(price, 'strong', product.price);
        return card;
    }

    function render() {
        const term = normalize(search.value);
        const selectedCollection = collection.value;
        const visible = products.filter((product) => {
            const matchesCollection = selectedCollection === 'todos' || collectionSlug(product.collection) === selectedCollection;
            const searchable = normalize(`${product.description} ${product.sku} ${product.code} ${product.collection}`);
            return matchesCollection && (!term || searchable.includes(term));
        });

        const fragment = document.createDocumentFragment();
        visible.forEach((product) => fragment.appendChild(createCard(product)));
        grid.replaceChildren(fragment);
        count.textContent = `${visible.length} ${visible.length === 1 ? 'item encontrado' : 'itens encontrados'}`;
        empty.hidden = visible.length !== 0;
    }

    function closeMenu() {
        nav.classList.remove('pricing-menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        menu.hidden = true;
    }

    menuToggle.addEventListener('click', () => {
        const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
        nav.classList.toggle('pricing-menu-open', opening);
        menuToggle.setAttribute('aria-expanded', String(opening));
        menuToggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
        menu.hidden = !opening;
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('click', (event) => { if (!nav.contains(event.target)) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    search.addEventListener('input', render);
    collection.addEventListener('change', render);

    render();
})();
