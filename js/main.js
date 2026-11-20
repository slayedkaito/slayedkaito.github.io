import { initTheme } from './theme.js?v=20261120-1';
import { initReveals } from './reveals.js?v=20261120-1';
import { initNavigation } from './navigation.js?v=20261120-1';
import { initMobileDock, initDesktopNavLens } from './dock.js?v=20261120-1';
import { initGlassSpotlight } from './glass.js?v=20261120-1';
import { initScrollMotion } from './motion.js?v=20261120-1';
import { initLightbox } from './lightbox.js?v=20261120-1';
import { initTikTokEmbed } from './tiktok.js?v=20261120-1';

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    initTheme();
    initReveals(prefersReducedMotion);
    const { moveLensToId } = initMobileDock(prefersReducedMotion);
    const { moveNavLensToId } = initDesktopNavLens(prefersReducedMotion);
    const { updateNavbar } = initNavigation(activeId => {
        moveLensToId(activeId);
        moveNavLensToId(activeId);
    });
    initGlassSpotlight(prefersReducedMotion, isFinePointer);
    initScrollMotion(prefersReducedMotion, updateNavbar);
    initLightbox();
    initTikTokEmbed();
});
