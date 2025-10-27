// ===================================
// UFC Fighter Photos Module (Fixed Edition 🔧)
// Melhor handling de CORS e fallbacks mais inteligentes
// ===================================

const FighterPhotos = {
    // Cache e config
    photoCache: {},
    debug: true,
    cacheTTL: 1000 * 60 * 60 * 24 * 7, // 7 dias
    
    // Proxies ordenados por confiabilidade
    corsProxies: [
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?',
    ],

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
    // Fetch logic (MELHORADO)
    // =========================
    async fetchWithTimeout(url, timeout = 4000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'text/html,application/xhtml+xml' },
                mode: 'cors',
                cache: 'default'
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },

    async tryFetchWithProxies(url) {
        // Tenta cada proxy em sequência
        for (let i = 0; i < this.corsProxies.length; i++) {
            const proxy = this.corsProxies[i];
            const proxiedUrl = proxy + encodeURIComponent(url);
            
            try {
                this.log(`🔄 Trying proxy ${i + 1}/${this.corsProxies.length} for ${url.split('/').pop()}`);
                const html = await this.fetchWithTimeout(proxiedUrl, 8000);
                
                // Verifica se o HTML é válido
                if (html && html.length > 1000 && html.includes('ufc')) {
                    this.log(`✅ Success with proxy ${i + 1}`);
                    return html;
                }
            } catch (error) {
                this.log(`❌ Proxy ${i + 1} failed: ${error.message}`);
                continue;
            }
        }
        
        return null;
    },

    // =========================
    // Extractors (MELHORADOS)
    // =========================
    extractHeadshotUrl(html) {
        // 1. Meta tag og:image (mais confiável)
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImageMatch?.[1]) {
            this.log(`📸 Found og:image`);
            return ogImageMatch[1];
        }

        // 2. Hero profile image
        const heroMatch = html.match(/<img[^>]*class=["'][^"']*hero-profile[^"']*["'][^>]*src=["']([^"']+)["']/i);
        if (heroMatch?.[1]) {
            this.log(`📸 Found hero-profile`);
            return heroMatch[1];
        }

        // 3. CloudFront image com -mug (headshot específico)
        const mugMatch = html.match(/(https:\/\/[^"'\s]+\.cloudfront\.net\/[^"'\s?]+-mug[^"'\s?]*\.(?:jpg|png))/i);
        if (mugMatch?.[1]) {
            this.log(`📸 Found -mug image`);
            return mugMatch[1];
        }

        // 4. Qualquer CloudFront image
        const cloudFrontMatch = html.match(/(https:\/\/[^"'\s]+\.cloudfront\.net\/[^"'\s?]+\.(?:jpg|png))/i);
        if (cloudFrontMatch?.[1]) {
            this.log(`📸 Found CloudFront image`);
            return cloudFrontMatch[1];
        }

        this.log(`⚠️ No headshot found`);
        return null;
    },

    extractFullBodyUrl(html) {
        // 1. Hero profile image (full body)
        const heroImageMatch = html.match(/<img[^>]*class=["'][^"']*hero-profile__image[^"']*["'][^>]*src=["']([^"'?]+)[^"']*["']/i);
        if (heroImageMatch?.[1]) {
            this.log(`🧍 Found hero-profile__image`);
            return heroImageMatch[1];
        }

        // 2. Wrap image
        const wrapMatch = html.match(/<div[^>]*class=["'][^"']*hero-profile__image-wrap[^"']*["'][^>]*>[\s\S]*?<img[^>]*src=["']([^"'?]+)[^"']*["']/i);
        if (wrapMatch?.[1]) {
            this.log(`🧍 Found image-wrap`);
            return wrapMatch[1];
        }

        // 3. athlete_bio_full_body path
        const fullBodyPathMatch = html.match(/(https?:\/\/[^"'\s]*athlete_bio_full_body[^"'\s?]*\.(?:jpg|png))/i);
        if (fullBodyPathMatch?.[1]) {
            this.log(`🧍 Found full_body path`);
            return fullBodyPathMatch[1];
        }

        // 4. CloudFront images (excluindo -mug)
        const allImages = html.match(/https:\/\/[^"'\s]+\.cloudfront\.net\/[^"'\s?]+\.(?:jpg|png)/gi) || [];
        const fullBodyImages = allImages.filter(url => 
            !url.includes('-mug') && 
            (url.includes('athlete_bio') || url.includes('styles') || url.length > 80)
        );
        if (fullBodyImages.length) {
            this.log(`🧍 Found CloudFront full body`);
            return fullBodyImages[0];
        }

        // 5. Tentar remover -mug do headshot
        const headshot = this.extractHeadshotUrl(html);
        if (headshot?.includes('-mug')) {
            this.log(`🧍 Converting -mug to full body`);
            return headshot.replace('-mug', '');
        }

        this.log(`⚠️ No full body found`);
        return null;
    },

    // =========================
    // Main logic (MELHORADO)
    // =========================
    async getFighterPhotos(fighter) {
        const cacheKey = fighter.id;
        const cached = this.photoCache[cacheKey];

        // Verifica cache válido
        if (cached && !cached.error && (Date.now() - cached.timestamp < this.cacheTTL)) {
            this.log(`📦 Cache hit for ${fighter.name}`);
            return cached;
        }

        this.log(`🔍 Fetching photos for ${fighter.name}...`);

        const profileUrls = this.generateProfileUrls(fighter);
        let html = null;

        // Tenta buscar HTML de cada URL
        for (const url of profileUrls) {
            try {
                html = await this.tryFetchWithProxies(url);
                if (html) {
                    this.log(`✅ Got HTML from ${url.split('/').pop()}`);
                    break;
                }
            } catch (error) {
                this.log(`❌ Failed to fetch ${url.split('/').pop()}: ${error.message}`);
                continue;
            }
        }

        // Se não conseguiu HTML, retorna fallback
        if (!html) {
            console.warn(`⚠️ No response for ${fighter.name} - using default photo`);
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

        // Extrai imagens
        const headshotUrl = this.extractHeadshotUrl(html);
        const fullBodyUrl = this.extractFullBodyUrl(html);

        // Se não encontrou nenhuma imagem, marca como erro mas tenta novamente depois
        if (!headshotUrl && !fullBodyUrl) {
            console.warn(`⚠️ No images found for ${fighter.name} in HTML`);
            const fallback = {
                headshot: this.DEFAULT_PHOTO,
                fullBody: this.DEFAULT_PHOTO,
                timestamp: Date.now() - (this.cacheTTL * 0.9), // Cache mais curto para tentar novamente
                error: 'no_images_found'
            };
            this.photoCache[cacheKey] = fallback;
            this.saveCache();
            return fallback;
        }

        // Resultado final
        const result = {
            headshot: headshotUrl || this.DEFAULT_PHOTO,
            fullBody: fullBodyUrl || headshotUrl || this.DEFAULT_PHOTO,
            timestamp: Date.now()
        };

        this.photoCache[cacheKey] = result;
        this.saveCache();

        this.log(`✅ Found photos for ${fighter.name}`);
        this.log(`   Headshot: ${headshotUrl ? '✓' : '✗'}`);
        this.log(`   Full body: ${fullBodyUrl ? '✓' : '✗'}`);
        
        return result;
    },

    async getFighterPhoto(fighter) {
        const photos = await this.getFighterPhotos(fighter);
        return photos.headshot;
    },

    async loadPhotoIntoElement(fighter, imgElement) {
        // Começa com foto padrão
        imgElement.src = this.DEFAULT_PHOTO;
        imgElement.alt = fighter.name;
        imgElement.loading = 'lazy';
        imgElement.decoding = 'async';
        imgElement.classList.add('loading');
        
        // Fallback se a imagem falhar
        imgElement.onerror = () => {
            imgElement.src = this.DEFAULT_PHOTO;
            imgElement.classList.remove('loading');
        };

        try {
            const photos = await this.getFighterPhotos(fighter);
            
            // Só atualiza se conseguiu uma foto real (não default)
            if (photos.headshot !== this.DEFAULT_PHOTO) {
                imgElement.src = photos.headshot;
                imgElement.classList.remove('loading');
                imgElement.classList.add('loaded');
            } else {
                imgElement.classList.remove('loading');
            }
        } catch (error) {
            console.error(`Error loading photo for ${fighter.name}:`, error);
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