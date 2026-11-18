/**
 * Apple-style fluid scroll choreography engine.
 * - Frame-rate-independent exponential damping (identical feel on 60Hz, 120Hz & 144Hz).
 * - Zero layout reflow inside rAF (metrics cached via ResizeObserver / resize).
 * - Auto-sleeps at 0% CPU when scrolling settles.
 */
export function initScrollMotion(prefersReducedMotion, onScrollNavbar) {
    const progressBar = document.getElementById('scroll-progress');
    const heroBgImg = document.getElementById('hero-bg-img');
    const heroSection = document.getElementById('tentang');
    const heroContent = document.getElementById('hero-content');
    const heroScrollCue = document.getElementById('hero-scroll-cue');
    const iosGallery = document.getElementById('ios-gallery');
    const parallaxItems = Array.from(document.querySelectorAll('[data-parallax-speed]'))
        .map(el => ({
            el,
            frame: el.querySelector('.device-frame'),
            speed: Number(el.dataset.parallaxSpeed) || 0,
        }))
        .filter(item => item.frame);

    const ambientStage = document.getElementById('ambient-stage');
    const moodLayers = Array.from(document.querySelectorAll('[data-ambient-mood]'));
    const moodSections = Array.from(document.querySelectorAll('[data-bg-mood]'));
    const primaryOrbs = Array.from(document.querySelectorAll('.ambient-orb-primary'));
    const secondaryOrbs = Array.from(document.querySelectorAll('.ambient-orb-secondary'));

    // Cached layout metrics (never read layout inside rAF!)
    const metrics = {
        vh: window.innerHeight || 1,
        vw: window.innerWidth || 1,
        maxScroll: 1,
        heroH: window.innerHeight || 1,
        galleryTop: 0,
        galleryH: 0,
    };

    const measureLayout = () => {
        const y = window.scrollY;
        metrics.vh = window.innerHeight || 1;
        metrics.vw = window.innerWidth || 1;
        metrics.maxScroll = Math.max(1, document.documentElement.scrollHeight - metrics.vh);
        metrics.heroH = heroSection ? heroSection.offsetHeight || metrics.vh : metrics.vh;

        if (iosGallery) {
            const rect = iosGallery.getBoundingClientRect();
            metrics.galleryTop = rect.top + y;
            metrics.galleryH = rect.height || 1;
        }
    };

    measureLayout();

    // Re-measure when document height shifts (e.g. TikTok embed finishes loading)
    if ('ResizeObserver' in window) {
        let resizeDebounce = 0;
        const ro = new ResizeObserver(() => {
            clearTimeout(resizeDebounce);
            resizeDebounce = setTimeout(() => {
                measureLayout();
                kickLoop();
            }, 120);
        });
        ro.observe(document.body);
    }

    // Contextual dark/light mood switching per visible section
    let currentMood = 'keahlian';
    const setActiveMood = moodName => {
        if (!moodName || moodName === currentMood) return;
        currentMood = moodName;
        moodLayers.forEach(layer => {
            layer.classList.toggle('is-active', layer.dataset.ambientMood === moodName);
        });
    };

    if ('IntersectionObserver' in window && moodSections.length && moodLayers.length) {
        const moodObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const mood = entry.target.dataset.bgMood;
                if (mood) setActiveMood(mood);
            });
        }, { rootMargin: '-32% 0px -48% 0px', threshold: 0 });

        moodSections.forEach(section => moodObserver.observe(section));
    }

    let targetY = window.scrollY;
    let smoothY = window.scrollY;
    let motionRaf = 0;
    let lastTime = 0;

    // Calm, luxurious Apple inertia damping (identical across 60Hz/120Hz/144Hz)
    const LAMBDA = 5.4;

    const renderFrame = now => {
        const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
        lastTime = now;

        const diff = targetY - smoothY;
        if (Math.abs(diff) < 0.08) {
            smoothY = targetY;
        } else {
            const alpha = 1 - Math.exp(-LAMBDA * dt);
            smoothY += diff * alpha;
        }

        const { vh, vw, maxScroll, heroH, galleryTop, galleryH } = metrics;
        const scrollProgress = Math.min(1, Math.max(0, smoothY / maxScroll));

        // 1. Top reading progress hairline
        if (progressBar) {
            progressBar.style.transform = `scaleX(${scrollProgress.toFixed(4)})`;
        }

        // 2. Keep Hero background untouched; reveal contextual backdrop smoothly below Hero
        if (ambientStage) {
            ambientStage.classList.toggle('is-visible', smoothY > heroH * 0.4);
        }

        if (!prefersReducedMotion) {
            // 3. Scroll-driven contextual ambient orbs (GPU translate3d only)
            if (ambientStage && smoothY > heroH * 0.25) {
                const startY = heroH * 0.38;
                const postHeroRatio = Math.min(1, Math.max(0, (smoothY - startY) / Math.max(1, maxScroll - startY)));
                const wave = Math.sin(postHeroRatio * Math.PI * 2);
                const cosWave = Math.cos(postHeroRatio * Math.PI * 1.5);

                const pX = (postHeroRatio * 26 + wave * 5.5).toFixed(2);
                const pY = (postHeroRatio * 32 - cosWave * 5).toFixed(2);
                const pScale = (1 + Math.sin(postHeroRatio * Math.PI) * 0.09).toFixed(3);

                const sX = (-postHeroRatio * 24 - wave * 5).toFixed(2);
                const sY = (-postHeroRatio * 28 + cosWave * 5.5).toFixed(2);
                const sScale = (1.04 - Math.sin(postHeroRatio * Math.PI) * 0.07).toFixed(3);

                const pTransform = `translate3d(${pX}vw, ${pY}vh, 0) scale(${pScale})`;
                const sTransform = `translate3d(${sX}vw, ${sY}vh, 0) scale(${sScale})`;

                for (let i = 0; i < primaryOrbs.length; i++) primaryOrbs[i].style.transform = pTransform;
                for (let i = 0; i < secondaryOrbs.length; i++) secondaryOrbs[i].style.transform = sTransform;
            }

            // 4. Apple-style Hero scroll-out depth choreography
            if (heroSection) {
                const heroP = Math.min(1.15, Math.max(0, smoothY / heroH));

                if (heroBgImg && heroP <= 1.15) {
                    const bgShift = (smoothY * 0.18).toFixed(2);
                    const bgScale = (1.04 + heroP * 0.09).toFixed(4);
                    heroBgImg.style.transform = `translate3d(0, ${bgShift}px, 0) scale(${bgScale})`;
                }

                if (heroContent && heroP <= 1.15) {
                    const t = Math.min(1, heroP * 1.2);
                    // Smooth ease-out curve for graceful exit
                    const eased = 1 - Math.pow(1 - t, 2.2);
                    const liftY = (-eased * 36).toFixed(2);
                    const contentScale = (1 - eased * 0.045).toFixed(4);
                    const contentOpacity = Math.max(0, 1 - t * 1.18).toFixed(3);
                    heroContent.style.transform = `translate3d(0, ${liftY}px, 0) scale(${contentScale})`;
                    heroContent.style.opacity = contentOpacity;
                }

                if (heroScrollCue) {
                    heroScrollCue.style.opacity = Math.max(0, 1 - smoothY / 130).toFixed(3);
                }
            }

            // 5. Zero-reflow Apple tri-device opposing scroll parallax (tablet/desktop >= 640px)
            if (iosGallery && parallaxItems.length) {
                if (vw >= 640) {
                    const viewTop = galleryTop - smoothY;
                    const viewBottom = viewTop + galleryH;
                    if (viewBottom > -140 && viewTop < vh + 140) {
                        const centerOffset = ((viewTop + galleryH * 0.5) - vh * 0.5) / (vh * 0.85);
                        const clamped = Math.max(-1, Math.min(1, centerOffset));
                        for (let i = 0; i < parallaxItems.length; i++) {
                            const { frame, speed } = parallaxItems[i];
                            frame.style.translate = `0 ${(clamped * speed).toFixed(1)}px`;
                        }
                    }
                } else {
                    for (let i = 0; i < parallaxItems.length; i++) {
                        const { frame } = parallaxItems[i];
                        if (frame.style.translate) frame.style.translate = '';
                    }
                }
            }
        }

        if (Math.abs(targetY - smoothY) >= 0.08) {
            motionRaf = requestAnimationFrame(renderFrame);
        } else {
            motionRaf = 0;
            lastTime = 0;
        }
    };

    const kickLoop = () => {
        targetY = window.scrollY;
        onScrollNavbar?.(targetY);
        if (!motionRaf) {
            lastTime = 0;
            motionRaf = requestAnimationFrame(renderFrame);
        }
    };

    window.addEventListener('scroll', kickLoop, { passive: true });
    window.addEventListener('resize', () => {
        measureLayout();
        kickLoop();
    }, { passive: true });

    kickLoop();
}
