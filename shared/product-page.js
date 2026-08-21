(function () {
    'use strict';

    const slug = document.body.dataset.product;
    const product = window.CIGA_CATALOG && window.CIGA_CATALOG[slug];
    const root = document.getElementById('productPage');
    const pricingPageUrl = '../precos/';

    if (!root || !product) {
        if (root) root.innerHTML = '<p class="catalog-error">Produto não encontrado.</p>';
        return;
    }

    const availablePrices = product.prices.filter((item) => item.price).map((item) => item.price);
    const headlinePrice = availablePrices.length ? availablePrices[0] : 'Preço sob consulta';
    const priceRows = product.prices.map((item) => `
        <li>
            <span>${item.variant}</span>
            <strong>${item.price || 'Sob consulta'}</strong>
        </li>
    `).join('');
    const highlights = product.highlights.map((item) => `<li>${item}</li>`).join('');

    document.title = `${product.name} | CIGA design Brasil`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${product.name}: informações, preço no Brasil e registro de venda.`);

    root.innerHTML = `
        <header class="catalog-nav">
            <a href="../" class="catalog-logo" aria-label="Voltar à página de modelos"><img src="../imagens/ciga-logo.png" alt="CIGA design"></a>
            <button class="catalog-menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="catalogMenu">
                <span></span><span></span><span></span>
            </button>
            <nav class="catalog-menu" id="catalogMenu" aria-label="Menu da página" hidden>
                <a href="../#colecao" class="catalog-back">Todos os modelos</a>
                <a href="${pricingPageUrl}" class="catalog-pricing-link" data-pricing-page-link>Tabela de Preços</a>
            </nav>
        </header>
        <main>
            <section class="catalog-product-hero">
                <div class="catalog-product-image"><img src="${product.image}" alt="CIGA design ${product.name}"></div>
                <div class="hero-content catalog-product-copy">
                    <span class="catalog-eyebrow">Coleção ${product.collection}</span>
                    <h1 class="hero-title">${product.name}</h1>
                    <p class="hero-subtitle">${product.description}</p>
                    <div class="catalog-price-summary">
                        <span>${availablePrices.length ? 'A partir de' : 'Preço Brasil'}</span>
                        <strong>${headlinePrice}</strong>
                    </div>
                </div>
            </section>
            <section class="catalog-details">
                <article class="catalog-panel">
                    <span class="catalog-eyebrow">Destaques oficiais</span>
                    <h2>Engenharia e narrativa</h2>
                    <ul class="catalog-highlights">${highlights}</ul>
                </article>
                <article class="catalog-panel">
                    <span class="catalog-eyebrow">Preço Brasil</span>
                    <h2>Modelos e variantes</h2>
                    <ul class="catalog-price-list">${priceRows}</ul>
                    <p class="catalog-price-note">Valores obtidos da coluna “BRAZIL WEB” da planilha CIGA PRICCING. Modelos sem correspondência exata permanecem sob consulta.</p>
                </article>
            </section>
            <section class="catalog-official">
                <p>${product.sourceNote || 'Informações e imagem conferidas no catálogo global da CIGA design.'}</p>
                <a href="${product.officialUrl}" target="_blank" rel="noopener">${product.sourceLinkLabel || 'Ver página oficial do modelo ↗'}</a>
            </section>
        </main>
        <footer class="catalog-footer">
            <span>© 2026 CIGA design Brasil · JG Importadora Ltda</span>
            <a href="../#colecao">Voltar ao catálogo</a>
        </footer>
    `;

    const catalogNav = root.querySelector('.catalog-nav');
    const menuToggle = root.querySelector('.catalog-menu-toggle');
    const menu = root.querySelector('.catalog-menu');

    const closeMenu = () => {
        catalogNav.classList.remove('catalog-menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        menu.hidden = true;
    };

    menuToggle.addEventListener('click', () => {
        const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
        catalogNav.classList.toggle('catalog-menu-open', opening);
        menuToggle.setAttribute('aria-expanded', String(opening));
        menuToggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
        menu.hidden = !opening;
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('click', (event) => {
        if (!catalogNav.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
})();
