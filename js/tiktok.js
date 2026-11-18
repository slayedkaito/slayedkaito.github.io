/**
 * Lazy-load Official TikTok Creator Profile Embed SDK when approaching viewport.
 */
export function initTikTokEmbed() {
    const container = document.getElementById('tiktok-embed-container');
    if (!container) return;

    let loaded = false;
    const loadSdk = () => {
        if (loaded) return;
        loaded = true;
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            if (entries.some(entry => entry.isIntersecting)) {
                loadSdk();
                obs.disconnect();
            }
        }, { rootMargin: '400px 0px' });
        observer.observe(container);
    } else {
        loadSdk();
    }
}
