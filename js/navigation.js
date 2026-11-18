/**
 * Desktop navbar scroll state, active section spy, and accessible mobile drawer.
 */
export function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const sections = ['tentang', 'keahlian', 'proyek', 'publikasi']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    // Active section indicator in navbar
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

    // Accessible mobile drawer toggle
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
