// Fighter Comparison Result Page - Full Implementation
const FighterComparisonResult = {
    fighter1: null,
    fighter2: null,
    sourceContext: null, // Track where comparison was initiated from
    tooltip: null,

    createTooltip() {
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
    
    showTooltip(text, x, y) {
        if (!this.tooltip) this.createTooltip();
        this.tooltip.innerHTML = text;
        this.tooltip.style.left = (x + 15) + 'px';
        this.tooltip.style.top = (y - 15) + 'px';
        this.tooltip.style.opacity = '1';
    },
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
        }
    },
    
    async show(fighter1, fighter2, source = null) {
        this.fighter1 = fighter1;
        this.fighter2 = fighter2;
        this.sourceContext = source;
        
        Navigation.navigateTo('fighter-comparison-result');
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        this.showLoadingState();
        
        // ✅ Criar tooltip
        this.createTooltip();
        
        await this.preloadBothFighterPhotos();
        this.renderComparisonPage();
        this.hideLoadingState();
        
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
        if (this.sourceContext === 'table') {
            Navigation.navigateTo('fighters');
        } else if (this.sourceContext === 'details') {
            Navigation.navigateTo('fighter-comparison-select');
        } else {
            Navigation.navigateTo('fighters');
        }
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
    
    // ✅ CORREÇÃO: Criar statsGrid e adicionar todos os charts
    const statsGrid = document.createElement('div');
    statsGrid.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-top: 2rem;
    `;
    
    // Evolution Chart (full width - 2 colunas)
    statsGrid.appendChild(this.createDualEvolutionChart(this.fighter1, this.fighter2));
    
    // Radar Charts (1 coluna cada)
    statsGrid.appendChild(this.createDualRadarChart('striking'));
    statsGrid.appendChild(this.createDualRadarChart('grappling'));
    
    container.appendChild(statsGrid);
    page.appendChild(container);
    
    // Render radar charts after DOM is ready
    setTimeout(() => {
        this.renderStrikingComparison();
        this.renderGrapplingComparison();
    }, 100);
},

// ========================================
// ADICIONAR ESTES 3 MÉTODOS NO FINAL DO OBJETO FighterComparisonResult
// ========================================

createDualEvolutionChart(fighter1, fighter2) {
    const container = document.createElement('div');
    container.style.cssText = `
        background: #1a1a1a;
        border-radius: 16px;
        padding: 2rem;
        border: 1px solid #333;
        grid-column: 1 / -1; /* Full width */
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    `;
    
    const title = document.createElement('h2');
    title.style.cssText = `
        color: #fff;
        margin: 0;
        font-size: 1.5rem;
        cursor: help;
    `;
    title.textContent = '📈 Career Evolution Comparison';
    
    title.addEventListener('mouseenter', (e) => {
        if (typeof FighterDetails !== 'undefined' && FighterDetails.showTooltip) {
            FighterDetails.showTooltip(
                '📊 <strong>Career Comparison</strong><br>Track both fighters\' performance across their careers.<br><strong>Blue</strong> = ' + fighter1.name + '<br><strong>Red</strong> = ' + fighter2.name + '<br>Click any point for fight details!',
                e.clientX,
                e.clientY
            );
        }
    });
    title.addEventListener('mouseleave', () => {
        if (typeof FighterDetails !== 'undefined' && FighterDetails.hideTooltip) {
            FighterDetails.hideTooltip();
        }
    });
    
    header.appendChild(title);
    
    // Metric selector
    const selectorWrapper = document.createElement('div');
    selectorWrapper.style.cssText = `
        display: flex;
        gap: 0.5rem;
        align-items: center;
    `;
    
    const selectorLabel = document.createElement('span');
    selectorLabel.style.cssText = `color: #888; font-size: 0.9rem;`;
    selectorLabel.textContent = 'Metric:';
    
    const selector = document.createElement('select');
    selector.id = 'comparison-evolution-selector';
    selector.style.cssText = `
        background: #2d2d2d;
        color: #fff;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        cursor: pointer;
        outline: none;
    `;
    
    const metrics = [
        { value: 'win_streak', label: 'Win/Loss Streak' },
        { value: 'cumulative_wins', label: 'Cumulative Wins' },
        { value: 'win_rate_evolution', label: 'Win Rate Evolution' },
        { value: 'sig_strikes', label: 'Significant Strikes' },
        { value: 'striking_acc', label: 'Striking Accuracy' },
        { value: 'takedowns', label: 'Takedowns' },
        { value: 'control_time', label: 'Control Time' },
        { value: 'knockdowns', label: 'Knockdowns' }
    ];
    
    metrics.forEach(m => {
        const option = document.createElement('option');
        option.value = m.value;
        option.textContent = m.label;
        selector.appendChild(option);
    });
    
    selector.addEventListener('change', () => {
        this.updateDualEvolutionChart(fighter1, fighter2, selector.value);
    });
    
    selectorWrapper.appendChild(selectorLabel);
    selectorWrapper.appendChild(selector);
    header.appendChild(selectorWrapper);
    container.appendChild(header);
    
    // Chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'dual-evolution-chart';
    chartContainer.style.cssText = `
        width: 100%;
        height: 500px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    chartContainer.innerHTML = `
        <div style="text-align: center; color: #888;">
            <div class="spinner" style="
                width: 40px;
                height: 40px;
                border: 3px solid #333;
                border-top: 3px solid #d91c1c;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            "></div>
            Loading fight histories...
        </div>
    `;
    container.appendChild(chartContainer);
    
    // Load data asynchronously
    setTimeout(async () => {
        if (typeof FighterDetails !== 'undefined' && FighterDetails.loadFighterFights) {
            await Promise.all([
                FighterDetails.loadFighterFights(fighter1),
                FighterDetails.loadFighterFights(fighter2)
            ]);
        }
        this.updateDualEvolutionChart(fighter1, fighter2, 'win_streak');
    }, 100);
    
    return container;
},

updateDualEvolutionChart(fighter1, fighter2, metric) {
    const hasData1 = fighter1.fightHistory && fighter1.fightHistory.length > 0;
    const hasData2 = fighter2.fightHistory && fighter2.fightHistory.length > 0;
    
    const chartContainer = document.getElementById('dual-evolution-chart');
    if (!chartContainer) return;
    
    if (!hasData1 && !hasData2) {
        chartContainer.innerHTML = `
            <div style="text-align: center; color: #888; font-size: 1.1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <div>No fight history data available for either fighter</div>
            </div>
        `;
        return;
    }
    
    if (!hasData1 || !hasData2) {
        const missingFighter = !hasData1 ? fighter1.name : fighter2.name;
        const presentFighter = hasData1 ? fighter1.name : fighter2.name;
        chartContainer.innerHTML = `
            <div style="text-align: center; color: #888; font-size: 1.1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <div>No fight history available for ${missingFighter}</div>
                <div style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                    Showing only ${presentFighter}
                </div>
            </div>
        `;
    }
    
    this.drawDualEvolutionChart(fighter1, fighter2, metric);
},

drawDualEvolutionChart(fighter1, fighter2, metric) {
    const container = document.getElementById('dual-evolution-chart');
    if (!container) return;
    
    container.innerHTML = '';
    
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 120, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select('#dual-evolution-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const metricLabels = {
        'win_streak': 'Win/Loss Streak',
        'cumulative_wins': 'Total Wins',
        'win_rate_evolution': 'Win Rate (%)',
        'sig_strikes': 'Significant Strikes',
        'striking_acc': 'Striking Accuracy (%)',
        'takedowns': 'Takedowns',
        'control_time': 'Control Time (sec)',
        'knockdowns': 'Knockdowns'
    };
    
    // Process data for both fighters
    const processData = (fighter, color) => {
        if (!fighter.fightHistory || fighter.fightHistory.length === 0) return [];
        
        let cumulativeWins = 0;
        let cumulativeLosses = 0;
        let currentStreak = 0;
        
        return fighter.fightHistory.map((fight, index) => {
            let value = 0;
            
            if (fight.result === 'W') {
                cumulativeWins++;
                currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
            } else if (fight.result === 'L') {
                cumulativeLosses++;
                currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
            }
            
            const totalFights = index + 1;
            const winRate = totalFights > 0 ? (cumulativeWins / totalFights) * 100 : 0;
            
            switch(metric) {
                case 'win_streak': value = currentStreak; break;
                case 'cumulative_wins': value = cumulativeWins; break;
                case 'win_rate_evolution': value = winRate; break;
                case 'sig_strikes': value = fight.sig_str_landed || 0; break;
                case 'striking_acc': value = fight.sig_str_acc || 0; break;
                case 'takedowns': value = fight.td_landed || 0; break;
                case 'control_time': value = fight.ctrl_time || 0; break;
                case 'knockdowns': value = fight.kd || 0; break;
            }
            
            return {
                index: index + 1,
                value,
                result: fight.result,
                opponent: fight.opponent,
                event: fight.event,
                date: fight.date,
                method: fight.method,
                fight_id: fight.fight_id,
                fighter: fighter.name,
                color: color,
                cumulativeWins,
                cumulativeLosses,
                winRate: winRate.toFixed(1),
                streak: currentStreak
            };
        });
    };
    
    const data1 = processData(fighter1, '#3b82f6');
    const data2 = processData(fighter2, '#ef4444');
    
    const normalizeData = (data) => {
        const maxIndex = data.length;
        return data.map(d => ({
            ...d,
            normalizedIndex: (d.index / maxIndex) * 100
        }));
    };
    
    const normalized1 = normalizeData(data1);
    const normalized2 = normalizeData(data2);
    
    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, chartWidth]);
    
    let yMin = 0;
    let yMax = Math.max(
        d3.max(normalized1, d => d.value) || 10,
        d3.max(normalized2, d => d.value) || 10
    );
    
    if (metric === 'win_streak') {
        yMin = Math.min(
            0,
            d3.min(normalized1, d => d.value) || 0,
            d3.min(normalized2, d => d.value) || 0
        ) - 1;
        yMax = Math.max(
            0,
            d3.max(normalized1, d => d.value) || 0,
            d3.max(normalized2, d => d.value) || 0
        ) + 1;
    }
    
    const yScale = d3.scaleLinear()
        .domain([yMin, yMax * 1.1])
        .nice()
        .range([chartHeight, 0]);
    
    // Grid
    g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(''));
    
    if (metric === 'win_streak') {
        g.append('line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', yScale(0))
            .attr('y2', yScale(0))
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
    }
    
    // Axes
    g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`))
        .attr('color', '#888');
    
    g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 50)
        .attr('text-anchor', 'middle')
        .style('fill', '#888')
        .style('font-size', '12px')
        .text('Career Progress (%)');
    
    g.append('g')
        .call(d3.axisLeft(yScale))
        .attr('color', '#888');
    
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -55)
        .attr('x', -(chartHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '12px')
        .text(metricLabels[metric] || metric);
    
    // Draw lines
    const line = d3.line()
        .x(d => xScale(d.normalizedIndex))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    if (normalized1.length > 0) {
        if (metric !== 'win_streak') {
            const area1 = d3.area()
                .x(d => xScale(d.normalizedIndex))
                .y0(chartHeight)
                .y1(d => yScale(d.value))
                .curve(d3.curveMonotoneX);
            
            g.append('path')
                .datum(normalized1)
                .attr('fill', 'rgba(59, 130, 246, 0.1)')
                .attr('d', area1);
        }
        
        g.append('path')
            .datum(normalized1)
            .attr('fill', 'none')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 3)
            .attr('d', line);
    }
    
    if (normalized2.length > 0) {
        if (metric !== 'win_streak') {
            const area2 = d3.area()
                .x(d => xScale(d.normalizedIndex))
                .y0(chartHeight)
                .y1(d => yScale(d.value))
                .curve(d3.curveMonotoneX);
            
            g.append('path')
                .datum(normalized2)
                .attr('fill', 'rgba(239, 68, 68, 0.1)')
                .attr('d', area2);
        }
        
        g.append('path')
            .datum(normalized2)
            .attr('fill', 'none')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 3)
            .attr('d', line);
    }
    
    // ✅ CORRIGIDO: Usar tooltip local do FighterComparisonResult
    const self = this; // Guardar referência ao objeto
    
    const drawPoints = (data) => {
        g.selectAll(`.fight-point-${data[0]?.fighter.replace(/\s/g, '-')}`)
            .data(data)
            .enter()
            .append('circle')
            .attr('class', `fight-point-${data[0]?.fighter.replace(/\s/g, '-')}`)
            .attr('cx', d => xScale(d.normalizedIndex))
            .attr('cy', d => yScale(d.value))
            .attr('r', 6)
            .attr('fill', d => d.result === 'W' ? '#4ade80' : d.result === 'L' ? '#ef4444' : '#fbbf24')
            .attr('stroke', d => d.color)
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseenter', function(event, d) {
                d3.select(this).attr('r', 10);
                let extra = metric === 'win_streak' ? `Streak: <strong>${d.streak > 0 ? '+' + d.streak : d.streak}</strong><br>` :
                           (metric === 'cumulative_wins' || metric === 'win_rate_evolution') ? `Record: <strong>${d.cumulativeWins}W-${d.cumulativeLosses}L</strong><br>` : '';
                
                // ✅ Usar tooltip local
                self.showTooltip(
                    `<strong>${d.fighter}</strong> - Fight #${d.index}<br><span style="color:#d91c1c;">vs ${d.opponent}</span><br>` +
                    `Result: <span style="color:${d.result === 'W' ? '#4ade80' : d.result === 'L' ? '#ef4444' : '#fbbf24'};font-weight:bold;">${d.result === 'W' ? 'WIN' : d.result === 'L' ? 'LOSS' : 'DRAW'}</span><br>` +
                    `Method: ${d.method}<br>${extra}Value: <strong>${d.value.toFixed(1)}</strong><br>${d.event}<br>${d.date.toLocaleDateString()}<br>` +
                    `<span style="color:#888;font-size:0.85em;">🖱️ Click for details</span>`,
                    event.clientX,
                    event.clientY
                );
            })
            .on('mouseleave', function() {
                d3.select(this).attr('r', 6);
                self.hideTooltip(); // ✅ Usar tooltip local
            })
            .on('click', function(event, d) {
                self.hideTooltip(); // ✅ Usar tooltip local
                if (d.fight_id && typeof FightDetails !== 'undefined') {
                    console.log('Opening fight:', d.fight_id); // Debug
                    FightDetails.show(d.fight_id, null, 'comparison');
                }
            });
    };
    
    if (normalized1.length > 0) drawPoints(normalized1);
    if (normalized2.length > 0) drawPoints(normalized2);
    
    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 100}, ${margin.top})`);
    
    legend.append('line')
        .attr('x1', 0).attr('x2', 30).attr('y1', 0).attr('y2', 0)
        .attr('stroke', '#3b82f6').attr('stroke-width', 3);
    
    legend.append('text')
        .attr('x', 35).attr('y', 5)
        .style('fill', '#fff').style('font-size', '12px')
        .text(fighter1.name.split(' ').pop());
    
    legend.append('line')
        .attr('x1', 0).attr('x2', 30).attr('y1', 25).attr('y2', 25)
        .attr('stroke', '#ef4444').attr('stroke-width', 3);
    
    legend.append('text')
        .attr('x', 35).attr('y', 30)
        .style('fill', '#fff').style('font-size', '12px')
        .text(fighter2.name.split(' ').pop());
    
    // Result legend
    const resultLegend = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height - 25})`);
    
    [
        { label: 'Win', color: '#4ade80' },
        { label: 'Loss', color: '#ef4444' },
        { label: 'Draw', color: '#fbbf24' }
    ].forEach((item, i) => {
        resultLegend.append('circle')
            .attr('cx', i * 70).attr('cy', 0).attr('r', 6)
            .attr('fill', item.color);
        
        resultLegend.append('text')
            .attr('x', i * 70 + 12).attr('y', 5)
            .style('fill', '#fff').style('font-size', '11px')
            .text(item.label);
    });
    
    resultLegend.append('text')
        .attr('x', 250).attr('y', 5)
        .style('fill', '#888').style('font-size', '11px')
        .text(`${normalized1.length} vs ${normalized2.length} fights`);
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
        
        // Record with colored wins/losses/draws
        const record = document.createElement('div');
        record.style.cssText = `
            font-size: 1.3rem;
            margin-bottom: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        `;
        
        const winsSpan = document.createElement('span');
        winsSpan.style.color = '#4ade80'; // Green
        winsSpan.textContent = fighter.wins;
        
        const separator1 = document.createElement('span');
        separator1.style.color = '#666';
        separator1.textContent = '-';
        
        const lossesSpan = document.createElement('span');
        lossesSpan.style.color = '#ef4444'; // Red
        lossesSpan.textContent = fighter.losses;
        
        const separator2 = document.createElement('span');
        separator2.style.color = '#666';
        separator2.textContent = '-';
        
        const drawsSpan = document.createElement('span');
        drawsSpan.style.color = '#fbbf24'; // Yellow
        drawsSpan.textContent = fighter.draws;
        
        record.appendChild(winsSpan);
        record.appendChild(separator1);
        record.appendChild(lossesSpan);
        record.appendChild(separator2);
        record.appendChild(drawsSpan);
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
            { label: 'Age', value: fighter.age || '-', color: '#fff' },
            { label: 'Win Rate', value: `${fighter.winRate}%`, color: '#4ade80' }, // Green like wins
            { label: 'Height', value: cmToFeetInches(fighter.height), color: '#fff' },
            { label: 'Weight', value: kgToLbs(fighter.weight), color: '#fff' }
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
                color: ${stat.color};
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
        
        let currentSortedData = statsData;
        
        // Function to render table body
        const renderTableBody = (data) => {
            tbody.innerHTML = '';
            data.forEach((stat, index) => {
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
        };
        
        // Header with sorting
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.borderBottom = '2px solid #333';
        
        const headers = [
            { text: f1.name.split(' ')[0], color: '#3b82f6', sortKey: 'value1' },
            { text: 'Stats', color: '#fff', sortKey: null },
            { text: 'Diff', color: '#888', sortKey: 'diff' },
            { text: f2.name.split(' ')[0], color: '#d91c1c', sortKey: 'value2' }
        ];
        
        let currentSort = { key: null, ascending: true };
        
        headers.forEach((header, headerIndex) => {
            const th = document.createElement('th');
            th.style.cssText = `
                padding: 1rem;
                text-align: center;
                color: ${header.color};
                font-size: 1.1rem;
                cursor: ${header.sortKey ? 'pointer' : 'default'};
                user-select: none;
                transition: color 0.2s ease;
            `;
            th.textContent = header.text;
            
            if (header.sortKey) {
                th.addEventListener('mouseenter', () => {
                    th.style.color = '#d91c1c';
                });
                
                th.addEventListener('mouseleave', () => {
                    th.style.color = header.color;
                });
                
                th.addEventListener('click', () => {
                    if (currentSort.key === header.sortKey) {
                        currentSort.ascending = !currentSort.ascending;
                    } else {
                        currentSort.key = header.sortKey;
                        currentSort.ascending = false;
                    }
                    
                    // Update all headers
                    headers.forEach((h, idx) => {
                        const thElement = headerRow.children[idx];
                        if (h.sortKey === currentSort.key) {
                            thElement.textContent = h.text + (currentSort.ascending ? ' ↑' : ' ↓');
                        } else if (h.sortKey) {
                            thElement.textContent = h.text;
                        }
                    });
                    
                    // Sort data
                    currentSortedData = [...statsData].sort((a, b) => {
                        const valA = parseFloat(a[currentSort.key]);
                        const valB = parseFloat(b[currentSort.key]);
                        return currentSort.ascending ? valA - valB : valB - valA;
                    });
                    
                    renderTableBody(currentSortedData);
                });
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        // Initial render
        renderTableBody(statsData);
        
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
},

    // Add this method to FighterComparisonResult object in fighter-comparison-result.js

createDualEvolutionChart(fighter1, fighter2) {
    const container = document.createElement('div');
    container.style.cssText = `
        background: #1a1a1a;
        border-radius: 16px;
        padding: 2rem;
        border: 1px solid #333;
        grid-column: 1 / -1; /* Full width */
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    `;
    
    const title = document.createElement('h2');
    title.style.cssText = `
        color: #fff;
        margin: 0;
        font-size: 1.5rem;
        cursor: help;
    `;
    title.textContent = '📈 Career Evolution Comparison';
    
    title.addEventListener('mouseenter', (e) => {
        FighterDetails.showTooltip(
            '📊 <strong>Career Comparison</strong><br>Track both fighters\' performance across their careers.<br><strong>Blue</strong> = ' + fighter1.name + '<br><strong>Red</strong> = ' + fighter2.name + '<br>Click any point for fight details!',
            e.clientX,
            e.clientY
        );
    });
    title.addEventListener('mouseleave', () => FighterDetails.hideTooltip());
    
    header.appendChild(title);
    
    // Metric selector
    const selectorWrapper = document.createElement('div');
    selectorWrapper.style.cssText = `
        display: flex;
        gap: 0.5rem;
        align-items: center;
    `;
    
    const selectorLabel = document.createElement('span');
    selectorLabel.style.cssText = `color: #888; font-size: 0.9rem;`;
    selectorLabel.textContent = 'Metric:';
    
    const selector = document.createElement('select');
    selector.id = 'comparison-evolution-selector';
    selector.style.cssText = `
        background: #2d2d2d;
        color: #fff;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        cursor: pointer;
        outline: none;
    `;
    
    const metrics = [
        { value: 'win_streak', label: 'Win/Loss Streak' },
        { value: 'cumulative_wins', label: 'Cumulative Wins' },
        { value: 'win_rate_evolution', label: 'Win Rate Evolution' },
        { value: 'sig_strikes', label: 'Significant Strikes' },
        { value: 'striking_acc', label: 'Striking Accuracy' },
        { value: 'takedowns', label: 'Takedowns' },
        { value: 'control_time', label: 'Control Time' },
        { value: 'knockdowns', label: 'Knockdowns' }
    ];
    
    metrics.forEach(m => {
        const option = document.createElement('option');
        option.value = m.value;
        option.textContent = m.label;
        selector.appendChild(option);
    });
    
    selector.addEventListener('change', () => {
        this.updateDualEvolutionChart(fighter1, fighter2, selector.value);
    });
    
    selectorWrapper.appendChild(selectorLabel);
    selectorWrapper.appendChild(selector);
    header.appendChild(selectorWrapper);
    container.appendChild(header);
    
    // Chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'dual-evolution-chart';
    chartContainer.style.cssText = `
        width: 100%;
        height: 500px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    chartContainer.innerHTML = `
        <div style="text-align: center; color: #888;">
            <div class="spinner" style="
                width: 40px;
                height: 40px;
                border: 3px solid #333;
                border-top: 3px solid #d91c1c;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            "></div>
            Loading fight histories...
        </div>
    `;
    container.appendChild(chartContainer);
    
    // Load data asynchronously
    setTimeout(async () => {
        await Promise.all([
            FighterDetails.loadFighterFights(fighter1),
            FighterDetails.loadFighterFights(fighter2)
        ]);
        this.updateDualEvolutionChart(fighter1, fighter2, 'win_streak');
    }, 100);
    
    return container;
},

updateDualEvolutionChart(fighter1, fighter2, metric) {
    // Check if both fighters have data
    const hasData1 = fighter1.fightHistory && fighter1.fightHistory.length > 0;
    const hasData2 = fighter2.fightHistory && fighter2.fightHistory.length > 0;
    
    const chartContainer = document.getElementById('dual-evolution-chart');
    
    if (!hasData1 && !hasData2) {
        chartContainer.innerHTML = `
            <div style="text-align: center; color: #888; font-size: 1.1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <div>No fight history data available for either fighter</div>
            </div>
        `;
        return;
    }
    
    if (!hasData1 || !hasData2) {
        const missingFighter = !hasData1 ? fighter1.name : fighter2.name;
        chartContainer.innerHTML = `
            <div style="text-align: center; color: #888; font-size: 1.1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <div>No fight history available for ${missingFighter}</div>
                <div style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                    Showing only ${hasData1 ? fighter1.name : fighter2.name}
                </div>
            </div>
        `;
    }
    
    this.drawDualEvolutionChart(fighter1, fighter2, metric);
}
};