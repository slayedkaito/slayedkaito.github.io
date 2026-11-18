import { initTheme } from './theme.js?v=20261118-12';
import { initReveals } from './reveals.js?v=20261118-12';
import { initNavigation } from './navigation.js?v=20261118-12';
import { initGlassSpotlight } from './glass.js?v=20261118-12';
import { initScrollMotion } from './motion.js?v=20261118-12';
import { initLightbox } from './lightbox.js?v=20261118-12';
import { initTikTokEmbed } from './tiktok.js?v=20261118-12';

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
