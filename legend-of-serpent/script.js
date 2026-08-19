const navHeader = document.getElementById('navHeader');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navHeader) {
    window.addEventListener('scroll', () => {
        navHeader.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });
}

const getAnchorOffset = () => {
    const headerHeight = navHeader ? navHeader.offsetHeight : 0;
    return headerHeight + 16;
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const target = document.querySelector(anchor.getAttribute('href'));
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

const fadeElements = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach((element) => fadeObserver.observe(element));

    // Rolagem rapida ou salto por ancora pode passar pelo observer sem disparo,
    // deixando elementos invisiveis; este reforco revela o que ja entrou na tela.
    const revealMissed = () => {
        const limit = window.scrollY + window.innerHeight + 50;
        fadeElements.forEach((element) => {
            if (!element.classList.contains('visible') && element.getBoundingClientRect().top + window.scrollY < limit) {
                element.classList.add('visible');
                fadeObserver.unobserve(element);
            }
        });
    };
    window.addEventListener('scroll', revealMissed, { passive: true });
    window.addEventListener('load', revealMissed);
} else {
    fadeElements.forEach((element) => element.classList.add('visible'));
}

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('heroVideo');
    const unmuteBtn = document.getElementById('unmuteBtn');

    if (!video || !unmuteBtn) {
        return;
    }

    const updateUnmuteLabel = () => {
        unmuteBtn.textContent = video.muted ? 'Ativar som' : 'Desativar som';
    };

    video.muted = true;
    updateUnmuteLabel();

    const revealToggle = () => {
        unmuteBtn.style.display = 'inline-flex';
    };

    video.play().then(revealToggle).catch(revealToggle);

    unmuteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        updateUnmuteLabel();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.setAttribute('aria-label', 'Visualização ampliada');
    lightbox.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Fechar">&times;</button>
        <img class="lightbox-img" alt="">
        <span class="lightbox-hint">ESC ou clique fora para fechar</span>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
    };

    galleryItems.forEach((item) => {
        const img = item.querySelector('img');
        if (!img) return;
        item.style.cursor = 'zoom-in';
        item.addEventListener('click', (event) => {
            event.preventDefault();
            openLightbox(img.currentSrc || img.src, img.alt);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
