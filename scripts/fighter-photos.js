// ===================================
// UFC Fighter Photos Module (Turbo Edition 🚀)
// Ultra-fast with smart cache, parallel fetch, and graceful fallbacks
// ===================================

const FighterPhotos = {
    // Cache e config
    photoCache: {},
    debug: true,
    cacheTTL: 1000 * 60 * 60 * 24 * 7, // 7 dias
    corsProxies: [
        'https://corsproxy.io/?',              // Mais confiável - tentar primeiro
        'https://api.allorigins.win/raw?url=', // Backup
    ],
    currentProxyIndex: 0,

    // Foto padrão (SVG)
    DEFAULT_PHOTO: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23d91c1c;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23ff4444;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad)" width="200" height="200"/%3E%3Ctext x="50%25" y="45%25" text-anchor="middle" fill="white" font-size="60" font-weight="bold" font-family="Arial"%3EUFC%3C/text%3E%3Ctext x="50%25" y="65%25" text-anchor="middle" fill="white" font-size="20" font-family="Arial" opacity="0.8"%3EFighter%3C/text%3E%3C/svg%3E',

    // =========================
    // Core
    // =========================
    init() {
        const cached = localStorage.getItem('ufc_fighter_photos');
        if (!cached) return;

        try {
            this.photoCache = JSON.parse(cached);
            const validCount = Object.values(this.photoCache).filter(p => !p.error).length;
            this.log(`✅ Loaded ${validCount} cached photos`);
        } catch (e) {
            console.error('Error loading photo cache:', e);
        }
    },

    saveCache() {
        try {
            localStorage.setItem('ufc_fighter_photos', JSON.stringify(this.photoCache));
        } catch (e) {
            console.error('Error saving cache:', e);
        }
    },

    normalizeNameForUrl(name) {
        return name
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    },

    generateProfileUrls(fighter) {
        const normalized = this.normalizeNameForUrl(fighter.name);
        return [
            `https://www.ufc.com/athlete/${normalized}`,
            `https://www.ufcespanol.com/athlete/${normalized}`,
        ];
    },

    // =========================
    // Logging helpers
    // =========================
    log(...args) {
        if (this.debug) console.log(...args);
    },

    // =========================
    // Fetch logic
    // =========================
    async tryDirectFetch(url) {
        try {
            const res = await fetch(url, { headers: { 'Accept': 'text/html' } });
            if (!res.ok) throw new Error(res.status);
            return await res.text();
        } catch {
            return null;
        }
    },

    async fetchWithProxy(url) {
        const proxy = this.corsProxies[this.currentProxyIndex];
        const proxiedUrl = proxy + encodeURIComponent(url);

        try {
            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: { 'Accept': 'text/html,application/xhtml+xml' },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.corsProxies.length;
            throw error;
        }
    },

    async fetchWithTimeout(url, ms = 5000) {
        return Promise.race([
            fetch(url, { headers: { 'Accept': 'text/html,application/xhtml+xml' } })
                .then(r => (r.ok ? r.text() : Promise.reject(r.status))),
            new Promise((_, reject) => setTimeout(() => reject('timeout'), ms))
        ]);
    },

    // =========================
    // Extractors
    // =========================
    extractHeadshotUrl(html) {
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImageMatch?.[1]) return ogImageMatch[1];

        const heroMatch = html.match(/<img[^>]*class=["'][^"']*hero-profile[^"']*["'][^>]*src=["']([^"']+)["']/i);
        if (heroMatch?.[1]) return heroMatch[1];

        const cloudFrontMatch = html.match(/https:\/\/[^"'\s]+\.cloudfront\.net\/[^"'\s?]+\.(?:jpg|png)/i);
        if (cloudFrontMatch) return cloudFrontMatch[0];

        return null;
    },

    extractFullBodyUrl(html) {
        const heroImageMatch = html.match(/<img[^>]*class=["'][^"']*hero-profile__image[^"']*["'][^>]*src=["']([^"'?]+)[^"']*["']/i);
        if (heroImageMatch?.[1]) return heroImageMatch[1];

        const wrapMatch = html.match(/<div[^>]*class=["'][^"']*hero-profile__image-wrap[^"']*["'][^>]*>[\s\S]*?<img[^>]*src=["']([^"'?]+)[^"']*["']/i);
        if (wrapMatch?.[1]) return wrapMatch[1];

        const fullBodyPathMatch = html.match(/(https?:\/\/[^"'\s]*athlete_bio_full_body[^"'\s?]*\.(?:jpg|png))/i);
        if (fullBodyPathMatch?.[1]) return fullBodyPathMatch[1];

        const allImages = html.match(/https:\/\/[^"'\s]+\.cloudfront\.net\/[^"'\s?]+\.(?:jpg|png)/gi) || [];
        const fullBodyImages = allImages.filter(url => 
            !url.includes('-mug') && 
            (url.includes('athlete_bio') || url.includes('styles'))
        );
        if (fullBodyImages.length) return fullBodyImages[0];

        const headshot = this.extractHeadshotUrl(html);
        if (headshot?.includes('-mug')) return headshot.replace('-mug', '');

        return null;
    },

    // =========================
    // Main logic
    // =========================
    async getFighterPhotos(fighter) {
        const cacheKey = fighter.id;
        const cached = this.photoCache[cacheKey];

        if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
            this.log(`📦 Cache hit for ${fighter.name}`);
            return cached;
        }

        this.log(`🔍 Fetching photos for ${fighter.name}...`);

        const profileUrls = this.generateProfileUrls(fighter);
        let html = null;

        // 1️⃣ Tenta acesso direto (sem proxy)
        html = await this.tryDirectFetch(profileUrls[0]) || await this.tryDirectFetch(profileUrls[1]);

        // 2️⃣ Se falhar, tenta proxies em paralelo
        if (!html) {
            const allUrls = profileUrls.flatMap(page =>
                this.corsProxies.map(proxy => proxy + encodeURIComponent(page))
            );

            for (const batch of [allUrls.slice(0, 2), allUrls.slice(2)]) {
                try {
                    html = await Promise.any(batch.map(u => this.fetchWithTimeout(u)));
                    if (html) break;
                } catch (_) {}
            }
        }

        if (!html) {
            console.warn(`⚠️ No response for ${fighter.name}`);
            const fallback = {
                headshot: this.DEFAULT_PHOTO,
                fullBody: this.DEFAULT_PHOTO,
                timestamp: Date.now(),
                error: 'no_response'
            };
            this.photoCache[cacheKey] = fallback;
            this.saveCache();
            return fallback;
        }

        // 3️⃣ Extrair imagens
        const [headshotUrl, fullBodyUrl] = await Promise.all([
            Promise.resolve(this.extractHeadshotUrl(html)),
            Promise.resolve(this.extractFullBodyUrl(html))
        ]);

        const result = {
            headshot: headshotUrl || this.DEFAULT_PHOTO,
            fullBody: fullBodyUrl || headshotUrl || this.DEFAULT_PHOTO,
            timestamp: Date.now()
        };

        // 4️⃣ Salvar cache
        this.photoCache[cacheKey] = result;
        this.saveCache();

        this.log(`✅ Found photos for ${fighter.name}`);
        return result;
    },

    async getFighterPhoto(fighter) {
        const photos = await this.getFighterPhotos(fighter);
        return photos.headshot;
    },

    async loadPhotoIntoElement(fighter, imgElement) {
        imgElement.src = this.DEFAULT_PHOTO;
        imgElement.alt = fighter.name;
        imgElement.loading = 'lazy';
        imgElement.decoding = 'async';
        imgElement.classList.add('loading');
        imgElement.onerror = () => imgElement.src = this.DEFAULT_PHOTO;

        try {
            const photos = await this.getFighterPhotos(fighter);
            imgElement.src = photos.headshot;
            imgElement.alt = fighter.name;
            imgElement.classList.remove('loading');
            imgElement.classList.add('loaded');
        } catch (error) {
            console.error('Error loading photo:', error);
            imgElement.src = this.DEFAULT_PHOTO;
            imgElement.classList.remove('loading');
        }
    },

    clearCache() {
        this.photoCache = {};
        localStorage.removeItem('ufc_fighter_photos');
        console.log('🗑️ Photo cache cleared');
    }
};

// Inicializar automaticamente
if (typeof window !== 'undefined') {
    FighterPhotos.init();
}
