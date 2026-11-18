/**
 * Dark / Light theme switcher with Apple/Linear circular View Transition ripple
 * originating from the toggle button, plus graceful crossfade fallback.
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

    const switchThemeSmoothly = (nextTheme, triggerEl) => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Progressive enhancement: Native View Transitions circular ripple from toggle button
        if (!reduced && typeof document.startViewTransition === 'function' && triggerEl) {
            const rect = triggerEl.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const maxRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            root.style.setProperty('--vt-x', `${x.toFixed(1)}px`);
            root.style.setProperty('--vt-y', `${y.toFixed(1)}px`);
            root.style.setProperty('--vt-r', `${Math.ceil(maxRadius)}px`);
            root.classList.add('vt-active');

            const vt = document.startViewTransition(() => {
                applyDomTheme(nextTheme);
            });

            vt.finished.finally(() => {
                root.classList.remove('vt-active');
            });
            return;
        }

        // Graceful smooth CSS crossfade fallback
        if (!reduced) {
            clearTimeout(transitionTimer);
            root.classList.add('theme-transition');
            transitionTimer = setTimeout(() => {
                root.classList.remove('theme-transition');
            }, 420);
        }
        applyDomTheme(nextTheme);
    };

    // Sync initial state (already applied pre-paint in <head>)
    const initial = root.dataset.theme === 'light' ? 'light' : 'dark';
    applyDomTheme(initial);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            switchThemeSmoothly(next, toggleBtn);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore storage restrictions
            }
        });
    }
}
