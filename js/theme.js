/**
 * Dark / Light theme switcher with velvety macOS-style full-page color & gradient crossfade
 * via View Transitions API, plus full CSS transition fallback.
 */
const STORAGE_KEY = 'gtalfr-theme';

export function initTheme() {
    const root = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    let transitionTimer = 0;

    const applyDomTheme = theme => {
        const isLight = theme === 'light';
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
            toggleBtn.setAttribute('title', isLight ? 'Mode Gelap' : 'Mode Terang');
        }
    };

    const switchThemeSmoothly = nextTheme => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Native View Transitions smooth full-page color & gradient crossfade (120fps GPU)
        if (!reduced && typeof document.startViewTransition === 'function') {
            document.startViewTransition(() => {
                applyDomTheme(nextTheme);
            });
            return;
        }

        // Smooth CSS crossfade fallback for browsers without View Transitions API
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

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            switchThemeSmoothly(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore storage restrictions
            }
        });
    }
}
