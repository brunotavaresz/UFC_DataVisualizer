// Fighter details page with interactive tooltips and legends

const FighterDetails = {
    currentFighter: null,
    tooltip: null,
    
    async show(fighterId) {
        this.currentFighter = DataLoader.getFighterById(fighterId);
        
        if (!this.currentFighter) {
            console.error('Fighter not found:', fighterId);
            return;
        }
        
        Navigation.navigateTo('fighter-details');
        
        // SCROLL IMEDIATO para o topo
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        this.showLoadingState();
        
        await this.preloadFighterPhotos();
        
        this.createTooltip();
        this.renderModernLayout();
        
        this.hideLoadingState();
        
        // Garante que fica no topo após renderizar
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 50);
    },
    
    createTooltip() {
        // Remove existing tooltip
        if (this.tooltip) {
            this.tooltip.remove();
        }
        
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            pointer-events: none;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.2s ease;
            border: 2px solid #d91c1c;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            max-width: 300px;
            line-height: 1.5;
        `;
        document.body.appendChild(this.tooltip);
    },

    createCompareButton(f) {
    const container = document.createElement('div');
    container.id = 'compare-fighter-btn'; // Add ID for tour guide
    container.style.cssText = `
        background: #1a1a1a;
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 2px solid #d91c1c;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    `;
    
    // Efeito de brilho animado na border
    const shine = document.createElement('div');
    shine.style.cssText = `
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            45deg,
            transparent,
            rgba(217, 28, 28, 0.3),
            transparent
        );
        transform: rotate(45deg);
        animation: shine 3s infinite;
    `;
    container.appendChild(shine);
    
    // Ícone principal
    const icon = document.createElement('div');
    icon.style.cssText = `
        font-size: 3rem;
        margin-bottom: 0.5rem;
        position: relative;
        z-index: 1;
        filter: drop-shadow(0 0 8px rgba(217, 28, 28, 0.5));
    `;
    icon.textContent = '⚖️';
    container.appendChild(icon);
    
    // Título
    const title = document.createElement('h3');
    title.style.cssText = `
        color: #fff;
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        position: relative;
        z-index: 1;
    `;
    title.textContent = 'Compare Fighter';
    container.appendChild(title);
    
    // Subtítulo
    const subtitle = document.createElement('p');
    subtitle.style.cssText = `
        color: #888;
        font-size: 0.9rem;
        margin: 0;
        position: relative;
        z-index: 1;
    `;
    subtitle.textContent = 'See how they match up';
    container.appendChild(subtitle);
    
    // Hover effects
    container.addEventListener('mouseenter', (e) => {
        container.style.transform = 'translateY(-5px) scale(1.02)';
        container.style.boxShadow = '0 12px 40px rgba(217, 28, 28, 0.4)';
        container.style.borderColor = '#ff4444';
        container.style.background = '#242424';
        this.showTooltip(
            '⚖️ <strong>Compare Fighters</strong><br>Select another fighter to see a side-by-side comparison of stats, records, and performance metrics.',
            e.clientX,
            e.clientY
        );
    });
    
    container.addEventListener('mouseleave', () => {
        container.style.transform = 'translateY(0) scale(1)';
        container.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        container.style.borderColor = '#d91c1c';
        container.style.background = '#1a1a1a';
        this.hideTooltip();
    });
    
    container.addEventListener('mousemove', (e) => {
        this.showTooltip(
            '⚖️ <strong>Compare Fighters</strong><br>Select another fighter to see a side-by-side comparison of stats, records, and performance metrics.',
            e.clientX,
            e.clientY
        );
    });
    
    container.addEventListener('click', () => {
        this.hideTooltip();
        // Aqui você chama a função de comparação
        FighterComparison.startComparison(f.id);
        console.log('Starting comparison for fighter:', f.id, f.name);
        
        // Feedback visual no clique
        container.style.transform = 'scale(0.95)';
        setTimeout(() => {
            container.style.transform = 'translateY(-5px) scale(1.02)';
        }, 100);
    });
    
    // Adiciona a animação de brilho
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
    `;
    container.appendChild(style);
    
    return container;
},
    
    showTooltip(text, x, y) {
        this.tooltip.innerHTML = text;
        this.tooltip.style.left = (x + 15) + 'px';
        this.tooltip.style.top = (y - 15) + 'px';
        this.tooltip.style.opacity = '1';
    },
    
    hideTooltip() {
        this.tooltip.style.opacity = '0';
    },
    
    showLoadingState() {
        const detailsPage = document.getElementById('fighter-details');
        
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
            const photos = await FighterPhotos.getFighterPhotos(f);
            
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
        }
    },
    
    preloadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
            setTimeout(resolve, 5000);
        });
    },
    
    renderModernLayout() {
        const f = this.currentFighter;
        const detailsPage = document.getElementById('fighter-details');
        
        detailsPage.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
            animation: fadeIn 0.5s ease;
        `;
        
        const leftPanel = document.createElement('div');
        leftPanel.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        `;
        
        leftPanel.appendChild(this.createFighterCard(f));
        leftPanel.appendChild(this.createQuickStats(f));
        leftPanel.appendChild(this.createCompareButton(f)); // ← ADICIONE AQUI
        leftPanel.appendChild(this.createPhysicalAttributes(f));
        
        const rightPanel = document.createElement('div');
        rightPanel.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        `;
        
        rightPanel.appendChild(this.createRecordSection(f));
        
        const metricsGrid = document.createElement('div');
        metricsGrid.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        `;
        
        metricsGrid.appendChild(this.createStrikingRadar(f));
        metricsGrid.appendChild(this.createTakedownRadar(f));
        
        rightPanel.appendChild(metricsGrid);
        rightPanel.appendChild(this.createDetailedStatsBars(f));
        rightPanel.appendChild(this.createStatsTable(f));
        
        container.appendChild(leftPanel);
        container.appendChild(rightPanel);
        detailsPage.appendChild(container);
    },
    
    createFighterCard(f) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid #333;
        `;
        
        const avatarContainer = document.createElement('div');
        avatarContainer.style.cssText = `
            width: 200px;
            height: 200px;
            margin: 0 auto 1.5rem;
            position: relative;
        `;
        
        const img = document.createElement('img');
        img.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #d91c1c;
            box-shadow: 0 8px 32px rgba(217, 28, 28, 0.4);
            cursor: pointer;
            transition: transform 0.3s ease;
        `;
        
        img.addEventListener('mouseenter', (e) => {
            img.style.transform = 'scale(1.05)';
            this.showTooltip('📸 Click to view full body photo', e.clientX, e.clientY);
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
            this.hideTooltip();
        });
        
        img.addEventListener('mousemove', (e) => {
            this.showTooltip('📸 Click to view full body photo', e.clientX, e.clientY);
        });
        
        avatarContainer.appendChild(img);
        
        if (typeof FighterPhotos !== 'undefined') {
    const cacheKey = f.id;
    const cachedPhotos = FighterPhotos.photoCache[cacheKey];
    
    if (cachedPhotos && cachedPhotos.headshot) {
        img.src = cachedPhotos.headshot;
        img.addEventListener('click', () => {
            const fullBodyUrl = cachedPhotos.fullBody || cachedPhotos.headshot;
            this.showFullBodyModal(fullBodyUrl, f.name);
        });
    } else {
        // Carrega a foto e adiciona o evento de click
        FighterPhotos.loadPhotoIntoElement(f, img).then(() => {
            // Após carregar, adiciona o click handler
            img.addEventListener('click', () => {
                const photos = FighterPhotos.photoCache[f.id];
                if (photos) {
                    const fullBodyUrl = photos.fullBody || photos.headshot;
                    this.showFullBodyModal(fullBodyUrl, f.name);
                }
            });
        });
    }
} else {
    const initials = f.name.split(' ').map(n => n[0]).join('');
    avatarContainer.innerHTML = `
        <div style="
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
            box-shadow: 0 8px 32px rgba(217, 28, 28, 0.4);
        ">${initials}</div>
    `;
}
        
        card.appendChild(avatarContainer);
        
        const name = document.createElement('h1');
        name.style.cssText = `
            color: #fff;
            font-size: 2rem;
            margin: 0 0 0.5rem 0;
            font-weight: 700;
        `;
        name.textContent = f.name;
        card.appendChild(name);
        
        if (f.nickname) {
            const nickname = document.createElement('div');
            nickname.style.cssText = `
                color: #d91c1c;
                font-size: 1.2rem;
                font-style: italic;
                margin-bottom: 1rem;
            `;
            nickname.textContent = `"${f.nickname}"`;
            card.appendChild(nickname);
        }
        
        const stanceBadge = document.createElement('div');
        stanceBadge.style.cssText = `
            display: inline-block;
            background: rgba(217, 28, 28, 0.2);
            border: 1px solid #d91c1c;
            border-radius: 20px;
            padding: 0.5rem 1rem;
            color: #d91c1c;
            font-weight: 600;
            margin-top: 1rem;
            cursor: help;
        `;
        stanceBadge.textContent = formatStance(f.stance);
        
        stanceBadge.addEventListener('mouseenter', (e) => {
            const stanceInfo = this.getStanceInfo(f.stance);
            this.showTooltip(stanceInfo, e.clientX, e.clientY);
        });
        
        stanceBadge.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        stanceBadge.addEventListener('mousemove', (e) => {
            const stanceInfo = this.getStanceInfo(f.stance);
            this.showTooltip(stanceInfo, e.clientX, e.clientY);
        });
        
        card.appendChild(stanceBadge);
        
        return card;
    },
    
    getStanceInfo(stance) {
        const stances = {
            'Orthodox': '🥊 <strong>Orthodox Stance</strong><br>Left foot forward, right hand power punches.<br>Most common stance in MMA.',
            'Southpaw': '🥊 <strong>Southpaw Stance</strong><br>Right foot forward, left hand power punches.<br>Gives advantage against orthodox fighters.',
            'Switch': '🥊 <strong>Switch Stance</strong><br>Can fight both orthodox and southpaw.<br>Very versatile and unpredictable.'
        };
        return stances[stance] || '🥊 Fighting stance';
    },
    
    createQuickStats(f) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid #333;
        `;
        
        const title = document.createElement('h3');
        title.style.cssText = `
            color: #fff;
            margin: 0 0 1rem 0;
            font-size: 1.2rem;
        `;
        title.textContent = 'Quick Stats';
        container.appendChild(title);
        
        const totalFights = f.wins + f.losses + f.draws;
        const stats = [
            { label: 'Age', value: f.age || '-', icon: '👤', tooltip: 'Current age of the fighter' },
            { label: 'Win Rate', value: `${f.winRate}%`, icon: '🎯', tooltip: `Win percentage: ${f.wins} wins out of ${totalFights} total fights` },
            { label: 'Total Fights', value: totalFights, icon: '🥊', tooltip: `Career record: ${f.wins}W - ${f.losses}L - ${f.draws}D` }
        ];
        
        stats.forEach(stat => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid #2d2d2d;
                cursor: help;
                transition: background 0.2s ease;
            `;
            
            row.addEventListener('mouseenter', (e) => {
                row.style.background = 'rgba(217, 28, 28, 0.1)';
                this.showTooltip(stat.tooltip, e.clientX, e.clientY);
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.background = 'transparent';
                this.hideTooltip();
            });
            
            row.addEventListener('mousemove', (e) => {
                this.showTooltip(stat.tooltip, e.clientX, e.clientY);
            });
            
            const label = document.createElement('span');
            label.style.cssText = `
                color: #888;
                font-size: 0.95rem;
            `;
            label.textContent = `${stat.icon} ${stat.label}`;
            
            const value = document.createElement('span');
            value.style.cssText = `
                color: #fff;
                font-weight: 600;
                font-size: 1.1rem;
            `;
            value.textContent = stat.value;
            
            row.appendChild(label);
            row.appendChild(value);
            container.appendChild(row);
        });
        
        return container;
    },
    
    createPhysicalAttributes(f) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid #333;
        `;
        
        const title = document.createElement('h3');
        title.style.cssText = `
            color: #fff;
            margin: 0 0 1rem 0;
            font-size: 1.2rem;
        `;
        title.textContent = 'Physical';
        container.appendChild(title);
        
        const reachLabel = document.createElement('div');
        reachLabel.style.cssText = `
            color: #888;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            cursor: help;
        `;
        reachLabel.textContent = `Reach: ${f.reach}"`;
        
        reachLabel.addEventListener('mouseenter', (e) => {
            this.showTooltip(`📏 <strong>Reach:</strong> ${f.reach} inches<br>Arm span from fingertip to fingertip.<br>Longer reach = can strike from further away.`, e.clientX, e.clientY);
        });
        
        reachLabel.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        reachLabel.addEventListener('mousemove', (e) => {
            this.showTooltip(`📏 <strong>Reach:</strong> ${f.reach} inches<br>Arm span from fingertip to fingertip.<br>Longer reach = can strike from further away.`, e.clientX, e.clientY);
        });
        
        container.appendChild(reachLabel);
        
        const reachBar = document.createElement('div');
        reachBar.style.cssText = `
            background: #2d2d2d;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 1rem;
            cursor: help;
        `;
        
        const reachFill = document.createElement('div');
        const reachPercent = Math.min((f.reach / 84) * 100, 100);
        reachFill.style.cssText = `
            background: linear-gradient(90deg, #4ade80, #22c55e);
            height: 100%;
            width: 0%;
            transition: width 1s ease;
        `;
        
        setTimeout(() => {
            reachFill.style.width = `${reachPercent}%`;
        }, 100);
        
        reachBar.appendChild(reachFill);
        
        reachBar.addEventListener('mouseenter', (e) => {
            this.showTooltip(`📏 Reach advantage: ${reachPercent.toFixed(0)}%<br>Compared to maximum typical reach (84")`, e.clientX, e.clientY);
        });
        
        reachBar.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        reachBar.addEventListener('mousemove', (e) => {
            this.showTooltip(`📏 Reach advantage: ${reachPercent.toFixed(0)}%<br>Compared to maximum typical reach (84")`, e.clientX, e.clientY);
        });
        
        container.appendChild(reachBar);
        
        return container;
    },
    
    createRecordSection(f) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid #333;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #fff;
            margin: 0;
            font-size: 1.5rem;
        `;
        title.textContent = 'Fight Record';
        
        const legendInfo = document.createElement('span');
        legendInfo.style.cssText = `
            color: #666;
            font-size: 0.85rem;
            cursor: help;
        `;
        legendInfo.textContent = 'ℹ️ Hover for details';
        
        legendInfo.addEventListener('mouseenter', (e) => {
            this.showTooltip('💡 Hover over the chart and stats to see detailed information about wins, losses, and draws.', e.clientX, e.clientY);
        });
        
        legendInfo.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        legendInfo.addEventListener('mousemove', (e) => {
            this.showTooltip('💡 Hover over the chart and stats to see detailed information about wins, losses, and draws.', e.clientX, e.clientY);
        });
        
        header.appendChild(title);
        header.appendChild(legendInfo);
        container.appendChild(header);
        
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 2rem;
        `;
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'modern-record-chart';
        chartDiv.style.cssText = `
            flex: 1;
            min-width: 250px;
        `;
        contentDiv.appendChild(chartDiv);
        
        const recordBoxes = document.createElement('div');
        recordBoxes.style.cssText = `
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        `;
        
        const totalFights = f.wins + f.losses + f.draws;
        const recordData = [
            { 
                label: 'Wins', 
                value: f.wins, 
                color: '#4ade80', 
                icon: '✓',
                tooltip: `<strong>${f.wins} Wins</strong><br>${((f.wins/totalFights)*100).toFixed(1)}% of total fights<br>Victories by KO, submission, or decision`
            },
            { 
                label: 'Losses', 
                value: f.losses, 
                color: '#ef4444', 
                icon: '✗',
                tooltip: `<strong>${f.losses} Losses</strong><br>${((f.losses/totalFights)*100).toFixed(1)}% of total fights<br>Defeats by KO, submission, or decision`
            },
            { 
                label: 'Draws', 
                value: f.draws, 
                color: '#fbbf24', 
                icon: '−',
                tooltip: `<strong>${f.draws} Draws</strong><br>${((f.draws/totalFights)*100).toFixed(1)}% of total fights<br>Fights that ended in a tie`
            }
        ];
        
        recordData.forEach(item => {
            const box = document.createElement('div');
            box.style.cssText = `
                background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5));
                border: 2px solid ${item.color};
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                min-width: 100px;
                cursor: help;
                transition: all 0.3s ease;
            `;
            
            box.addEventListener('mouseenter', (e) => {
                box.style.transform = 'translateY(-5px)';
                box.style.boxShadow = `0 8px 16px ${item.color}40`;
                this.showTooltip(item.tooltip, e.clientX, e.clientY);
            });
            
            box.addEventListener('mouseleave', () => {
                box.style.transform = 'translateY(0)';
                box.style.boxShadow = 'none';
                this.hideTooltip();
            });
            
            box.addEventListener('mousemove', (e) => {
                this.showTooltip(item.tooltip, e.clientX, e.clientY);
            });
            
            const value = document.createElement('div');
            value.style.cssText = `
                font-size: 2.5rem;
                font-weight: 700;
                color: ${item.color};
                margin-bottom: 0.5rem;
            `;
            value.textContent = item.value;
            
            const label = document.createElement('div');
            label.style.cssText = `
                color: #888;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            `;
            label.textContent = item.label;
            
            box.appendChild(value);
            box.appendChild(label);
            recordBoxes.appendChild(box);
        });
        
        contentDiv.appendChild(recordBoxes);
        container.appendChild(contentDiv);
        
        setTimeout(() => this.renderModernRecordChart(f), 50);
        
        return container;
    },
    
    renderModernRecordChart(f) {
        const container = document.getElementById('modern-record-chart');
        const canvas = document.createElement('canvas');
        canvas.width = 280;
        canvas.height = 280;
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        const innerRadius = 50;
        
        const total = f.wins + f.losses + f.draws;
        const data = [
            { label: 'Wins', value: f.wins, color: '#4ade80', percent: (f.wins/total*100).toFixed(1) },
            { label: 'Losses', value: f.losses, color: '#ef4444', percent: (f.losses/total*100).toFixed(1) },
            { label: 'Draws', value: f.draws, color: '#fbbf24', percent: (f.draws/total*100).toFixed(1) }
        ].filter(d => d.value > 0);
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw value
            const midAngle = currentAngle + sliceAngle / 2;
            const textRadius = (radius + innerRadius) / 2;
            const textX = centerX + Math.cos(midAngle) * textRadius;
            const textY = centerY + Math.sin(midAngle) * textRadius;
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.value, textX, textY);
            
            currentAngle += sliceAngle;
        });
        
        // Center text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(total, centerX, centerY - 8);
        
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.fillText('TOTAL', centerX, centerY + 12);
        
        // Add hover functionality
        canvas.style.cursor = 'help';
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - centerX;
            const y = e.clientY - rect.top - centerY;
            const distance = Math.sqrt(x*x + y*y);
            
            if (distance >= innerRadius && distance <= radius) {
                let angle = Math.atan2(y, x);
                if (angle < -Math.PI / 2) angle += 2 * Math.PI;
                angle += Math.PI / 2;
                
                let checkAngle = -Math.PI / 2;
                for (let item of data) {
                    const sliceAngle = (item.value / total) * 2 * Math.PI;
                    if (angle >= checkAngle && angle < checkAngle + sliceAngle) {
                        this.showTooltip(
                            `<strong>${item.label}: ${item.value}</strong><br>${item.percent}% of total fights`,
                            e.clientX,
                            e.clientY
                        );
                        return;
                    }
                    checkAngle += sliceAngle;
                }
            }
            this.hideTooltip();
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    },
    
   createStrikingRadar(f) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid #333;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        `;
        
        const title = document.createElement('h3');
        title.style.cssText = `
            color: #fff;
            margin: 0;
            font-size: 1.2rem;
            cursor: help;
        `;
        title.textContent = '🥊 Striking';
        
        title.addEventListener('mouseenter', (e) => {
            this.showTooltip('💥 <strong>Striking Stats</strong><br>SPLM: Strikes landed per minute<br>Accuracy: % of strikes that land<br>Defense: % of strikes avoided<br>SAPM: Strikes absorbed per minute (lower is better)', e.clientX, e.clientY);
        });
        
        title.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        title.addEventListener('mousemove', (e) => {
            this.showTooltip('💥 <strong>Striking Stats</strong><br>SPLM: Strikes landed per minute<br>Accuracy: % of strikes that land<br>Defense: % of strikes avoided<br>SAPM: Strikes absorbed per minute (lower is better)', e.clientX, e.clientY);
        });
        
        header.appendChild(title);
        container.appendChild(header);
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'modern-striking-radar';
        container.appendChild(chartDiv);
        
        setTimeout(() => {
            const strikingData = [
                { 
                    axis: 'SPLM', 
                    value: Math.min(f.splm * 10, 100),
                    description: 'Strikes Per Minute Landed - Average number of strikes that connect per minute'
                },
                { 
                    axis: 'Accuracy', 
                    value: f.str_acc,
                    description: 'Strike Accuracy - Percentage of attempted strikes that hit the target'
                },
                { 
                    axis: 'Defense', 
                    value: f.str_def,
                    description: 'Defense - Percentage of opponent\'s strikes that are blocked or evaded'
                },
                { 
                    axis: 'SAPM', 
                    value: 100 - Math.min(f.sapm * 10, 100),
                    description: 'Strikes Absorbed Per Minute - Average number of strikes received per minute'
                }
            ];
            this.drawModernRadar('#modern-striking-radar', strikingData, '#d91c1c');
        }, 50);
        
        return container;
    },
    
    createTakedownRadar(f) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid #333;
        `;
        
        const title = document.createElement('h3');
        title.style.cssText = `
            color: #fff;
            margin: 0 0 1rem 0;
            font-size: 1.2rem;
            text-align: center;
            cursor: help;
        `;
        title.textContent = '🤼 Grappling';
        
        title.addEventListener('mouseenter', (e) => {
            this.showTooltip('🤼 <strong>Grappling Stats</strong><br>TD Avg: Takedowns per 15min<br>TD Acc: Takedown accuracy %<br>TD Def: Takedown defense %<br>Sub Avg: Submission attempts per 15min', e.clientX, e.clientY);
        });
        
        title.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        title.addEventListener('mousemove', (e) => {
            this.showTooltip('🤼 <strong>Grappling Stats</strong><br>TD Avg: Takedowns per 15min<br>TD Acc: Takedown accuracy %<br>TD Def: Takedown defense %<br>Sub Avg: Submission attempts per 15min', e.clientX, e.clientY);
        });
        
        container.appendChild(title);
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'modern-takedown-radar';
        container.appendChild(chartDiv);
        
        setTimeout(() => {
            const takedownData = [
                { 
                    axis: 'TD Avg', 
                    value: Math.min(f.td_avg * 20, 100),
                    description: 'Takedown Average - Average number of takedowns landed per 15 minutes'
                },
                { 
                    axis: 'TD Acc', 
                    value: f.td_avg_acc,
                    description: 'Takedown Accuracy - Success rate of takedown attempts'
                },
                { 
                    axis: 'TD Def', 
                    value: f.td_def,
                    description: 'Takedown Defense - Percentage of takedown attempts successfully defended'
                },
                { 
                    axis: 'Sub Avg', 
                    value: Math.min(f.sub_avg * 50, 100),
                    description: 'Submission Average - Average number of submission attempts per 15 minutes'
                }
            ];
            this.drawModernRadar('#modern-takedown-radar', takedownData, '#4ade80');
        }, 50);
        
        return container;
    },
    
    drawModernRadar(selector, data, color) {
        const width = 320;
        const height = 320;
        const margin = 70;
        const radius = Math.min(width, height) / 2 - margin;
        const levels = 5;
        
        const svg = d3.select(selector);
        svg.selectAll('*').remove();
        
        const svgEl = svg.append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const g = svgEl.append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        for (let i = 1; i <= levels; i++) {
            g.append('circle')
                .attr('r', (radius / levels) * i)
                .attr('fill', 'none')
                .attr('stroke', '#333')
                .attr('stroke-width', 1);
        }
        
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
                .attr('stroke', '#444')
                .attr('stroke-width', 1);
            
            const labelRadius = radius + 25;
            const labelX = labelRadius * Math.cos(angle);
            const labelY = labelRadius * Math.sin(angle);
            
            g.append('text')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '12px')
                .attr('font-weight', '600')
                .text(d.axis);
        });
        
        const lineGenerator = d3.lineRadial()
            .angle((d, i) => angleSlice * i)
            .radius(d => (d.value / 100) * radius)
            .curve(d3.curveLinearClosed);
        
        g.append('path')
            .datum(data)
            .attr('d', lineGenerator)
            .attr('fill', color)
            .attr('fill-opacity', 0.2)
            .attr('stroke', color)
            .attr('stroke-width', 3);
        
        data.forEach((d, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const r = (d.value / 100) * radius;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            
            // Adiciona um ponto interativo com tooltip
            const point = g.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 5)
                .attr('fill', color)
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style('cursor', 'pointer');
                
            // Adiciona eventos para mostrar/esconder tooltip
            const svgNode = svgEl.node();
            point.on('mouseenter', (event) => {
                point.attr('r', 7); // Aumenta o tamanho do ponto
                const rect = svgNode.getBoundingClientRect();
                const tooltipX = rect.x + x + width/2;
                const tooltipY = rect.y + y + height/2;
                
                // Calcula a posição ideal para a tooltip
                const offset = 20; // Distância da tooltip ao ponto
                let finalX = tooltipX;
                let finalY = tooltipY - offset; // Posiciona acima do ponto por padrão
                
                // Se a tooltip ficaria muito próxima ao topo da janela, mostra abaixo do ponto
                if (tooltipY - offset < 10) {
                    finalY = tooltipY + offset;
                }
                
                // Ajusta a posição horizontal se necessário para evitar que saia da tela
                const tooltipWidth = 300; // Largura máxima da tooltip
                if (finalX + tooltipWidth > window.innerWidth) {
                    finalX = Math.max(10, window.innerWidth - tooltipWidth - 10);
                }
                
                FighterDetails.showTooltip(`📊 <strong>${d.axis}</strong><br>${d.description}<br>Valor: ${Math.round(d.value)}%`, finalX, finalY);
            })
            .on('mouseleave', () => {
                point.attr('r', 5); // Retorna ao tamanho original
                FighterDetails.hideTooltip();
            })
            .on('mousemove', (event) => {
                const rect = svgNode.getBoundingClientRect();
                const tooltipX = rect.x + x + width/2;
                const tooltipY = rect.y + y + height/2;
                
                // Calcula a posição ideal para a tooltip
                const offset = 20;
                let finalX = tooltipX;
                let finalY = tooltipY - offset;
                
                if (tooltipY - offset < 10) {
                    finalY = tooltipY + offset;
                }
                
                const tooltipWidth = 300;
                if (finalX + tooltipWidth > window.innerWidth) {
                    finalX = Math.max(10, window.innerWidth - tooltipWidth - 10);
                }
                
                FighterDetails.showTooltip(`📊 <strong>${d.axis}</strong><br>${d.description}<br>Valor: ${Math.round(d.value)}%`, finalX, finalY);
            });
        });
    },
    
    createDetailedStatsBars(f) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid #333;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #fff;
            margin: 0 0 1.5rem 0;
            font-size: 1.5rem;
            cursor: help;
        `;
        title.textContent = 'Performance Metrics';
        
        title.addEventListener('mouseenter', (e) => {
            this.showTooltip('📊 <strong>Performance Overview</strong><br>Key performance indicators showing fighter strengths.<br>Higher percentages indicate better performance.', e.clientX, e.clientY);
        });
        
        title.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        title.addEventListener('mousemove', (e) => {
            this.showTooltip('📊 <strong>Performance Overview</strong><br>Key performance indicators showing fighter strengths.<br>Higher percentages indicate better performance.', e.clientX, e.clientY);
        });
        
        container.appendChild(title);
        
        const barsContainer = document.createElement('div');
        barsContainer.id = 'performance-bars';
        container.appendChild(barsContainer);
        
        const metrics = [
            { 
                name: 'Win Rate', 
                value: f.winRate, 
                max: 100, 
                color: '#4ade80',
                tooltip: `🎯 <strong>Win Rate: ${f.winRate}%</strong><br>Percentage of fights won throughout career.<br>${f.wins} wins out of ${f.wins + f.losses + f.draws} total fights.`
            },
            { 
                name: 'Striking Accuracy', 
                value: f.str_acc, 
                max: 100, 
                color: '#3b82f6',
                tooltip: `🎯 <strong>Striking Accuracy: ${f.str_acc}%</strong><br>Percentage of strikes that successfully land.<br>Higher accuracy = more efficient striking.`
            },
            { 
                name: 'Striking Defense', 
                value: f.str_def, 
                max: 100, 
                color: '#8b5cf6',
                tooltip: `🛡️ <strong>Striking Defense: ${f.str_def}%</strong><br>Percentage of opponent strikes avoided.<br>Higher defense = better evasion skills.`
            },
            { 
                name: 'Takedown Accuracy', 
                value: f.td_avg_acc, 
                max: 100, 
                color: '#f59e0b',
                tooltip: `🤼 <strong>Takedown Accuracy: ${f.td_avg_acc}%</strong><br>Success rate of takedown attempts.<br>Shows grappling effectiveness.`
            },
            { 
                name: 'Takedown Defense', 
                value: f.td_def, 
                max: 100, 
                color: '#ec4899',
                tooltip: `🛡️ <strong>Takedown Defense: ${f.td_def}%</strong><br>Success rate defending takedowns.<br>Crucial for keeping fights standing.`
            },
            { 
                name: 'Reach Advantage', 
                value: Math.min((f.reach / 84) * 100, 100), 
                max: 100, 
                color: '#06b6d4',
                tooltip: `📏 <strong>Reach: ${f.reach}"</strong><br>Relative reach advantage (max 84").<br>Longer reach = strike from distance.`
            }
        ];
        
        metrics.forEach((metric, index) => {
            const barWrapper = document.createElement('div');
            barWrapper.style.cssText = `
                margin-bottom: 1.5rem;
                opacity: 0;
                animation: fadeInUp 0.5s ease forwards;
                animation-delay: ${index * 0.1}s;
                cursor: help;
            `;
            
            barWrapper.addEventListener('mouseenter', (e) => {
                this.showTooltip(metric.tooltip, e.clientX, e.clientY);
            });
            
            barWrapper.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            barWrapper.addEventListener('mousemove', (e) => {
                this.showTooltip(metric.tooltip, e.clientX, e.clientY);
            });
            
            const labelRow = document.createElement('div');
            labelRow.style.cssText = `
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            `;
            
            const label = document.createElement('span');
            label.style.cssText = `
                color: #fff;
                font-weight: 600;
                font-size: 0.95rem;
            `;
            label.textContent = metric.name;
            
            const value = document.createElement('span');
            value.style.cssText = `
                color: ${metric.color};
                font-weight: 700;
                font-size: 1rem;
            `;
            value.textContent = `${Math.round(metric.value)}%`;
            
            labelRow.appendChild(label);
            labelRow.appendChild(value);
            
            const barBg = document.createElement('div');
            barBg.style.cssText = `
                background: #2d2d2d;
                height: 14px;
                border-radius: 7px;
                overflow: hidden;
                position: relative;
            `;
            
            const barFill = document.createElement('div');
            barFill.style.cssText = `
                background: linear-gradient(90deg, ${metric.color}, ${metric.color}dd);
                height: 100%;
                width: 0%;
                transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 0 10px ${metric.color}80;
            `;
            
            setTimeout(() => {
                barFill.style.width = `${metric.value}%`;
            }, 100 + index * 100);
            
            barBg.appendChild(barFill);
            barWrapper.appendChild(labelRow);
            barWrapper.appendChild(barBg);
            barsContainer.appendChild(barWrapper);
        });
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        container.appendChild(style);
        
        return container;
    },
    
    createStatsTable(f) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid #333;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #fff;
            margin: 0 0 1.5rem 0;
            font-size: 1.5rem;
        `;
        title.textContent = 'Detailed Statistics';
        container.appendChild(title);
        
        const stats = [
            { 
                category: 'Striking',
                items: [
                    { 
                        label: 'Strikes Landed per Minute', 
                        value: f.splm.toFixed(2), 
                        unit: 'SPLM',
                        tooltip: `💥 <strong>SPLM: ${f.splm.toFixed(2)}</strong><br>Average strikes landed per minute.<br>Shows offensive output and aggression.`
                    },
                    { 
                        label: 'Striking Accuracy', 
                        value: f.str_acc, 
                        unit: '%',
                        tooltip: `🎯 <strong>Accuracy: ${f.str_acc}%</strong><br>Percentage of strikes that land.<br>Higher = more precise striking.`
                    },
                    { 
                        label: 'Strikes Absorbed per Minute', 
                        value: f.sapm.toFixed(2), 
                        unit: 'SAPM',
                        tooltip: `🛡️ <strong>SAPM: ${f.sapm.toFixed(2)}</strong><br>Average strikes absorbed per minute.<br>Lower is better = better defense.`
                    },
                    { 
                        label: 'Striking Defense', 
                        value: f.str_def, 
                        unit: '%',
                        tooltip: `🛡️ <strong>Defense: ${f.str_def}%</strong><br>Percentage of opponent strikes avoided.<br>Shows defensive skills.`
                    }
                ]
            },
            {
                category: 'Grappling',
                items: [
                    { 
                        label: 'Takedown Average', 
                        value: f.td_avg.toFixed(2), 
                        unit: 'per 15min',
                        tooltip: `🤼 <strong>TD Avg: ${f.td_avg.toFixed(2)}</strong><br>Average takedowns per 15 minutes.<br>Shows wrestling ability.`
                    },
                    { 
                        label: 'Takedown Accuracy', 
                        value: f.td_avg_acc, 
                        unit: '%',
                        tooltip: `🎯 <strong>TD Accuracy: ${f.td_avg_acc}%</strong><br>Success rate of takedown attempts.<br>Higher = more effective wrestling.`
                    },
                    { 
                        label: 'Takedown Defense', 
                        value: f.td_def, 
                        unit: '%',
                        tooltip: `🛡️ <strong>TD Defense: ${f.td_def}%</strong><br>Success rate defending takedowns.<br>Important for controlling fight location.`
                    },
                    { 
                        label: 'Submission Average', 
                        value: f.sub_avg.toFixed(2), 
                        unit: 'per 15min',
                        tooltip: `🔒 <strong>Sub Avg: ${f.sub_avg.toFixed(2)}</strong><br>Average submission attempts per 15min.<br>Shows submission threat level.`
                    }
                ]
            }
        ];
        
        stats.forEach((category, catIndex) => {
            const categoryHeader = document.createElement('div');
            categoryHeader.style.cssText = `
                color: #d91c1c;
                font-weight: 700;
                font-size: 1.1rem;
                margin: ${catIndex > 0 ? '2rem' : '0'} 0 1rem 0;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #333;
            `;
            categoryHeader.textContent = category.category;
            container.appendChild(categoryHeader);
            
            const grid = document.createElement('div');
            grid.style.cssText = `
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            `;
            
            category.items.forEach(item => {
                const statCard = document.createElement('div');
                statCard.style.cssText = `
                    background: #242424;
                    border-radius: 12px;
                    padding: 1.25rem;
                    border: 1px solid #333;
                    transition: all 0.3s ease;
                    cursor: help;
                `;
                
                statCard.addEventListener('mouseenter', (e) => {
                    statCard.style.borderColor = '#d91c1c';
                    statCard.style.transform = 'translateY(-2px)';
                    statCard.style.boxShadow = '0 4px 12px rgba(217, 28, 28, 0.2)';
                    this.showTooltip(item.tooltip, e.clientX, e.clientY);
                });
                
                statCard.addEventListener('mouseleave', () => {
                    statCard.style.borderColor = '#333';
                    statCard.style.transform = 'translateY(0)';
                    statCard.style.boxShadow = 'none';
                    this.hideTooltip();
                });
                
                statCard.addEventListener('mousemove', (e) => {
                    this.showTooltip(item.tooltip, e.clientX, e.clientY);
                });
                
                const label = document.createElement('div');
                label.style.cssText = `
                    color: #888;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                `;
                label.textContent = item.label;
                
                const valueRow = document.createElement('div');
                valueRow.style.cssText = `
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                `;
                
                const value = document.createElement('span');
                value.style.cssText = `
                    color: #fff;
                    font-size: 1.8rem;
                    font-weight: 700;
                `;
                value.textContent = item.value;
                
                const unit = document.createElement('span');
                unit.style.cssText = `
                    color: #666;
                    font-size: 0.9rem;
                `;
                unit.textContent = item.unit;
                
                valueRow.appendChild(value);
                valueRow.appendChild(unit);
                statCard.appendChild(label);
                statCard.appendChild(valueRow);
                grid.appendChild(statCard);
            });
            
            container.appendChild(grid);
        });
        
        return container;
    },
    
    showFullBodyModal(photoUrl, fighterName) {
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
        
        modal.addEventListener('click', () => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.click();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        document.body.appendChild(modal);
    }
};