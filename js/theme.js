/**
 * Dark / Light theme switcher synced across desktop nav menu & mobile menu drawer.
 */
const STORAGE_KEY = 'gtalfr-theme';

export function initTheme() {
    const root = document.documentElement;
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    const toggleLabels = document.querySelectorAll('[data-theme-label]');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    const applyTheme = theme => {
        const isLight = theme === 'light';
        root.dataset.theme = isLight ? 'light' : 'dark';
        root.style.colorScheme = isLight ? 'light' : 'dark';

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isLight ? '#f5f7fb' : '#07090f');
        }

        const labelText = isLight ? 'Mode Gelap' : 'Mode Terang';
        const ariaLabel = isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang';

        toggleBtns.forEach(btn => {
            btn.setAttribute('aria-pressed', String(isLight));
            btn.setAttribute('aria-label', ariaLabel);
            btn.setAttribute('title', labelText);
        });

        toggleLabels.forEach(el => {
            el.textContent = labelText;
        });
    };

    const initial = root.dataset.theme === 'light' ? 'light' : 'dark';
    applyTheme(initial);

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            applyTheme(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore storage restrictions
            }
        });
    });
}
