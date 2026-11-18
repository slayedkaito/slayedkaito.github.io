/**
 * Desktop navbar scroll state, active section spy, accessible mobile drawer,
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

            const duration = Math.min(920, Math.max(460, Math.abs(distance) * 0.45));
            const startTime = performance.now();

            // Quintic ease-in-out: silky launch + velvet Apple deceleration
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

    // 3. Accessible mobile drawer toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('menu-icon-open');
    const iconClose = document.getElementById('menu-icon-close');

    if (menuBtn && mobileMenu) {
        const setMenuState = isOpen => {
            mobileMenu.classList.toggle('hidden', !isOpen);
            iconOpen?.classList.toggle('hidden', isOpen);
            iconClose?.classList.toggle('hidden', !isOpen);
            menuBtn.setAttribute('aria-expanded', String(isOpen));
            menuBtn.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
        };

        menuBtn.addEventListener('click', () => {
            setMenuState(mobileMenu.classList.contains('hidden'));
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenuState(false));
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                setMenuState(false);
                menuBtn.focus();
            }
        });
    }

    return {
        updateNavbar(scrollY) {
            if (!navbar) return;
            if (scrollY > 40) {
                navbar.classList.add('nav-scrolled');
                navbar.classList.remove('border-transparent', 'py-5');
            } else {
                navbar.classList.remove('nav-scrolled');
                navbar.classList.add('border-transparent', 'py-5');
            }
        }
    };
}
