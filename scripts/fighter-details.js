// Fighter details page with visualizations and photos

const FighterDetails = {
    currentFighter: null,
    
    async show(fighterId) {
    this.currentFighter = DataLoader.getFighterById(fighterId);
    
    if (!this.currentFighter) {
        console.error('Fighter not found:', fighterId);
        return;
    }
    
    // Navegar para a página mas mostrar loading
    Navigation.navigateTo('fighter-details');
    this.showLoadingState();
    
    // Carregar AMBAS as fotos primeiro (em background)
    await this.preloadFighterPhotos();
    
    // Depois renderizar tudo
    this.renderHeader();
    this.renderRecordChart();
    this.renderRankings();
    this.renderStatsTable();
    this.renderRadarCharts();
    
    // Remover loading
    this.hideLoadingState();
    
    // 👇 Garantir que a página comece no topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
},

    
    showLoadingState() {
        const detailsPage = document.getElementById('fighter-details');
        
        // Criar overlay de loading
        const existingOverlay = detailsPage.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner" style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid #333;
                    border-top: 4px solid #d91c1c;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h2 style="color: #fff; margin: 0; font-size: 24px;">Loading Fighter...</h2>
                <p style="color: #888; margin-top: 10px; font-size: 14px;">Fetching photos and stats</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        detailsPage.appendChild(overlay);
    },
    
    hideLoadingState() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            // Fade out suave
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    },
    
    async preloadFighterPhotos() {
        const f = this.currentFighter;
        
        if (typeof FighterPhotos === 'undefined') {
            return;
        }
        
        try {
            // Buscar AMBAS as fotos (headshot + full body)
            const photos = await FighterPhotos.getFighterPhotos(f);
            
            // Pré-carregar ambas
            const preloadPromises = [];
            
            if (photos.headshot && photos.headshot !== FighterPhotos.DEFAULT_PHOTO) {
                preloadPromises.push(this.preloadImage(photos.headshot));
            }
            
            if (photos.fullBody && photos.fullBody !== FighterPhotos.DEFAULT_PHOTO) {
                preloadPromises.push(this.preloadImage(photos.fullBody));
            }
            
            await Promise.all(preloadPromises);
        } catch (error) {
            console.error('Error preloading photos:', error);
            // Continuar mesmo se houver erro
        }
    },
    
    preloadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continuar mesmo se falhar
            img.src = url;
            
            // Timeout de 5 segundos
            setTimeout(resolve, 5000);
        });
    },
    
    renderHeader() {
        const f = this.currentFighter;
        
        const avatarContainer = document.querySelector('.fighter-avatar');
        avatarContainer.innerHTML = '';
        
        const img = document.createElement('img');
        img.className = 'fighter-photo loaded';
        img.alt = `${f.name}`;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #d91c1c;
            box-shadow: 0 8px 32px rgba(217, 28, 28, 0.3);
            transition: all 0.3s ease;
            display: block;
            cursor: pointer;
        `;
        
        avatarContainer.appendChild(img);
        
        // Carregar foto (já deve estar em cache)
        if (typeof FighterPhotos !== 'undefined') {
            const cacheKey = f.id;
            const cachedPhotos = FighterPhotos.photoCache[cacheKey];
            
            if (cachedPhotos && cachedPhotos.headshot) {
                // Foto já está em cache, mostrar imediatamente
                img.src = cachedPhotos.headshot;
                
                // Adicionar click handler para mostrar foto de corpo
                img.addEventListener('click', () => {
                    const fullBodyUrl = cachedPhotos.fullBody || cachedPhotos.headshot;
                    this.showFullBodyModal(fullBodyUrl, f.name);
                });
                
                // Adicionar tooltip
                img.title = 'Click to view full body photo';
            } else {
                // Fallback: carregar normalmente
                FighterPhotos.loadPhotoIntoElement(f, img);
                
                // Adicionar click handler após carregar
                img.addEventListener('click', async () => {
                    const photos = await FighterPhotos.getFighterPhotos(f);
                    const fullBodyUrl = photos.fullBody || photos.headshot;
                    this.showFullBodyModal(fullBodyUrl, f.name);
                });
            }
        } else {
            console.warn('⚠️ FighterPhotos module not loaded, using fallback');
            // Fallback: mostrar iniciais
            const initials = f.name.split(' ').map(n => n[0]).join('');
            avatarContainer.innerHTML = `
                <div class="avatar-circle" style="
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #d91c1c, #ff4444);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 64px;
                    font-weight: bold;
                    color: white;
                    border: 4px solid #d91c1c;
                    box-shadow: 0 8px 32px rgba(217, 28, 28, 0.3);
                    animation: fadeIn 0.5s ease;
                ">${initials}</div>
            `;
        }
        
        // Basic info com animação
        const nameEl = document.getElementById('fighter-name');
        const nicknameEl = document.getElementById('fighter-nickname');
        const ageEl = document.getElementById('fighter-age');
        const stanceEl = document.getElementById('fighter-stance');
        const winrateEl = document.getElementById('fighter-winrate');
        
        // Fade in para o texto
        [nameEl, nicknameEl, ageEl, stanceEl, winrateEl].forEach(el => {
            if (el) {
                el.style.opacity = '0';
                el.style.animation = 'fadeIn 0.5s ease forwards';
                el.style.animationDelay = '0.1s';
            }
        });
        
        nameEl.textContent = f.name;
        nicknameEl.textContent = f.nickname ? `"${f.nickname}"` : '';
        ageEl.textContent = f.age || '-';
        stanceEl.textContent = formatStance(f.stance);
        winrateEl.textContent = `${f.winRate}%`;
    },
    
    showFullBodyModal(photoUrl, fighterName) {
        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
            cursor: pointer;
            padding: 2rem;
        `;
        
        modal.innerHTML = `
            <div style="
                position: relative;
                max-width: 90%;
                max-height: 90%;
                display: flex;
                flex-direction: column;
                align-items: center;
            ">
                <h2 style="
                    color: #fff;
                    margin-bottom: 1rem;
                    font-size: 2rem;
                    text-align: center;
                ">${fighterName}</h2>
                <img src="${photoUrl}" 
                     alt="${fighterName} Full Body" 
                     style="
                        max-width: 100%;
                        max-height: 80vh;
                        object-fit: contain;
                        border-radius: 12px;
                        box-shadow: 0 20px 60px rgba(217, 28, 28, 0.5);
                        border: 3px solid #d91c1c;
                     ">
                <p style="
                    color: #888;
                    margin-top: 1rem;
                    font-size: 0.9rem;
                ">Click anywhere to close</p>
            </div>
        `;
        
        // Fechar ao clicar
        modal.addEventListener('click', () => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });
        
        // Fechar com ESC
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.click();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        document.body.appendChild(modal);
    },
    
    renderRecordChart() {
        const f = this.currentFighter;
        
        // Update legend
        document.getElementById('legend-wins').textContent = `Wins: ${f.wins}`;
        document.getElementById('legend-losses').textContent = `Losses: ${f.losses}`;
        document.getElementById('legend-draws').textContent = `Draws: ${f.draws}`;
        
        // Create pie chart with D3
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;
        
        const data = [
            { label: 'Wins', value: f.wins, color: '#4ade80' },
            { label: 'Losses', value: f.losses, color: '#ef4444' },
            { label: 'Draws', value: f.draws, color: '#fbbf24' }
        ].filter(d => d.value > 0);
        
        const svg = d3.select('#record-chart')
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius - 20);
        
        const arcs = svg.selectAll('arc')
            .data(pie(data))
            .enter()
            .append('g');
        
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', '#1a1a1a')
            .attr('stroke-width', 2)
            .style('opacity', 0)
            .transition()
            .duration(500)
            .delay((d, i) => i * 100)
            .style('opacity', 0.9);
        
        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('font-size', '18px')
            .style('opacity', 0)
            .text(d => d.data.value)
            .transition()
            .duration(500)
            .delay((d, i) => i * 100 + 200)
            .style('opacity', 1);
    },
    
    renderRankings() {
        const f = this.currentFighter;
        
        const rankings = [
            { name: 'Win Rate', value: f.winRate, max: 100 },
            { name: 'Reach', value: Math.min((f.reach / 200) * 100, 100), max: 100 },
            { name: 'SPLM', value: Math.min((f.splm / 10) * 100, 100), max: 100 },
            { name: 'SAPM', value: Math.min((f.sapm / 10) * 100, 100), max: 100 },
            { name: 'TD Avg', value: Math.min((f.td_avg / 5) * 100, 100), max: 100 },
            { name: 'Sub Avg', value: Math.min((f.sub_avg / 2) * 100, 100), max: 100 }
        ];
        
        const container = d3.select('#rankings-chart').html('');
        
        rankings.forEach((rank, index) => {
            // Criar a barra (sem transição)
            const bar = container.append('div')
                .style('margin-bottom', '1rem')
                .style('opacity', 0);
            
            // Aplicar a transição de fade-in separadamente
            bar.transition()
                .duration(300)
                .delay(index * 50)
                .style('opacity', 1);
            
            // Label
            bar.append('div')
                .style('color', '#888')
                .style('margin-bottom', '0.25rem')
                .style('font-size', '0.9rem')
                .text(`${rank.name}: ${Math.round(rank.value)}%`);
            
            // Fundo
            const barBg = bar.append('div')
                .style('background', '#2d2d2d')
                .style('height', '12px')
                .style('border-radius', '6px')
                .style('overflow', 'hidden');
            
            // Barra preenchida
            barBg.append('div')
                .style('background', 'linear-gradient(90deg, #d91c1c, #ff4444)')
                .style('height', '100%')
                .style('width', '0%')
                .transition()
                .duration(1000)
                .delay(index * 50)
                .style('width', `${rank.value}%`);
        });
    },
    
    renderStatsTable() {
        const f = this.currentFighter;
        
        const stats = [
            { label: 'SPLM (Strikes Landed per Min)', value: f.splm.toFixed(2) },
            { label: 'Striking Accuracy (%)', value: f.str_acc },
            { label: 'SAPM (Strikes Absorbed per Min)', value: f.sapm.toFixed(2) },
            { label: 'Striking Defense (%)', value: f.str_def },
            { label: 'TD Avg (Takedowns / Lift)', value: f.td_avg.toFixed(2) },
            { label: 'TD Accuracy (%)', value: f.td_avg_acc },
            { label: 'TD Defense (%)', value: f.td_def },
            { label: 'Sub Avg (Submission / Lift)', value: f.sub_avg.toFixed(2) }
        ];
        
        const tbody = document.getElementById('stats-tbody');
        tbody.innerHTML = stats.map(stat => `
            <tr>
                <td>${stat.label}</td>
                <td>${stat.value}</td>
            </tr>
        `).join('');
    },
    
    renderRadarCharts() {
        const f = this.currentFighter;
        
        // Striking radar
        const strikingData = [
            { axis: 'SPLM', value: Math.min(f.splm * 10, 100) },
            { axis: 'Accuracy', value: f.str_acc },
            { axis: 'SAPM', value: Math.min(f.sapm * 10, 100) },
            { axis: 'Defense', value: f.str_def }
        ];
        
        this.drawRadar('#striking-radar', strikingData);
        
        // Takedown radar
        const takedownData = [
            { axis: 'TD Avg', value: Math.min(f.td_avg * 20, 100) },
            { axis: 'TD Acc', value: f.td_avg_acc },
            { axis: 'TD Def', value: f.td_def },
            { axis: 'Sub Avg', value: Math.min(f.sub_avg * 50, 100) }
        ];
        
        this.drawRadar('#takedown-radar', takedownData);
    },
    
    drawRadar(selector, data) {
        const width = 300;
        const height = 300;
        const margin = 60;
        const radius = Math.min(width, height) / 2 - margin;
        const levels = 5;
        
        const svg = d3.select(selector);
        svg.selectAll('*').remove();
        
        const g = svg.append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        // Draw grid circles
        for (let i = 1; i <= levels; i++) {
            g.append('circle')
                .attr('r', (radius / levels) * i)
                .attr('class', 'radar-grid');
        }
        
        // Draw axes
        const angleSlice = (Math.PI * 2) / data.length;
        
        data.forEach((d, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            g.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', y)
                .attr('class', 'radar-axis');
            
            // Labels
            const labelRadius = radius + 20;
            const labelX = labelRadius * Math.cos(angle);
            const labelY = labelRadius * Math.sin(angle);
            
            g.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('class', 'radar-label')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .text(d.axis);
        });
        
        // Draw data area
        const lineGenerator = d3.lineRadial()
            .angle((d, i) => angleSlice * i)
            .radius(d => (d.value / 100) * radius)
            .curve(d3.curveLinearClosed);
        
        g.append('path')
            .datum(data)
            .attr('d', lineGenerator)
            .attr('class', 'radar-area');
        
        // Draw data points
        data.forEach((d, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const r = (d.value / 100) * radius;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            
            g.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 4)
                .attr('fill', '#d91c1c')
                .attr('stroke', 'white')
                .attr('stroke-width', 2);
        });
    }
};