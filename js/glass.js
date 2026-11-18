/**
 * Desktop-only real optical glass refraction feature flag (Chromium desktop)
 * + cursor-tracked specular spotlight & prismatic rim on glass cards.
 */
export function initGlassSpotlight(prefersReducedMotion, isFinePointer) {
    const syncRefractionSupport = () => {
        const isDesktopChromium =
            typeof window.chrome !== 'undefined' &&
            isFinePointer &&
            window.innerWidth >= 1024;
        document.documentElement.classList.toggle('has-real-refraction', isDesktopChromium);
    };

    syncRefractionSupport();
    window.addEventListener('resize', syncRefractionSupport, { passive: true });

    if (prefersReducedMotion || !isFinePointer) return;

    document.querySelectorAll('.glass-card').forEach(card => {
        let rect = null;
        let rafId = 0;

        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', e => {
            if (!rect) rect = card.getBoundingClientRect();
            const clientX = e.clientX;
            const clientY = e.clientY;
            if (rafId) return;

            rafId = requestAnimationFrame(() => {
                if (rect) {
                    const x = ((clientX - rect.left) / rect.width) * 100;
                    const y = ((clientY - rect.top) / rect.height) * 100;
                    card.style.setProperty('--mouse-x', `${x.toFixed(2)}%`);
                    card.style.setProperty('--mouse-y', `${y.toFixed(2)}%`);
                }
                rafId = 0;
            });
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            rect = null;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
            }
        });
    });
}
