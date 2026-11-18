import { initTheme } from './theme.js';
import { initReveals } from './reveals.js';
import { initNavigation } from './navigation.js';
import { initGlassSpotlight } from './glass.js';
import { initScrollMotion } from './motion.js';
import { initLightbox } from './lightbox.js';
import { initTikTokEmbed } from './tiktok.js';

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    initTheme();
    initReveals(prefersReducedMotion);
    const { updateNavbar } = initNavigation();
    initGlassSpotlight(prefersReducedMotion, isFinePointer);
    initScrollMotion(prefersReducedMotion, updateNavbar);
    initLightbox();
    initTikTokEmbed();
});
