/**
 * CIGA design Brasil · Homepage · Presskit Index
 * script.js
 */

(function () {
    'use strict';

    const navHeader = document.getElementById('navHeader');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (navHeader) {
        window.addEventListener('scroll', () => {
            navHeader.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    const navToggle = document.querySelector('.nav-toggle');

    if (navHeader && navToggle) {
        navToggle.addEventListener('click', () => {
            const isOpen = navHeader.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        document.querySelectorAll('.nav-links a').forEach((link) => {
            link.addEventListener('click', () => {
                navHeader.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const getAnchorOffset = () => {
        const headerHeight = navHeader ? navHeader.offsetHeight : 0;
        return headerHeight + 16;
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) {
                return;
            }

            event.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - getAnchorOffset();
            window.scrollTo({
                top,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    const watchCards = document.querySelectorAll('.watch-card');
    const searchInput = document.getElementById('watchSearch');
    const resultCount = document.getElementById('catalogResultCount');
    const emptyState = document.getElementById('catalogEmpty');
    let activeFilter = 'todos';

    const catalogMeta = {
        'skeleton-edge-exploration': { collection: 'outros', price: 'R$ 3.590,00', keywords: 'exploration skeleton série z' },
        hunter: { collection: 'edge', price: 'R$ 5.990,00', keywords: 'hunter automatic carbon black silver black gold' },
        edge: { collection: 'edge', price: 'R$ 2.990,00', keywords: 'edge série z titanium dlc' },
        skeleton: { collection: 'outros', price: 'R$ 1.690,00', keywords: 'skeleton série c full hollow' },
        'eye-of-horus': { collection: 'outros', price: 'R$ 2.490,00', keywords: 'eye horus série x' },
        'legend-of-serpent': { collection: 'zodiac', price: 'R$ 14.990,00', keywords: 'legend serpent serpente zodiac' },
        cigaBluePlanet: { collection: 'aventur', price: 'R$ 11.990,00', keywords: 'blue planet ii aventur gphg' },
        'blue-planet-ii-gilded-age': { collection: 'aventur', price: 'R$ 19.990,00', keywords: 'blue planet gilded age gold aventur' },
        magician: { collection: 'outros', price: 'R$ 5.990,00', keywords: 'magician série m fancy shadow' },
        'eastern-jade': { collection: 'outros', price: 'R$ 3.990,00', keywords: 'eastern jade série y' },
        machina: { collection: 'outros', price: 'R$ 3.990,00', keywords: 'machina x ki série x purple white' },
        gorilla: { collection: 'outros', price: 'R$ 3.790,00', keywords: 'gorilla série x' },
        'ice-age': { collection: 'aventur', price: 'R$ 14.990,00', keywords: 'ice age glacier blue aventur feminino' },
        'moon-walker': { collection: 'aventur', price: 'R$ 16.990,00', keywords: 'moon walker lua aventur' },
        'blue-planet-black-star': { collection: 'aventur', price: 'R$ 19.800,00', keywords: 'black star label noir aventur' },
        'blue-planet-atlantic': { collection: 'aventur', price: 'R$ 11.990,00', keywords: 'atlantic ocean blue planet aventur' },
        'hunter-tourbillon': { collection: 'edge', price: 'R$ 19.990,00', keywords: 'hunter tourbillon edge' },
        'hunter-vintage': { collection: 'edge', price: null, keywords: 'hunter vintage rose sand brown gold edge' },
        'hunter-titanium': { collection: 'edge', price: 'R$ 8.990,00', keywords: 'hunter titanium titânio edge' },
        vector: { collection: 'edge', price: 'R$ 6.990,00', keywords: 'vector racing carbon titanium steel edge' },
        falcon: { collection: 'edge', price: 'R$ 4.990,00', keywords: 'falcon round skeleton edge' },
        'everest-summit': { collection: 'everest', price: 'R$ 26.990,00', keywords: 'everest summit central tourbillon' },
        'everest-70th-anniversary': { collection: 'everest', price: null, keywords: 'everest 70th anniversary tourbillon' },
        'zodiac-dragon': { collection: 'zodiac', price: null, keywords: 'chinese zodiac dragon dragão tourbillon' },
        'zodiac-horse': { collection: 'zodiac', price: null, keywords: 'chinese zodiac horse cavalo tourbillon' },
        'time-cipher': { collection: 'outros', price: 'R$ 8.990,00', keywords: 'time cipher wandering hour horas errantes' },
        'aircraft-carrier': { collection: 'outros', price: 'R$ 3.890,00', keywords: 'aircraft carrier porta aviões z061 black blue legado' },
        'everest-65th-anniversary': { collection: 'everest', price: 'R$ 16.990,00', keywords: 'everest china 65th anniversary automaton u053 tt01' }
    };

    const normalize = (value) => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    watchCards.forEach((card) => {
        const href = card.querySelector('.watch-card-btn')?.getAttribute('href') || '';
        const slug = href.replace(/^\.\//, '').replace(/\/$/, '');
        const meta = catalogMeta[slug] || {};
        card.dataset.collection = meta.collection || card.dataset.collection || 'outros';
        card.dataset.search = normalize(`${card.textContent} ${meta.keywords || ''} ${card.dataset.collection}`);

        if (!card.querySelector('.watch-card-price')) {
            const price = document.createElement('p');
            price.className = `watch-card-price${meta.price ? '' : ' watch-card-price--consult'}`;
            price.textContent = meta.price ? `A partir de ${meta.price}` : 'Preço sob consulta';
            card.querySelector('.watch-card-btn')?.before(price);
        }
    });

    const applyFilters = () => {
        const query = normalize(searchInput ? searchInput.value : '');
        let visibleCount = 0;

        watchCards.forEach((card) => {
            const matchesCollection = activeFilter === 'todos' || card.dataset.collection === activeFilter;
            const matchesSearch = !query || card.dataset.search.includes(query);
            const isMatch = matchesCollection && matchesSearch;
            card.classList.toggle('hidden', !isMatch);
            card.style.gridColumn = '';
            if (isMatch) visibleCount += 1;

            if (isMatch && !prefersReducedMotion) {
                card.style.animation = 'cardReveal 0.4s ease both';
            } else {
                card.style.animation = '';
            }
        });

        if (resultCount) resultCount.textContent = String(visibleCount);
        if (emptyState) emptyState.hidden = visibleCount !== 0;
    };

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((button) => button.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            applyFilters();
        });
    });
    searchInput?.addEventListener('input', applyFilters);
    applyFilters();

    const revealStyle = document.createElement('style');
    revealStyle.textContent = `
        @keyframes cardReveal {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .watch-card { opacity: 0; transform: translateY(20px); }
        .watch-card.visible {
            animation: cardReveal 0.55s cubic-bezier(0.4, 0, 0.2, 1) both;
            opacity: 1; transform: none;
        }
    `;
    document.head.appendChild(revealStyle);

    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const idx = Array.from(watchCards).indexOf(entry.target);
                if (!prefersReducedMotion) {
                    entry.target.style.animationDelay = `${(idx % 4) * 80}ms`;
                }
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        watchCards.forEach((card) => cardObserver.observe(card));

        const fadeStyle = document.createElement('style');
        fadeStyle.textContent = `
            .about-inner, .contact-inner {
                opacity: 0; transform: translateY(24px);
                transition: opacity 0.7s ease, transform 0.7s ease;
            }
            .about-inner.visible, .contact-inner.visible {
                opacity: 1; transform: none;
            }
        `;
        document.head.appendChild(fadeStyle);

        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.about-inner, .contact-inner').forEach((element) => fadeObserver.observe(element));

        const statNumbers = document.querySelectorAll('.hero-stat-number');
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const el = entry.target;
                const text = el.textContent.trim();

                if (prefersReducedMotion) {
                    statsObserver.unobserve(el);
                    return;
                }

                const dur = 1200;
                const run = (from, to, suffix, decimals) => {
                    const started = performance.now();
                    const tick = (now) => {
                        const p = Math.min((now - started) / dur, 1);
                        const ease = 1 - Math.pow(1 - p, 4);
                        el.textContent = (from + (to - from) * ease).toFixed(decimals) + suffix;
                        if (p < 1) {
                            requestAnimationFrame(tick);
                        }
                    };
                    requestAnimationFrame(tick);
                };

                if (text === '26') run(0, 26, '', 0);
                if (text === '1') run(0, 1, '', 0);
                if (text === '23.5K+') run(0, 23.5, 'K+', 1);

                statsObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        statNumbers.forEach((el) => statsObserver.observe(el));

        // Rolagem rápida ou salto por âncora pode passar pelos observers sem disparo,
        // deixando cards e seções invisíveis; este reforço revela o que já entrou na tela.
        const revealMissed = () => {
            const limit = window.scrollY + window.innerHeight + 50;
            watchCards.forEach((card) => {
                if (!card.classList.contains('visible') && card.getBoundingClientRect().top + window.scrollY < limit) {
                    card.classList.add('visible');
                    cardObserver.unobserve(card);
                }
            });
            document.querySelectorAll('.about-inner, .contact-inner').forEach((element) => {
                if (!element.classList.contains('visible') && element.getBoundingClientRect().top + window.scrollY < limit) {
                    element.classList.add('visible');
                    fadeObserver.unobserve(element);
                }
            });
        };
        window.addEventListener('scroll', revealMissed, { passive: true });
        window.addEventListener('load', revealMissed);
    } else {
        watchCards.forEach((card) => card.classList.add('visible'));
        document.querySelectorAll('.about-inner, .contact-inner').forEach((element) => element.classList.add('visible'));
    }

    const grid = document.querySelector('.watches-grid');
    if (grid) {
        grid.addEventListener('mousemove', (event) => {
            const rect = grid.getBoundingClientRect();
            grid.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
            grid.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
        }, { passive: true });
    }
})();
