(function () {
    'use strict';

    const slug = document.body.dataset.product;
    const product = window.CIGA_CATALOG && window.CIGA_CATALOG[slug];
    const root = document.getElementById('productPage');

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
            <a href="../#colecao" class="catalog-back">← Todos os modelos</a>
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
                <p>Informações e imagem conferidas no catálogo global da CIGA design.</p>
                <a href="${product.officialUrl}" target="_blank" rel="noopener">Ver página oficial do modelo ↗</a>
            </section>
        </main>
        <footer class="catalog-footer">
            <span>© 2026 CIGA design Brasil · JG Importadora Ltda</span>
            <a href="../#colecao">Voltar ao catálogo</a>
        </footer>
    `;
})();
