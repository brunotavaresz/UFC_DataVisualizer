// ===================================
// UFC Fighter Photos Module
// Using CORS Proxy Solution
// ===================================

const FighterPhotos = {
    // Cache de fotos
    photoCache: {},
    
    // CORS Proxies públicos (usar com moderação)
    corsProxies: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
    ],
    currentProxyIndex: 0,
    
    // Foto padrão
    DEFAULT_PHOTO: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23d91c1c;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23ff4444;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad)" width="200" height="200"/%3E%3Ctext x="50%25" y="45%25" text-anchor="middle" fill="white" font-size="60" font-weight="bold" font-family="Arial"%3EUFC%3C/text%3E%3Ctext x="50%25" y="65%25" text-anchor="middle" fill="white" font-size="20" font-family="Arial" opacity="0.8"%3EFighter%3C/text%3E%3C/svg%3E',
    
    /**
     * Inicializa o módulo
     */
    init() {
        const cached = localStorage.getItem('ufc_fighter_photos');
        if (cached) {
            try {
                this.photoCache = JSON.parse(cached);
                console.log(`✅ Loaded ${Object.keys(this.photoCache).length} cached photos`);
            } catch (e) {
                console.error('Error loading photo cache:', e);
            }
        }
    },
    
    /**
     * Salva o cache
     */
    saveCache() {
        try {
            localStorage.setItem('ufc_fighter_photos', JSON.stringify(this.photoCache));
        } catch (e) {
            console.error('Error saving cache:', e);
        }
    },
    
    /**
     * Normaliza nome para URL
     */
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
    
    /**
     * Gera URLs da página do lutador
     */
    generateProfileUrls(fighter) {
        const normalized = this.normalizeNameForUrl(fighter.name);
        return [
            `https://www.ufc.com/athlete/${normalized}`,
            `https://www.ufcespanol.com/athlete/${normalized}`,
        ];
    },
    
    /**
     * Busca foto usando CORS proxy
     */
    async fetchWithProxy(url) {
        const proxy = this.corsProxies[this.currentProxyIndex];
        const proxiedUrl = proxy + encodeURIComponent(url);
        
        try {
            console.log(`  🔄 Using proxy: ${proxy.substring(0, 30)}...`);
            
            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.text();
        } catch (error) {
            console.error(`  ❌ Proxy failed:`, error.message);
            
            // Tentar próximo proxy
            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.corsProxies.length;
            throw error;
        }
    },
    
    /**
     * Extrai URL da foto do HTML
     */
    extractPhotoUrl(html) {
        // Tentar meta tag og:image
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImageMatch && ogImageMatch[1]) {
            return ogImageMatch[1];
        }
        
        // Tentar hero profile image
        const heroMatch = html.match(/<img[^>]*class=["'][^"']*hero-profile[^"']*["'][^>]*src=["']([^"']+)["']/i);
        if (heroMatch && heroMatch[1]) {
            return heroMatch[1];
        }
        
        // Tentar imagens do CloudFront
        const cloudFrontMatch = html.match(/https:\/\/dmxg5wxfqgb4u\.cloudfront\.net\/[^"'\s]+\.(?:jpg|png)/i);
        if (cloudFrontMatch) {
            return cloudFrontMatch[0];
        }
        
        return null;
    },
    
    /**
     * Busca foto do lutador
     */
    async getFighterPhoto(fighter) {
        const cacheKey = fighter.id;
        
        // Verificar cache
        if (this.photoCache[cacheKey]) {
            console.log(`📦 Cache hit for ${fighter.name}`);
            return this.photoCache[cacheKey];
        }
        
        console.log(`🔍 Searching photo for ${fighter.name}...`);
        
        const profileUrls = this.generateProfileUrls(fighter);
        
        // Tentar cada URL
        for (const url of profileUrls) {
            console.log(`  Trying: ${url}`);
            
            try {
                // Tentar com cada proxy
                for (let attempt = 0; attempt < this.corsProxies.length; attempt++) {
                    try {
                        const html = await this.fetchWithProxy(url);
                        const photoUrl = this.extractPhotoUrl(html);
                        
                        if (photoUrl) {
                            console.log(`  ✅ Found photo: ${photoUrl}`);
                            
                            // Salvar no cache
                            this.photoCache[cacheKey] = photoUrl;
                            this.saveCache();
                            
                            return photoUrl;
                        }
                    } catch (proxyError) {
                        // Continuar para próximo proxy
                        continue;
                    }
                }
            } catch (error) {
                console.error(`  ❌ Failed for ${url}`);
                continue;
            }
            
            // Pequeno delay entre tentativas
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.warn(`⚠️ No photo found for ${fighter.name}`);
        return this.DEFAULT_PHOTO;
    },
    
    /**
     * Verifica se uma imagem existe
     */
    async testImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            
            // Timeout de 5 segundos
            setTimeout(() => resolve(false), 5000);
        });
    },
    
    /**
     * Carrega foto no elemento img
     */
    async loadPhotoIntoElement(fighter, imgElement) {
        // Mostrar loading
        imgElement.src = this.DEFAULT_PHOTO;
        imgElement.alt = `${fighter.name}`;
        imgElement.classList.add('loading');
        
        try {
            const photoUrl = await this.getFighterPhoto(fighter);
            
            // Testar se a imagem carrega
            const imageExists = await this.testImage(photoUrl);
            
            if (imageExists) {
                imgElement.src = photoUrl;
                imgElement.alt = fighter.name;
                imgElement.classList.remove('loading');
                imgElement.classList.add('loaded');
            } else {
                console.warn(`Image doesn't load: ${photoUrl}`);
                imgElement.src = this.DEFAULT_PHOTO;
                imgElement.classList.remove('loading');
            }
        } catch (error) {
            console.error('Error loading photo:', error);
            imgElement.src = this.DEFAULT_PHOTO;
            imgElement.classList.remove('loading');
        }
    },
    
    /**
     * Limpa o cache
     */
    clearCache() {
        this.photoCache = {};
        localStorage.removeItem('ufc_fighter_photos');
        console.log('🗑️ Photo cache cleared');
    }
};

// Inicializar
if (typeof window !== 'undefined') {
    FighterPhotos.init();
}