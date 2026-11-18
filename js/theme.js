/**
 * Dark / Light theme switcher with smooth macOS-style crossfade & localStorage persistence.
 */
const STORAGE_KEY = 'gtalfr-theme';

export function initTheme() {
    const root = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    let transitionTimer = 0;

    const applyTheme = (theme, animate = false) => {
        const isLight = theme === 'light';

        if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            clearTimeout(transitionTimer);
            root.classList.add('theme-transition');
            transitionTimer = setTimeout(() => {
                root.classList.remove('theme-transition');
            }, 380);
        }

        root.dataset.theme = isLight ? 'light' : 'dark';
        root.style.colorScheme = isLight ? 'light' : 'dark';

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isLight ? '#f5f7fb' : '#07090f');
        }

        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', String(isLight));
            toggleBtn.setAttribute(
                'aria-label',
                isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang'
            );
            toggleBtn.setAttribute(
                'title',
                isLight ? 'Mode Gelap' : 'Mode Terang'
            );
        }
    };

    const initial = root.dataset.theme === 'light' ? 'light' : 'dark';
    applyTheme(initial, false);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            applyTheme(next, true);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore storage restrictions
            }
        });
    }
}
