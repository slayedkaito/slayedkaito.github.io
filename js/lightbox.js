/**
 * Interactive full-screen Lightbox modal for the iOS 16.5 boot screenshots.
 */
const IOS_BOOT_SLIDES = [
    {
        src: 'assets/ios-boot-lockscreen.webp',
        title: '01 • Lock Screen iOS 16.5 (POCO F6)',
        desc: 'Boot native selesai hingga layar kunci iOS 16.5 melalui UEFI Mu-Silicium & xnuloader.'
    },
    {
        src: 'assets/ios-boot-homescreen.webp',
        title: '02 • Home Screen / SpringBoard iOS 16.5',
        desc: 'Antarmuka SpringBoard berjalan penuh dengan akselerasi Metal (OSMesa) hingga 60 FPS.'
    },
    {
        src: 'assets/ios-boot-about.webp',
        title: '03 • Settings → General → About (iOS 16.5)',
        desc: 'Teridentifikasi sebagai iOS 16.5 berjalan langsung pada ramdisk (RDW00POCOX5P) tanpa menyentuh partisi Android.'
    }
];

export function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    if (!lightbox || !lightboxImg) return;

    let currentSlide = 0;

    const renderSlide = idx => {
        currentSlide = (idx + IOS_BOOT_SLIDES.length) % IOS_BOOT_SLIDES.length;
        const slide = IOS_BOOT_SLIDES[currentSlide];
        lightboxImg.src = slide.src;
        lightboxImg.alt = slide.title;
        if (lightboxTitle) lightboxTitle.textContent = slide.title;
        if (lightboxDesc) lightboxDesc.textContent = slide.desc;
    };

    const openLightbox = idx => {
        renderSlide(idx);
        lightbox.classList.add('open');
        document.body.classList.add('overflow-hidden');
        lightboxClose?.focus();
    };

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        document.body.classList.remove('overflow-hidden');
    };

    document.querySelectorAll('[data-lightbox-index]').forEach(btn => {
        btn.addEventListener('click', () => {
            openLightbox(Number(btn.dataset.lightboxIndex));
        });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', () => renderSlide(currentSlide - 1));
    lightboxNext?.addEventListener('click', () => renderSlide(currentSlide + 1));

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') renderSlide(currentSlide - 1);
        else if (e.key === 'ArrowRight') renderSlide(currentSlide + 1);
    });
}
