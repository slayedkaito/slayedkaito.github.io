/**
 * iOS 26 Liquid Glass interactive mobile dock controller:
 * - Sliding elastic glass lens pill (#dock-lens) between active tabs.
 * - Thumb press & horizontal drag-to-scrub across dock items.
 * - Tactile icon spring bounce + subtle haptic pulse (when supported).
 */
export function initMobileDock(prefersReducedMotion) {
    const dock = document.getElementById('mobile-dock');
    const lens = document.getElementById('dock-lens');
    const tabLinks = Array.from(document.querySelectorAll('[data-dock-link]'));
    const allButtons = Array.from(document.querySelectorAll('#mobile-dock a, #mobile-dock button'));

    if (!dock || !lens || !tabLinks.length) {
        return { moveLensToId() {} };
    }

    let activeLink = tabLinks[0];
    let stretchTimer = 0;
    let isDragging = false;
    let tabRects = [];
    let dockRect = null;
    let hoveredLink = null;
    let startX = 0;
    let movedEnough = false;

    const pulseHaptic = (ms = 8) => {
        if (!prefersReducedMotion && typeof navigator.vibrate === 'function') {
            try { navigator.vibrate(ms); } catch {}
        }
    };

    const positionLens = (targetEl, { elastic = false, immediate = false } = {}) => {
        if (!targetEl) return;
        const left = targetEl.offsetLeft;
        const width = targetEl.offsetWidth;
        if (!width) return;

        if (immediate || prefersReducedMotion) {
            lens.classList.add('no-transition');
        } else {
            lens.classList.remove('no-transition');
        }

        lens.style.width = `${width}px`;
        lens.style.transform = `translate3d(${left}px, 0, 0)`;
        lens.classList.add('is-ready');

        if (elastic && !prefersReducedMotion) {
            clearTimeout(stretchTimer);
            lens.classList.add('is-stretching');
            stretchTimer = setTimeout(() => {
                lens.classList.remove('is-stretching');
            }, 220);
        }

        if (immediate) {
            requestAnimationFrame(() => lens.classList.remove('no-transition'));
        }
    };

    const triggerBounce = el => {
        if (prefersReducedMotion || !el) return;
        el.classList.remove('is-bouncing');
        // Restart animation cleanly
        void el.offsetWidth;
        el.classList.add('is-bouncing');
        el.addEventListener('animationend', () => el.classList.remove('is-bouncing'), { once: true });
    };

    // Tactile press feedback on all dock buttons (including theme toggle)
    allButtons.forEach(btn => {
        btn.addEventListener('pointerdown', () => {
            btn.classList.add('is-pressed');
            dock.classList.add('is-touching');
            pulseHaptic(6);
        }, { passive: true });

        const release = () => {
            btn.classList.remove('is-pressed');
            if (!isDragging) dock.classList.remove('is-touching');
        };

        btn.addEventListener('pointerup', () => {
            release();
            triggerBounce(btn);
        }, { passive: true });

        btn.addEventListener('pointercancel', release, { passive: true });
        btn.addEventListener('pointerleave', release, { passive: true });
    });

    // Click handler for immediate elastic pill glide on tap
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            activeLink = link;
            tabLinks.forEach(l => l.classList.toggle('is-active', l === link));
            positionLens(link, { elastic: true });
        });
    });

    // iOS 26 Thumb Drag-to-Scrub across dock tabs
    const cacheTabMetrics = () => {
        dockRect = dock.getBoundingClientRect();
        tabRects = tabLinks.map(el => ({
            el,
            left: el.offsetLeft,
            width: el.offsetWidth,
            rect: el.getBoundingClientRect()
        }));
    };

    dock.addEventListener('pointerdown', e => {
        const hitTab = e.target.closest('[data-dock-link]');
        if (!hitTab || prefersReducedMotion) return;
        cacheTabMetrics();
        isDragging = true;
        movedEnough = false;
        startX = e.clientX;
        hoveredLink = hitTab;
        dock.classList.add('is-touching');
    }, { passive: true });

    window.addEventListener('pointermove', e => {
        if (!isDragging || !dockRect || !tabRects.length) return;
        const dx = Math.abs(e.clientX - startX);
        if (!movedEnough && dx > 10) {
            movedEnough = true;
            lens.classList.add('is-dragging');
        }
        if (!movedEnough) return;

        const first = tabRects[0];
        const last = tabRects[tabRects.length - 1];
        const minLeft = first.left;
        const maxLeft = last.left + last.width - first.width;

        // Track thumb smoothly inside dock rail
        const relX = e.clientX - dockRect.left;
        let closest = tabRects[0];
        let minDist = Infinity;
        for (let i = 0; i < tabRects.length; i++) {
            const t = tabRects[i];
            const center = t.left + t.width * 0.5;
            const dist = Math.abs(relX - center);
            if (dist < minDist) {
                minDist = dist;
                closest = t;
            }
        }

        const clampedLeft = Math.max(minLeft, Math.min(maxLeft, relX - closest.width * 0.5));
        lens.classList.add('no-transition');
        lens.style.width = `${closest.width}px`;
        lens.style.transform = `translate3d(${clampedLeft.toFixed(1)}px, 0, 0)`;

        if (hoveredLink !== closest.el) {
            hoveredLink = closest.el;
            tabLinks.forEach(l => l.classList.toggle('is-hover-drag', l === hoveredLink));
            pulseHaptic(5);
        }
    }, { passive: true });

    const finishDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        dock.classList.remove('is-touching');
        lens.classList.remove('is-dragging', 'no-transition');
        tabLinks.forEach(l => l.classList.remove('is-hover-drag'));

        if (movedEnough && hoveredLink) {
            const target = hoveredLink;
            activeLink = target;
            tabLinks.forEach(l => l.classList.toggle('is-active', l === target));
            positionLens(target, { elastic: true });
            triggerBounce(target);
            // Navigate to the scrubbed section
            target.click();
        } else if (activeLink) {
            positionLens(activeLink, { elastic: false });
        }
        hoveredLink = null;
        movedEnough = false;
    };

    window.addEventListener('pointerup', finishDrag, { passive: true });
    window.addEventListener('pointercancel', finishDrag, { passive: true });

    // Re-align lens on resize or when dock becomes visible
    window.addEventListener('resize', () => {
        if (activeLink) positionLens(activeLink, { immediate: true });
    }, { passive: true });

    requestAnimationFrame(() => positionLens(activeLink, { immediate: true }));

    return {
        moveLensToId(sectionId) {
            if (isDragging) return;
            const match = tabLinks.find(l => l.dataset.dockLink === sectionId);
            if (!match) return;
            activeLink = match;
            positionLens(match, { elastic: true });
        }
    };
}
