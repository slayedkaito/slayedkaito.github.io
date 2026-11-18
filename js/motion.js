/**
 * Idle-sleeping lerped scroll choreography + scroll-reactive contextual background.
 * - Hero (#tentang) stays untouched with its own photo backdrop.
 * - Below Hero, dark ambient orbs glide smoothly with scroll (GPU translate3d)
 *   and crossfade contextual mood palettes based on the active section in view.
 */
export function initScrollMotion(prefersReducedMotion, onScrollNavbar) {
    const progressBar = document.getElementById('scroll-progress');
    const heroBgImg = document.getElementById('hero-bg-img');
    const heroSection = document.getElementById('tentang');
    const heroContent = document.getElementById('hero-content');
    const heroScrollCue = document.getElementById('hero-scroll-cue');
    const iosGallery = document.getElementById('ios-gallery');
    const parallaxItems = Array.from(document.querySelectorAll('[data-parallax-speed]'));

    // Contextual dynamic ambient background elements
    const ambientStage = document.getElementById('ambient-stage');
    const moodLayers = Array.from(document.querySelectorAll('[data-ambient-mood]'));
    const moodSections = Array.from(document.querySelectorAll('[data-bg-mood]'));
    const primaryOrbs = Array.from(document.querySelectorAll('.ambient-orb-primary'));
    const secondaryOrbs = Array.from(document.querySelectorAll('.ambient-orb-secondary'));

    let currentMood = 'keahlian';

    const setActiveMood = moodName => {
        if (!moodName || moodName === currentMood) return;
        currentMood = moodName;
        moodLayers.forEach(layer => {
            layer.classList.toggle('is-active', layer.dataset.ambientMood === moodName);
        });
    };

    // Observe which content section is currently centered in viewport to crossfade dark mood
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

    const renderFrame = () => {
        const diff = targetY - smoothY;
        if (Math.abs(diff) < 0.15) {
            smoothY = targetY;
        } else {
            smoothY += diff * 0.11;
        }

        const vh = window.innerHeight || 1;
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
        const scrollProgress = Math.min(1, Math.max(0, smoothY / maxScroll));

        // 1. Reading progress hairline
        if (progressBar) {
            progressBar.style.transform = `scaleX(${scrollProgress.toFixed(4)})`;
        }

        // 2. Keep Hero background untouched; reveal dynamic contextual backdrop once leaving Hero
        const heroH = heroSection ? heroSection.offsetHeight || vh : vh;
        if (ambientStage) {
            const pastHero = smoothY > heroH * 0.42;
            ambientStage.classList.toggle('is-visible', pastHero);
        }

        if (!prefersReducedMotion) {
            // 3. Scroll-driven movement of ambient orbs (pure GPU translate3d, 0 repaint)
            if (ambientStage && smoothY > heroH * 0.3) {
                const postHeroRatio = Math.min(1, Math.max(0, (smoothY - heroH * 0.4) / Math.max(1, maxScroll - heroH * 0.4)));
                const wave = Math.sin(postHeroRatio * Math.PI * 2);
                const cosWave = Math.cos(postHeroRatio * Math.PI * 1.5);

                const pX = (postHeroRatio * 28 + wave * 6).toFixed(2);
                const pY = (postHeroRatio * 34 - cosWave * 5).toFixed(2);
                const pScale = (1 + Math.sin(postHeroRatio * Math.PI) * 0.1).toFixed(3);

                const sX = (-postHeroRatio * 26 - wave * 5).toFixed(2);
                const sY = (-postHeroRatio * 30 + cosWave * 6).toFixed(2);
                const sScale = (1.04 - Math.sin(postHeroRatio * Math.PI) * 0.08).toFixed(3);

                const pTransform = `translate3d(${pX}vw, ${pY}vh, 0) scale(${pScale})`;
                const sTransform = `translate3d(${sX}vw, ${sY}vh, 0) scale(${sScale})`;

                primaryOrbs.forEach(orb => { orb.style.transform = pTransform; });
                secondaryOrbs.forEach(orb => { orb.style.transform = sTransform; });
            }

            // 4. Hero scroll-out cinematic depth
            if (heroSection) {
                const heroP = Math.min(1.15, Math.max(0, smoothY / heroH));

                if (heroBgImg && heroP <= 1.15) {
                    const bgShift = (smoothY * 0.2).toFixed(1);
                    const bgScale = (1.05 + heroP * 0.08).toFixed(4);
                    heroBgImg.style.transform = `translate3d(0, ${bgShift}px, 0) scale(${bgScale})`;
                }

                if (heroContent && heroP <= 1.15) {
                    const fadeP = Math.min(1, heroP * 1.25);
                    const liftY = (-fadeP * 34).toFixed(1);
                    const contentScale = (1 - fadeP * 0.045).toFixed(4);
                    const contentOpacity = Math.max(0, 1 - fadeP * 1.15).toFixed(3);
                    heroContent.style.transform = `translate3d(0, ${liftY}px, 0) scale(${contentScale})`;
                    heroContent.style.opacity = contentOpacity;
                }

                if (heroScrollCue) {
                    heroScrollCue.style.opacity = Math.max(0, 1 - smoothY / 140).toFixed(3);
                }
            }

            // 5. Tri-device opposing scroll parallax (tablet/desktop >= 640px)
            if (iosGallery && parallaxItems.length) {
                if (window.innerWidth >= 640) {
                    const gRect = iosGallery.getBoundingClientRect();
                    if (gRect.bottom > -120 && gRect.top < vh + 120) {
                        const centerOffset = ((gRect.top + gRect.height * 0.5) - vh * 0.5) / (vh * 0.85);
                        const clamped = Math.max(-1, Math.min(1, centerOffset));
                        parallaxItems.forEach(item => {
                            const speed = Number(item.dataset.parallaxSpeed) || 0;
                            const frame = item.querySelector('.device-frame');
                            if (frame) {
                                frame.style.translate = `0 ${(clamped * speed).toFixed(1)}px`;
                            }
                        });
                    }
                } else {
                    parallaxItems.forEach(item => {
                        const frame = item.querySelector('.device-frame');
                        if (frame && frame.style.translate) {
                            frame.style.translate = '';
                        }
                    });
                }
            }
        }

        if (Math.abs(targetY - smoothY) >= 0.15) {
            motionRaf = requestAnimationFrame(renderFrame);
        } else {
            motionRaf = 0;
        }
    };

    const kickLoop = () => {
        targetY = window.scrollY;
        onScrollNavbar?.(targetY);
        if (!motionRaf) {
            motionRaf = requestAnimationFrame(renderFrame);
        }
    };

    window.addEventListener('scroll', kickLoop, { passive: true });
    window.addEventListener('resize', kickLoop, { passive: true });
    kickLoop();
}
