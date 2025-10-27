// Fighter Comparison Result Page - Full Implementation
const FighterComparisonResult = {
    fighter1: null,
    fighter2: null,
    
    async show(fighter1, fighter2) {
        this.fighter1 = fighter1;
        this.fighter2 = fighter2;
        
        Navigation.navigateTo('fighter-comparison-result');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Show loading state
        this.showLoadingState();
        
        // Preload photos
        await this.preloadBothFighterPhotos();
        
        // Render the comparison page
        this.renderComparisonPage();
        
        // Hide loading
        this.hideLoadingState();
        
        // Ensure scroll to top after render
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 50);
    },
    
    showLoadingState() {
        const page = document.getElementById('fighter-comparison-result');
        page.innerHTML = `
            <div class="loading-overlay" style="
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
            ">
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
                    <h2 style="color: #fff; margin: 0; font-size: 24px;">Preparing Comparison...</h2>
                    <p style="color: #888; margin-top: 10px; font-size: 14px;">Loading fighter data</p>
                </div>
            </div>
        `;
    },
    
    hideLoadingState() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    },
    
    async preloadBothFighterPhotos() {
        if (typeof FighterPhotos === 'undefined') return;
        
        try {
            await Promise.all([
                FighterPhotos.getFighterPhotos(this.fighter1),
                FighterPhotos.getFighterPhotos(this.fighter2)
            ]);
        } catch (error) {
            console.error('Error preloading photos:', error);
        }
    },
    
    renderComparisonPage() {
        const page = document.getElementById('fighter-comparison-result');
        page.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem;
            animation: fadeIn 0.5s ease;
        `;
        
        // Header with back button
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        `;
        
        const backBtn = document.createElement('button');
        backBtn.style.cssText = `
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 12px;
            padding: 0.75rem 1.5rem;
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        backBtn.innerHTML = '← Back';
        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.background = '#2d2d2d';
            backBtn.style.borderColor = '#d91c1c';
        });
        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.background = '#1a1a1a';
            backBtn.style.borderColor = '#333';
        });
        backBtn.addEventListener('click', () => {
            Navigation.navigateTo('fighter-comparison-select');
        });
        
        header.appendChild(backBtn);
        container.appendChild(header);
        
        // Main comparison grid
        const comparisonGrid = document.createElement('div');
        comparisonGrid.style.cssText = `
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 2rem;
            margin-bottom: 3rem;
        `;
        
        // Fighter 1 Card
        comparisonGrid.appendChild(this.createFighterHeaderCard(this.fighter1, 'left'));
        
        // VS Badge
        const vsBadge = document.createElement('div');
        vsBadge.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        `;
        
        const vsBadgeCircle = document.createElement('div');
        vsBadgeCircle.style.cssText = `
            background: linear-gradient(135deg, #d91c1c, #ff4444);
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: 900;
            color: white;
            box-shadow: 0 8px 32px rgba(217, 28, 28, 0.6);
            border: 4px solid #fff;
        `;
        vsBadgeCircle.textContent = 'VS';
        
        vsBadge.appendChild(vsBadgeCircle);
        comparisonGrid.appendChild(vsBadge);
        
        // Fighter 2 Card
        comparisonGrid.appendChild(this.createFighterHeaderCard(this.fighter2, 'right'));
        
        container.appendChild(comparisonGrid);
        
        // Stats Comparison Section
        container.appendChild(this.createStatsComparisonTable());
        
        // Radar Charts Section
        const radarSection = document.createElement('div');
        radarSection.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-top: 2rem;
        `;
        
        radarSection.appendChild(this.createDualRadarChart('striking'));
        radarSection.appendChild(this.createDualRadarChart('grappling'));
        
        container.appendChild(radarSection);
        
        page.appendChild(container);
        
        // Render radar charts after DOM is ready
        setTimeout(() => {
            this.renderStrikingComparison();
            this.renderGrapplingComparison();
        }, 100);
    },
    
    createFighterHeaderCard(fighter, side) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            border: 2px solid ${side === 'left' ? '#3b82f6' : '#d91c1c'};
            box-shadow: 0 8px 32px ${side === 'left' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(217, 28, 28, 0.3)'};
        `;
        
        // Fighter Photo
        const photoContainer = document.createElement('div');
        photoContainer.style.cssText = `
            width: 200px;
            height: 280px;
            margin: 0 auto 1.5rem;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            border: 3px solid ${side === 'left' ? '#3b82f6' : '#d91c1c'};
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        `;
        
        const img = document.createElement('img');
        img.className = 'fighter-photo loading';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: top center;
            background: #000;
        `;
        
        const spinner = document.createElement('div');
        spinner.className = 'mini-spinner';
        photoContainer.appendChild(spinner);
        
        if (typeof FighterPhotos !== 'undefined') {
            FighterPhotos.getFighterPhotos(fighter).then(photos => {
                img.src = photos.fullBody || photos.headshot || '';
            }).catch(() => {
                img.src = '';
            });
        } else {
            const initials = fighter.name.split(' ').map(n => n[0]).join('');
            spinner.remove();
            photoContainer.innerHTML = `
                <div style="
                    font-size: 4rem;
                    font-weight: bold;
                    color: ${side === 'left' ? '#3b82f6' : '#d91c1c'};
                ">${initials}</div>
            `;
        }
        
        img.addEventListener('load', () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
            if (spinner && spinner.parentNode) spinner.remove();
        });
        
        img.addEventListener('error', () => {
            if (spinner && spinner.parentNode) spinner.remove();
            img.classList.remove('loading');
            img.classList.add('loaded');
            const initials = fighter.name.split(' ').map(n => n[0]).join('');
            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.style.cssText = `font-size: 4rem; font-weight: bold; color: ${side === 'left' ? '#3b82f6' : '#d91c1c'};`;
            fallback.textContent = initials;
            photoContainer.appendChild(fallback);
        });
        
        photoContainer.appendChild(img);
        card.appendChild(photoContainer);
        
        // Fighter Name
        const name = document.createElement('h2');
        name.style.cssText = `
            color: #fff;
            font-size: 1.8rem;
            margin: 0 0 0.5rem 0;
        `;
        name.textContent = fighter.name;
        card.appendChild(name);
        
        // Nickname (always render to avoid layout shift when missing)
        const nickname = document.createElement('div');
        nickname.style.cssText = `
            color: ${side === 'left' ? '#3b82f6' : '#d91c1c'};
            font-size: 1.1rem;
            font-style: italic;
            margin-bottom: 1rem;
            min-height: 1.2em; /* reserve vertical space */
            transition: opacity 0.2s ease;
        `;
        // If nickname exists show it, otherwise keep element empty and invisible
        if (fighter.nickname) {
            nickname.textContent = `"${fighter.nickname}"`;
            nickname.style.opacity = '1';
        } else {
            nickname.textContent = '';
            nickname.style.opacity = '0';
        }
        nickname.setAttribute('aria-hidden', fighter.nickname ? 'false' : 'true');
        card.appendChild(nickname);
        
        // Record
        const record = document.createElement('div');
        record.style.cssText = `
            color: #888;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        `;
        record.textContent = `${fighter.wins}-${fighter.losses}-${fighter.draws}`;
        card.appendChild(record);
        
        // Quick Stats
        const quickStats = document.createElement('div');
        quickStats.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1.5rem;
        `;
        
        const stats = [
            { label: 'Age', value: fighter.age || '-' },
            { label: 'Win Rate', value: `${fighter.winRate}%` },
            { label: 'Height', value: cmToFeetInches(fighter.height) },
            { label: 'Weight', value: kgToLbs(fighter.weight) }
        ];
        
        stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.style.cssText = `
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 0.75rem;
                border: 1px solid #333;
            `;
            
            const label = document.createElement('div');
            label.style.cssText = `
                color: #888;
                font-size: 0.8rem;
                margin-bottom: 0.25rem;
            `;
            label.textContent = stat.label;
            
            const value = document.createElement('div');
            value.style.cssText = `
                color: #fff;
                font-size: 1.1rem;
                font-weight: 600;
            `;
            value.textContent = stat.value;
            
            statCard.appendChild(label);
            statCard.appendChild(value);
            quickStats.appendChild(statCard);
        });
        
        card.appendChild(quickStats);
        
        return card;
    },
    
    createStatsComparisonTable() {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid #333;
            margin-top: 2rem;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #fff;
            text-align: center;
            margin: 0 0 2rem 0;
            font-size: 1.8rem;
        `;
        title.textContent = 'Stats Comparison';
        container.appendChild(title);
        
        const f1 = this.fighter1;
        const f2 = this.fighter2;
        
        const statsData = [
            { 
                label: 'Strikes Landed per min (SLPM)', 
                value1: f1.splm.toFixed(2), 
                value2: f2.splm.toFixed(2),
                diff: (f1.splm - f2.splm).toFixed(2)
            },
            { 
                label: 'Striking Accuracy (%)', 
                value1: f1.str_acc, 
                value2: f2.str_acc,
                diff: (f1.str_acc - f2.str_acc).toFixed(0)
            },
            { 
                label: 'Strikes Absorbed per min (SAPM)', 
                value1: f1.sapm.toFixed(2), 
                value2: f2.sapm.toFixed(2),
                diff: (f1.sapm - f2.sapm).toFixed(2),
                lowerIsBetter: true
            },
            { 
                label: 'Striking Defense (%)', 
                value1: f1.str_def, 
                value2: f2.str_def,
                diff: (f1.str_def - f2.str_def).toFixed(0)
            },
            { 
                label: 'Takedown Average per 15min (TD_AVG)', 
                value1: f1.td_avg.toFixed(2), 
                value2: f2.td_avg.toFixed(2),
                diff: (f1.td_avg - f2.td_avg).toFixed(2)
            },
            { 
                label: 'Takedown Accuracy (%)', 
                value1: f1.td_avg_acc, 
                value2: f2.td_avg_acc,
                diff: (f1.td_avg_acc - f2.td_avg_acc).toFixed(0)
            },
            { 
                label: 'Takedown Defense (%)', 
                value1: f1.td_def, 
                value2: f2.td_def,
                diff: (f1.td_def - f2.td_def).toFixed(0)
            },
            { 
                label: 'Submission Average per 15min (Sub_AVG)', 
                value1: f1.sub_avg.toFixed(2), 
                value2: f2.sub_avg.toFixed(2),
                diff: (f1.sub_avg - f2.sub_avg).toFixed(2)
            }
        ];
        
        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
        `;
        
        // Header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="border-bottom: 2px solid #333;">
                <th style="padding: 1rem; text-align: center; color: #3b82f6; font-size: 1.1rem;">${f1.name.split(' ')[0]}</th>
                <th style="padding: 1rem; text-align: center; color: #fff; font-size: 1.1rem;">Stats</th>
                <th style="padding: 1rem; text-align: center; color: #888; font-size: 0.9rem;">Diff</th>
                <th style="padding: 1rem; text-align: center; color: #d91c1c; font-size: 1.1rem;">${f2.name.split(' ')[0]}</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        statsData.forEach((stat, index) => {
            const row = document.createElement('tr');
            row.style.cssText = `
                border-bottom: 1px solid #2d2d2d;
                transition: background 0.2s ease;
            `;
            
            row.addEventListener('mouseenter', () => {
                row.style.background = 'rgba(217, 28, 28, 0.05)';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.background = 'transparent';
            });
            
            // Determine which value is better
            const val1 = parseFloat(stat.value1);
            const val2 = parseFloat(stat.value2);
            const diff = parseFloat(stat.diff);
            
            let winner1 = false;
            let winner2 = false;
            
            if (stat.lowerIsBetter) {
                winner1 = val1 < val2;
                winner2 = val2 < val1;
            } else {
                winner1 = val1 > val2;
                winner2 = val2 > val1;
            }
            
            row.innerHTML = `
                <td style="
                    padding: 1rem;
                    text-align: center;
                    color: ${winner1 ? '#4ade80' : '#fff'};
                    font-weight: ${winner1 ? '700' : '400'};
                    font-size: 1.2rem;
                    background: ${winner1 ? 'rgba(74, 222, 128, 0.1)' : 'transparent'};
                ">${stat.value1}</td>
                <td style="
                    padding: 1rem;
                    text-align: center;
                    color: #888;
                    font-size: 0.9rem;
                ">${stat.label}</td>
                <td style="
                    padding: 1rem;
                    text-align: center;
                    color: ${diff > 0 ? '#4ade80' : diff < 0 ? '#ef4444' : '#888'};
                    font-size: 0.85rem;
                    font-weight: 600;
                ">${diff > 0 ? '+' : ''}${diff}</td>
                <td style="
                    padding: 1rem;
                    text-align: center;
                    color: ${winner2 ? '#4ade80' : '#fff'};
                    font-weight: ${winner2 ? '700' : '400'};
                    font-size: 1.2rem;
                    background: ${winner2 ? 'rgba(74, 222, 128, 0.1)' : 'transparent'};
                ">${stat.value2}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
        
        return container;
    },
    
    createDualRadarChart(type) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid #333;
        `;
        
        const title = document.createElement('h3');
        title.style.cssText = `
            color: #fff;
            text-align: center;
            margin: 0 0 1.5rem 0;
            font-size: 1.3rem;
        `;
        title.textContent = type === 'striking' ? '🥊 Striking Comparison' : '🤼 Grappling Comparison';
        container.appendChild(title);
        
        const chartDiv = document.createElement('div');
        chartDiv.id = `radar-${type}`;
        chartDiv.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        container.appendChild(chartDiv);
        
        return container;
    },
    
    renderStrikingComparison() {
        const f1 = this.fighter1;
        const f2 = this.fighter2;
        
        const data1 = [
            { axis: 'SLPM', value: Math.min(f1.splm * 10, 100) },
            { axis: 'SA', value: f1.str_acc },
            { axis: 'SD', value: f1.str_def },
            { axis: 'SAPM', value: 100 - Math.min(f1.sapm * 10, 100) }
        ];
        
        const data2 = [
            { axis: 'SLPM', value: Math.min(f2.splm * 10, 100) },
            { axis: 'SA', value: f2.str_acc },
            { axis: 'SD', value: f2.str_def },
            { axis: 'SAPM', value: 100 - Math.min(f2.sapm * 10, 100) }
        ];
        
        this.drawDualRadar('#radar-striking', data1, data2, '#3b82f6', '#d91c1c');
    },
    
    renderGrapplingComparison() {
        const f1 = this.fighter1;
        const f2 = this.fighter2;
        
        const data1 = [
            { axis: 'TD_AVG', value: Math.min(f1.td_avg * 20, 100) },
            { axis: 'TA', value: f1.td_avg_acc },
            { axis: 'TD', value: f1.td_def },
            { axis: 'Sub_AVG', value: Math.min(f1.sub_avg * 50, 100) }
        ];
        
        const data2 = [
            { axis: 'TD_AVG', value: Math.min(f2.td_avg * 20, 100) },
            { axis: 'TA', value: f2.td_avg_acc },
            { axis: 'TD', value: f2.td_def },
            { axis: 'Sub_AVG', value: Math.min(f2.sub_avg * 50, 100) }
        ];
        
        this.drawDualRadar('#radar-grappling', data1, data2, '#3b82f6', '#d91c1c');
    },

    radarTooltips: {
    striking: {
        SLPM: "💥 <strong>SPLM</strong>: Strikes Landed per Minute<br>Average offensive output per minute.",
        SA: "🎯 <strong>SA</strong>: Striking Accuracy (%)<br>Shows precision and efficiency.",
        SD: "🛡️ <strong>SD</strong>: Striking Defense (%)<br>Percentage of strikes avoided.",
        SAPM: "🧱 <strong>SAPM</strong>: Strikes Absorbed per Minute<br>Lower = better defense."
    },
    grappling: {
        TD_AVG: "🤼 <strong>TD Avg</strong>: Average takedowns per 15min<br>Measures wrestling effectiveness.",
        TA: "🎯 <strong>TA</strong>: Takedown Accuracy (%)<br>Shows success rate of takedown attempts.",
        TD: "🛡️ <strong>TD</strong>: Takedown Defense (%)<br>Ability to stop opponent’s takedowns.",
        Sub_AVG: "🔒 <strong>Sub Avg</strong>: Submissions per 15min<br>Shows submission activity and threat."
    }
},
    
    drawDualRadar(selector, data1, data2, color1, color2) {
    const width = 400;
    const height = 400;
    const margin = 80;
    const radius = Math.min(width, height) / 2 - margin;
    const levels = 5;
    
    const svg = d3.select(selector);
    svg.selectAll('*').remove();
    
    const svgEl = svg.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svgEl.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Draw concentric circles
    for (let i = 1; i <= levels; i++) {
        g.append('circle')
            .attr('r', (radius / levels) * i)
            .attr('fill', 'none')
            .attr('stroke', '#333')
            .attr('stroke-width', 1);
        
        if (i === levels) {
            const levelValues = [0, 20, 40, 60, 80, 100];
            for (let j = 0; j < levels; j++) {
                const r = (radius / levels) * (j + 1);
                g.append('text')
                    .attr('x', 5)
                    .attr('y', -r)
                    .attr('fill', '#666')
                    .attr('font-size', '10px')
                    .text(levelValues[j + 1]);
            }
        }
    }
    
    const angleSlice = (Math.PI * 2) / data1.length;
    
    // Draw axes and labels (sem tooltip)
    data1.forEach((d, i) => {
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
        
        const labelRadius = radius + 30;
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
    
    // Draw fighter 1 radar
    const lineGenerator1 = d3.lineRadial()
        .angle((d, i) => angleSlice * i)
        .radius(d => (d.value / 100) * radius)
        .curve(d3.curveLinearClosed);
    
    g.append('path')
        .datum(data1)
        .attr('d', lineGenerator1)
        .attr('fill', color1)
        .attr('fill-opacity', 0.25)
        .attr('stroke', color1)
        .attr('stroke-width', 3);
    
    // Draw fighter 2 radar
    const lineGenerator2 = d3.lineRadial()
        .angle((d, i) => angleSlice * i)
        .radius(d => (d.value / 100) * radius)
        .curve(d3.curveLinearClosed);
    
    g.append('path')
        .datum(data2)
        .attr('d', lineGenerator2)
        .attr('fill', color2)
        .attr('fill-opacity', 0.25)
        .attr('stroke', color2)
        .attr('stroke-width', 3);
    
    // Add points for fighter 1 (com tooltip)
    data1.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (d.value / 100) * radius;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        
        const point = g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 6)
            .attr('fill', color1)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');
        
        const tooltipKey = d.axis;
        const tooltipText = this.radarTooltips[
            selector.includes('striking') ? 'striking' : 'grappling'
        ][tooltipKey];
        
        if (tooltipText) {
            point.on('mouseenter', (event) => {
                point.attr('r', 8);
                const tooltip = document.createElement('div');
                tooltip.className = 'radar-tooltip';
                tooltip.style.cssText = `
                    position: fixed;
                    top: ${event.clientY + 10}px;
                    left: ${event.clientX + 10}px;
                    background: rgba(0,0,0,0.9);
                    color: #fff;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 0.8rem;
                    max-width: 240px;
                    pointer-events: none;
                    z-index: 9999;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                `;
                tooltip.innerHTML = `${tooltipText}<br><strong>Valor: ${Math.round(d.value)}%</strong>`;
                document.body.appendChild(tooltip);
                
                point.on('mousemove', e => {
                    tooltip.style.top = `${e.clientY + 10}px`;
                    tooltip.style.left = `${e.clientX + 10}px`;
                });
                
                point.on('mouseleave', () => {
                    tooltip.remove();
                    point.attr('r', 6);
                });
            });
        }
    });
    
    // Add points for fighter 2 (com tooltip)
    data2.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (d.value / 100) * radius;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        
        const point = g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 6)
            .attr('fill', color2)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');
        
        const tooltipKey = d.axis;
        const tooltipText = this.radarTooltips[
            selector.includes('striking') ? 'striking' : 'grappling'
        ][tooltipKey];
        
        if (tooltipText) {
            point.on('mouseenter', (event) => {
                point.attr('r', 8);
                const tooltip = document.createElement('div');
                tooltip.className = 'radar-tooltip';
                tooltip.style.cssText = `
                    position: fixed;
                    top: ${event.clientY + 10}px;
                    left: ${event.clientX + 10}px;
                    background: rgba(0,0,0,0.9);
                    color: #fff;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 0.8rem;
                    max-width: 240px;
                    pointer-events: none;
                    z-index: 9999;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                `;
                tooltip.innerHTML = `${tooltipText}<br><strong>Valor: ${Math.round(d.value)}%</strong>`;
                document.body.appendChild(tooltip);
                
                point.on('mousemove', e => {
                    tooltip.style.top = `${e.clientY + 10}px`;
                    tooltip.style.left = `${e.clientX + 10}px`;
                });
                
                point.on('mouseleave', () => {
                    tooltip.remove();
                    point.attr('r', 6);
                });
            });
        }
    });
    
    // Add legend
    const legend = g.append('g')
        .attr('transform', `translate(-${width / 2 - 20}, ${height / 2 - 60})`);
    
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', color1);
    
    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .text(this.fighter1.name.split(' ')[0]);
    
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 25)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', color2);
    
    legend.append('text')
        .attr('x', 20)
        .attr('y', 37)
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .text(this.fighter2.name.split(' ')[0]);
}
};