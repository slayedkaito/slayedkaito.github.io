/**
 * Dark / Light theme switcher with localStorage persistence & theme-color sync.
 */
const STORAGE_KEY = 'gtalfr-theme';

export function initTheme() {
    const root = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    const applyTheme = theme => {
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
            toggleBtn.setAttribute(
                'title',
                isLight ? 'Mode Gelap' : 'Mode Terang'
            );
        }
    };

    // Sync initial state (already set pre-paint in <head>)
    const initial = root.dataset.theme === 'light' ? 'light' : 'dark';
    applyTheme(initial);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            applyTheme(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore storage restrictions in private browsing
            }
        });
    }
}
