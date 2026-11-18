/**
 * Dark / Light theme switcher synced across header button & mobile bottom dock,
 * with velvety full-page View Transitions color crossfade + CSS fallback.
 */
const STORAGE_KEY = 'gtalfr-theme';

export function initTheme() {
    const root = document.documentElement;
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    let transitionTimer = 0;

    const applyDomTheme = theme => {
        const isLight = theme === 'light';
        root.dataset.theme = isLight ? 'light' : 'dark';
        root.style.colorScheme = isLight ? 'light' : 'dark';

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isLight ? '#f5f7fb' : '#07090f');
        }

        const label = isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang';
        const title = isLight ? 'Mode Gelap' : 'Mode Terang';

        toggleBtns.forEach(btn => {
            btn.setAttribute('aria-pressed', String(isLight));
            btn.setAttribute('aria-label', label);
            btn.setAttribute('title', title);
        });
    };

    const switchThemeSmoothly = nextTheme => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!reduced && typeof document.startViewTransition === 'function') {
            document.startViewTransition(() => {
                applyDomTheme(nextTheme);
            });
            return;
        }

        if (!reduced) {
            clearTimeout(transitionTimer);
            root.classList.add('theme-transition');
            transitionTimer = setTimeout(() => {
                root.classList.remove('theme-transition');
            }, 760);
        }
        applyDomTheme(nextTheme);
    };

    const initial = root.dataset.theme === 'light' ? 'light' : 'dark';
    applyDomTheme(initial);

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            switchThemeSmoothly(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore storage restrictions
            }
        });
    });
}
