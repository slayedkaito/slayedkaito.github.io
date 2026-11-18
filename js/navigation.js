/**
 * Desktop navbar scroll state, active section spy, animated mobile drawer + burger morph,
 * and Apple-style quintic smooth anchor scrolling.
 */
export function initNavigation() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const sections = ['tentang', 'keahlian', 'proyek', 'publikasi']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    // 1. Active section spy
    if ('IntersectionObserver' in window && navLinks.length && sections.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const activeId = entry.target.id;
                navLinks.forEach(link => {
                    const isActive = link.dataset.navLink === activeId;
                    link.classList.toggle('text-white', isActive);
                    link.classList.toggle('text-white/75', !isActive);
                    if (isActive) {
                        link.setAttribute('aria-current', 'location');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // 2. Apple-style smooth quintic anchor scroll (instantly yields to user input)
    if (!prefersReducedMotion) {
        let scrollAnimId = 0;

        const cancelSmoothScroll = () => {
            if (scrollAnimId) {
                cancelAnimationFrame(scrollAnimId);
                scrollAnimId = 0;
            }
        };

        window.addEventListener('wheel', cancelSmoothScroll, { passive: true });
        window.addEventListener('touchstart', cancelSmoothScroll, { passive: true });

        const smoothScrollTo = targetY => {
            cancelSmoothScroll();
            const startY = window.scrollY;
            const distance = targetY - startY;
            if (Math.abs(distance) < 2) return;

            const duration = Math.min(1250, Math.max(680, Math.abs(distance) * 0.6));
            const startTime = performance.now();

            const easeInOutQuint = t =>
                t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

            const step = now => {
                const elapsed = now - startTime;
                const progress = Math.min(1, elapsed / duration);
                window.scrollTo({
                    top: startY + distance * easeInOutQuint(progress),
                    behavior: 'instant'
                });
                if (progress < 1) {
                    scrollAnimId = requestAnimationFrame(step);
                } else {
                    scrollAnimId = 0;
                }
            };

            scrollAnimId = requestAnimationFrame(step);
        };

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const offset = href === '#tentang' ? 0 : 88;
                const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
                smoothScrollTo(top);
                history.replaceState(null, '', href);
            });
        });
    }

    // 3. Smoothly animated mobile drawer + 3-bar hamburger morph
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        let isOpen = false;
        let closeTimer = 0;

        const setMenuState = open => {
            clearTimeout(closeTimer);
            isOpen = open;
            menuBtn.classList.toggle('is-open', open);
            mobileMenu.classList.toggle('is-open', open);
            menuBtn.setAttribute('aria-expanded', String(open));
            menuBtn.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
            mobileMenu.setAttribute('aria-hidden', String(!open));

            if ('inert' in mobileMenu) {
                if (open) {
                    mobileMenu.inert = false;
                } else {
                    // Wait for graceful reverse-cascade & fold-up animation before setting inert
                    closeTimer = setTimeout(() => {
                        if (!isOpen) mobileMenu.inert = true;
                    }, 680);
                }
            }
        };

        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        if ('inert' in mobileMenu) mobileMenu.inert = true;

        menuBtn.addEventListener('click', e => {
            e.stopPropagation();
            setMenuState(!isOpen);
        });

        mobileMenu.addEventListener('click', e => {
            e.stopPropagation();
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenuState(false));
        });

        document.addEventListener('click', e => {
            if (isOpen && navbar && !navbar.contains(e.target)) {
                setMenuState(false);
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && isOpen) {
                setMenuState(false);
                menuBtn.focus();
            }
        });
    }

    let lastScrolled = null;

    return {
        updateNavbar(scrollY) {
            if (!navbar) return;
            const scrolled = scrollY > 40;
            if (scrolled === lastScrolled) return;
            lastScrolled = scrolled;
            if (scrolled) {
                navbar.classList.add('nav-scrolled');
                navbar.classList.remove('border-transparent', 'py-5');
            } else {
                navbar.classList.remove('nav-scrolled');
                navbar.classList.add('border-transparent', 'py-5');
            }
        }
    };
}
