/**
 * Architectural scroll reveals, cascading bento stagger, and hairline dividers.
 */
export function initReveals(prefersReducedMotion) {
    // Auto-assign cascading stagger delays inside grouped grids
    document.querySelectorAll('[data-stagger-group]').forEach(group => {
        const items = group.querySelectorAll(':scope > .reveal');
        items.forEach((item, index) => {
            item.style.setProperty('--reveal-delay', `${index * 85}ms`);
        });
    });

    const revealTargets = document.querySelectorAll('.reveal, .heading-reveal');
    const dividerTargets = document.querySelectorAll('.section-divider');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('active'));
        dividerTargets.forEach(el => el.classList.add('divider-active'));
        return;
    }

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.addEventListener('transitionend', () => {
                el.style.willChange = 'auto';
            }, { once: true });
            requestAnimationFrame(() => el.classList.add('active'));
            obs.unobserve(el);
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

    revealTargets.forEach(el => revealObserver.observe(el));

    const dividerObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            requestAnimationFrame(() => entry.target.classList.add('divider-active'));
            obs.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });

    dividerTargets.forEach(el => dividerObserver.observe(el));
}
