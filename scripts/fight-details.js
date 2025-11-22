// Fight Details Page Module
const FightDetails = {
    currentFight: null,
    eventData: null,
    tooltip: null,

    async show(fightId, eventData = null, origin = 'event') {
        console.log('Showing fight details:', fightId);
        this.eventData = eventData;
        // ⭐ Adiciona e armazena a origem da chamada (padrão é 'event')
        this.originPage = origin; 
        
        // Load fight data
        await this.loadFightData(fightId);
        
        if (!this.currentFight) {
            console.error('Fight not found:', fightId);
            return;
        }

        // Navigate to page
        Navigation.navigateTo('fight-details');
        
        // Create tooltip
        this.createTooltip();
        
        // Populate page
        this.populateHeader();
        this.populateFighterCards();
        this.createVisualizations();
        this.setupBackButton(); // Usa a origem armazenada
    },

    createTooltip() {
        // Remove existing tooltip
        if (this.tooltip) {
            this.tooltip.remove();
        }
        
        this.tooltip = d3.select('body')
            .append('div')
            .style('position', 'fixed')
            .style('background', 'rgba(0, 0, 0, 0.95)')
            .style('color', 'white')
            .style('padding', '12px 16px')
            .style('border-radius', '8px')
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('z-index', '10000')
            .style('opacity', '0')
            .style('transition', 'opacity 0.2s ease')
            .style('border', '2px solid #d91c1c')
            .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.5)')
            .style('max-width', '300px')
            .style('line-height', '1.5');
    },

    showTooltip(text, x, y) {
        this.tooltip
            .style('opacity', '1')
            .style('left', (x + 15) + 'px')
            .style('top', (y - 15) + 'px')
            .html(text);
    },

    hideTooltip() {
        this.tooltip.style('opacity', '0');
    },

    // Atualização do FightDetails.js para corrigir o Strikes by Target

// 1. Atualiza loadFightData para garantir que lê todos os campos
async loadFightData(fightId) {
    try {
        console.log('🔍 Loading fight data for ID:', fightId);
        
        // Primeiro tenta UFC.csv (tem todos os dados incluindo head/body/leg)
        if (!window.ufcData || window.ufcData.length === 0) {
            try {
                const data = await d3.csv('data/UFC.csv');
                window.ufcData = data;
                console.log('📥 Loaded UFC.csv:', window.ufcData.length, 'fights');
            } catch (e) {
                console.error('Error loading UFC.csv:', e);
            }
        }
        
        if (window.ufcData && window.ufcData.length > 0) {
            this.currentFight = window.ufcData.find(f => f.fight_id === fightId);
            
            if (this.currentFight) {
                console.log('✅ Fight found in UFC.csv');
                console.log('Head strikes - Red:', this.currentFight.r_head_landed, 'Blue:', this.currentFight.b_head_landed);
                console.log('Body strikes - Red:', this.currentFight.r_body_landed, 'Blue:', this.currentFight.b_body_landed);
                console.log('Leg strikes - Red:', this.currentFight.r_leg_landed, 'Blue:', this.currentFight.b_leg_landed);
                return;
            }
        }
        
        // Fallback: fight_details.csv
        if (!window.fightDetailsData) {
            console.log('📥 Loading fight_details.csv as fallback...');
            window.fightDetailsData = await d3.csv('data/fight_details.csv');
        }
        
        this.currentFight = window.fightDetailsData.find(f => f.fight_id === fightId);
        
        if (this.currentFight) {
            console.log('✅ Fight found in fight_details.csv');
        } else {
            console.error('❌ Fight not found:', fightId);
        }
    } catch (error) {
        console.error('Error loading fight data:', error);
    }
},

// 2. Corrige createStrikesByTarget para debugging
createStrikesByTarget() {
    const f = this.currentFight;
    const container = document.getElementById('strikes-target-charts');
    
    if (!container) {
        console.error('❌ Container #strikes-target-charts not found in HTML!');
        return;
    }
    
    container.innerHTML = '';
    
    // Debug dos dados
    console.log('📊 Creating Strikes by Target chart');
    console.log('Red fighter:', f.r_name);
    console.log('  Head:', f.r_head_landed, 'Body:', f.r_body_landed, 'Leg:', f.r_leg_landed);
    console.log('Blue fighter:', f.b_name);
    console.log('  Head:', f.b_head_landed, 'Body:', f.b_body_landed, 'Leg:', f.b_leg_landed);

    const fighters = [
        { 
            name: f.r_name, 
            head: parseFloat(f.r_head_landed) || 0, 
            body: parseFloat(f.r_body_landed) || 0, 
            leg: parseFloat(f.r_leg_landed) || 0 
        },
        { 
            name: f.b_name, 
            head: parseFloat(f.b_head_landed) || 0, 
            body: parseFloat(f.b_body_landed) || 0, 
            leg: parseFloat(f.b_leg_landed) || 0 
        }
    ];

    fighters.forEach((fighter, idx) => {
        const pieDiv = document.createElement('div');
        pieDiv.className = 'pie-chart';
        pieDiv.style.cssText = `
            display: inline-block;
            margin: 0 20px;
            text-align: center;
        `;
        container.appendChild(pieDiv);

        const data = [
            { label: 'Head', value: fighter.head, color: '#ef4444' },
            { label: 'Body', value: fighter.body, color: '#fbbf24' },
            { label: 'Leg', value: fighter.leg, color: '#60a5fa' }
        ].filter(d => d.value > 0);

        const total = fighter.head + fighter.body + fighter.leg;

        console.log(`Fighter ${idx + 1} (${fighter.name}): Total strikes = ${total}`);

        if (total === 0) {
            pieDiv.innerHTML = `
                <div style="
                    width: 200px;
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    color: #888;
                ">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                    <div style="font-weight: bold; color: #fff; margin-bottom: 5px;">${fighter.name}</div>
                    <div>No strike data</div>
                </div>
            `;
            return;
        }

        const width = 200;
        const height = 200;
        const radius = Math.min(width, height) / 2 - 20;

        const svg = d3.select(pieDiv)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const color = d3.scaleOrdinal()
            .domain(['Head', 'Body', 'Leg'])
            .range(['#ef4444', '#fbbf24', '#60a5fa']);

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);
        
        const arc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius);

        const self = this;

        svg.selectAll('path')
            .data(pie(data))
            .join('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', '#1a1a1a')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('opacity', 0.7);
                const percentage = ((d.data.value / total) * 100).toFixed(1);
                self.showTooltip(
                    `<strong>${d.data.label}</strong><br>${d.data.value} strikes (${percentage}%)`,
                    event.clientX,
                    event.clientY
                );
            })
            .on('mouseout', function() {
                d3.select(this).attr('opacity', 1);
                self.hideTooltip();
            });

        // Centro - total
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .style('fill', '#e0e0e0')
            .style('font-size', '24px')
            .style('font-weight', 'bold')
            .text(total);

        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.2em')
            .style('fill', '#888')
            .style('font-size', '12px')
            .text('Total');

        // Nome do fighter
        d3.select(pieDiv)
            .append('div')
            .style('text-align', 'center')
            .style('margin-top', '15px')
            .style('color', idx === 0 ? '#ef4444' : '#3b82f6')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(fighter.name);

        // Legenda
        const legend = d3.select(pieDiv)
            .append('div')
            .style('text-align', 'center')
            .style('margin-top', '10px');

        [
            { label: 'Head', color: '#ef4444', value: fighter.head },
            { label: 'Body', color: '#fbbf24', value: fighter.body },
            { label: 'Leg', color: '#60a5fa', value: fighter.leg }
        ].forEach(item => {
            const legendItem = legend.append('div')
                .style('display', 'inline-block')
                .style('margin', '0 6px')
                .style('font-size', '11px');

            legendItem.append('span')
                .style('display', 'inline-block')
                .style('width', '10px')
                .style('height', '10px')
                .style('background-color', item.color)
                .style('border-radius', '2px')
                .style('margin-right', '4px')
                .style('vertical-align', 'middle');

            legendItem.append('span')
                .style('color', '#888')
                .text(`${item.label}: ${item.value}`);
        });
    });
    
    console.log('✅ Strikes by Target chart created');
},

    // Substitui estas funções no fight-details.js

populateHeader() {
    const f = this.currentFight;
    
    // Determina o vencedor
    const redWon = f.winner_id === f.r_id;
    const blueWon = f.winner_id === f.b_id;
    const isDraw = !f.winner_id || f.winner_id === '';
    
    // Título simples
    document.getElementById('fight-detail-title').textContent = `${f.r_name} vs ${f.b_name}`;
    
    document.getElementById('fight-event-name').textContent = f.event_name || 'UFC Event';
    document.getElementById('fight-division').textContent =
        f.division ? f.division.charAt(0).toUpperCase() + f.division.slice(1) : 'N/A';
    document.getElementById('fight-method').textContent = f.method || 'N/A';
    document.getElementById('fight-time').textContent = 
        `Round ${f.finish_round} - ${this.formatTime(f.match_time_sec)}`;
},

populateFighterCards() {
    const f = this.currentFight;
    
    // Determina o vencedor
    const redWon = f.winner_id === f.r_id;
    const blueWon = f.winner_id === f.b_id;
    const isDraw = !f.winner_id || f.winner_id === '';

    const cmp = (a, b) => {
        if (a > b) return ['stat-winner', 'stat-loser'];
        if (b > a) return ['stat-loser', 'stat-winner'];
        return ['stat-tie', 'stat-tie'];
    };

    const [rKD, bKD] = cmp(+f.r_kd, +f.b_kd);
    const [rSigAcc, bSigAcc] = cmp(+f.r_sig_str_acc, +f.b_sig_str_acc);
    const [rSigLand, bSigLand] = cmp(+f.r_sig_str_landed, +f.b_sig_str_landed);
    const [rTD, bTD] = cmp(+f.r_td_landed, +f.b_td_landed);
    const [rSub, bSub] = cmp(+f.r_sub_att, +f.b_sub_att);

    // RED CORNER
    const redNameEl = document.getElementById('red-fighter-name');
    redNameEl.innerHTML = redWon 
        ? ` ${f.r_name}` 
        : (isDraw ? `${f.r_name}` : `${f.r_name}`);
    
    // Estiliza o card do red corner
    const redCard = document.querySelector('.fighter-card.red-corner');
    if (redCard) {
        if (redWon) {
            redCard.style.background = 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.05))';
            redCard.style.borderColor = '#4ade80';
        } else if (blueWon) {
            redCard.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.05))';
            redCard.style.borderColor = '#ef4444';
        }
    }
    
    document.getElementById('red-fighter-stats').innerHTML = `
        ${redWon ? '<div class="result-badge winner">WINNER</div>' : (blueWon ? '<div class="result-badge loser">DEFEATED</div>' : '<div class="result-badge draw">DRAW</div>')}
        <div class="stat-item">
            <span class="stat-label">Knockdowns:</span>
            <span class="stat-value ${rKD}">${f.r_kd || 0}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Sig. Strikes:</span>
            <span class="stat-value ${rSigLand}">${f.r_sig_str_landed || 0}/${f.r_sig_str_atmpted || 0}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Accuracy:</span>
            <span class="stat-value ${rSigAcc}">${f.r_sig_str_acc || 0}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Takedowns:</span>
            <span class="stat-value ${rTD}">${f.r_td_landed || 0}/${f.r_td_atmpted || 0}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Submissions:</span>
            <span class="stat-value ${rSub}">${f.r_sub_att || 0}</span>
        </div>
    `;

    // BLUE CORNER
    const blueNameEl = document.getElementById('blue-fighter-name');
    blueNameEl.innerHTML = blueWon 
        ? ` ${f.b_name}` 
        : (isDraw ? `${f.b_name}` : `${f.b_name}`);
    
    // Estiliza o card do blue corner
    const blueCard = document.querySelector('.fighter-card.blue-corner');
    if (blueCard) {
        if (blueWon) {
            blueCard.style.background = 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.05))';
            blueCard.style.borderColor = '#4ade80';
        } else if (redWon) {
            blueCard.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.05))';
            blueCard.style.borderColor = '#ef4444';
        }
    }
    
    document.getElementById('blue-fighter-stats').innerHTML = `
        ${blueWon ? '<div class="result-badge winner">WINNER</div>' : (redWon ? '<div class="result-badge loser">DEFEATED</div>' : '<div class="result-badge draw">DRAW</div>')}
        <div class="stat-item">
            <span class="stat-label">Knockdowns:</span>
            <span class="stat-value ${bKD}">${f.b_kd || 0}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Sig. Strikes:</span>
            <span class="stat-value ${bSigLand}">${f.b_sig_str_landed || 0}/${f.b_sig_str_atmpted || 0}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Accuracy:</span>
            <span class="stat-value ${bSigAcc}">${f.b_sig_str_acc || 0}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Takedowns:</span>
            <span class="stat-value ${bTD}">${f.b_td_landed || 0}/${f.b_td_atmpted || 0}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Submissions:</span>
            <span class="stat-value ${bSub}">${f.b_sub_att || 0}</span>
        </div>
    `;
    
    // Adiciona CSS para os badges
    if (!document.getElementById('result-badge-styles')) {
        const style = document.createElement('style');
        style.id = 'result-badge-styles';
        style.textContent = `
            .result-badge {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
            }
            .result-badge.winner {
                background: linear-gradient(135deg, #4ade80, #22c55e);
                color: #000;
                box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
            }
            .result-badge.loser {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: #fff;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
            }
            .result-badge.draw {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: #000;
                box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
},

    createVisualizations() {
        this.createStrikesComparison();
        this.createStrikesByTarget();
        this.createTakedownsComparison();
        this.createSubmissionsChart();
        this.createControlTimeChart();
        this.createPerformanceScatter();
    },

    createStrikesComparison() {
        const f = this.currentFight;
        const container = document.getElementById('strikes-comparison-chart');
        
        const data = [
            { fighter: f.r_name, landed: +f.r_sig_str_landed || 0, attempted: +f.r_sig_str_atmpted || 0 },
            { fighter: f.b_name, landed: +f.b_sig_str_landed || 0, attempted: +f.b_sig_str_atmpted || 0 }
        ];

        const width = container.clientWidth || 400;
        const height = 300;
        const margin = { top: 30, right: 30, bottom: 60, left: 60 };

        const svg = d3.select(container)
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.fighter))
            .range([margin.left, width - margin.right])
            .padding(0.3);

        const x1 = d3.scaleBand()
            .domain(['landed', 'attempted'])
            .range([0, x0.bandwidth()])
            .padding(0.15);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.landed, d.attempted))])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal()
            .domain(['landed', 'attempted'])
            .range(['#4ade80', '#888']);

        // Bars
        const bars = svg.append('g')
            .selectAll('g')
            .data(data)
            .join('g')
            .attr('transform', d => `translate(${x0(d.fighter)},0)`)
            .selectAll('rect')
            .data(d => ['landed', 'attempted'].map(key => ({ key, value: d[key], fighter: d.fighter })))
            .join('rect')
            .attr('x', d => x1(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x1.bandwidth())
            .attr('height', d => y(0) - y(d.value))
            .attr('fill', d => color(d.key))
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                d3.select(event.target).attr('opacity', 0.7);
                this.showTooltip(
                    `<strong>${d.fighter}</strong><br>${d.key}: ${d.value}`,
                    event.clientX,
                    event.clientY
                );
            })
            .on('mouseout', (event) => {
                d3.select(event.target).attr('opacity', 1);
                this.hideTooltip();
            });

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0))
            .selectAll('text')
            .style('fill', '#e0e0e0')
            .style('font-size', '12px');

        svg.selectAll('.domain, .tick line')
            .style('stroke', '#666');

        // Y Axis
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('fill', '#e0e0e0');

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 120}, ${margin.top})`);

        ['landed', 'attempted'].forEach((key, i) => {
            legend.append('rect')
                .attr('x', 0)
                .attr('y', i * 20)
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', color(key));

            legend.append('text')
                .attr('x', 20)
                .attr('y', i * 20 + 12)
                .text(key.charAt(0).toUpperCase() + key.slice(1))
                .style('fill', '#e0e0e0')
                .style('font-size', '12px');
        });
    },

    createStrikesByTarget() {
        const f = this.currentFight;
        const container = document.getElementById('strikes-target-charts');
        container.innerHTML = '';

        const fighters = [
            { name: f.r_name, head: +f.r_head_landed || 0, body: +f.r_body_landed || 0, leg: +f.r_leg_landed || 0 },
            { name: f.b_name, head: +f.b_head_landed || 0, body: +f.b_body_landed || 0, leg: +f.b_leg_landed || 0 }
        ];

        fighters.forEach(fighter => {
            const pieDiv = document.createElement('div');
            pieDiv.className = 'pie-chart';
            container.appendChild(pieDiv);

            const data = [
                { label: 'Head', value: fighter.head },
                { label: 'Body', value: fighter.body },
                { label: 'Leg', value: fighter.leg }
            ].filter(d => d.value > 0);

            const total = data.reduce((sum, d) => sum + d.value, 0);

            if (data.length === 0 || total === 0) {
                pieDiv.innerHTML = `<p style="text-align: center; color: #888;">${fighter.name}<br>No data</p>`;
                return;
            }

            const width = 200;
            const height = 200;
            const radius = Math.min(width, height) / 2 - 20;

            const svg = d3.select(pieDiv)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${width / 2},${height / 2})`);

            const color = d3.scaleOrdinal()
                .domain(['Head', 'Body', 'Leg'])
                .range(['#ef4444', '#fbbf24', '#60a5fa']);

            const pie = d3.pie().value(d => d.value);
            
            // Donut chart with inner radius (creates hole in middle)
            const arc = d3.arc()
                .innerRadius(radius * 0.6)
                .outerRadius(radius);

            svg.selectAll('path')
                .data(pie(data))
                .join('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data.label))
                .attr('stroke', '#1a1a1a')
                .attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .on('mouseover', (event, d) => {
                    d3.select(event.target).attr('opacity', 0.7);
                    const percentage = ((d.data.value / total) * 100).toFixed(1);
                    this.showTooltip(
                        `<strong>${d.data.label}</strong><br>${d.data.value} (${percentage}%)`,
                        event.clientX,
                        event.clientY
                    );
                })
                .on('mouseout', (event) => {
                    d3.select(event.target).attr('opacity', 1);
                    this.hideTooltip();
                });

            // Center text showing total
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '-0.2em')
                .style('fill', '#e0e0e0')
                .style('font-size', '24px')
                .style('font-weight', 'bold')
                .text(total);

            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1.2em')
                .style('fill', '#888')
                .style('font-size', '12px')
                .text('Total');

            // Fighter name below the SVG as HTML element
            d3.select(pieDiv)
                .append('div')
                .style('text-align', 'center')
                .style('margin-top', '15px')
                .style('margin-bottom', '10px')
                .style('color', '#e0e0e0')
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .text(fighter.name);

            // Add legend below fighter name
            const legendData = [
                { label: 'Head', color: '#ef4444' },
                { label: 'Body', color: '#fbbf24' },
                { label: 'Leg', color: '#60a5fa' }
            ];

            const legend = d3.select(pieDiv)
                .append('div')
                .style('text-align', 'center')
                .style('margin-top', '10px')
                .style('font-size', '12px');

            legendData.forEach(item => {
                const legendItem = legend.append('div')
                    .style('display', 'inline-block')
                    .style('margin', '0 8px');

                legendItem.append('span')
                    .style('display', 'inline-block')
                    .style('width', '12px')
                    .style('height', '12px')
                    .style('background-color', item.color)
                    .style('border-radius', '2px')
                    .style('margin-right', '5px')
                    .style('vertical-align', 'middle');

                legendItem.append('span')
                    .style('color', '#888')
                    .style('vertical-align', 'middle')
                    .text(item.label);
            });
        });
    },

    createTakedownsComparison() {
        const f = this.currentFight;
        const container = document.getElementById('takedowns-chart');
        
        const data = [
            { fighter: f.r_name, landed: +f.r_td_landed || 0, attempted: +f.r_td_atmpted || 0 },
            { fighter: f.b_name, landed: +f.b_td_landed || 0, attempted: +f.b_td_atmpted || 0 }
        ];

        const width = container.clientWidth || 400;
        const height = 300;
        const margin = { top: 30, right: 30, bottom: 60, left: 60 };

        const svg = d3.select(container)
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.fighter))
            .range([margin.left, width - margin.right])
            .padding(0.3);

        const x1 = d3.scaleBand()
            .domain(['landed', 'attempted'])
            .range([0, x0.bandwidth()])
            .padding(0.15);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.landed, d.attempted)) || 1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal()
            .domain(['landed', 'attempted'])
            .range(['#3b82f6', '#888']);

        // Bars
        svg.append('g')
            .selectAll('g')
            .data(data)
            .join('g')
            .attr('transform', d => `translate(${x0(d.fighter)},0)`)
            .selectAll('rect')
            .data(d => ['landed', 'attempted'].map(key => ({ key, value: d[key], fighter: d.fighter })))
            .join('rect')
            .attr('x', d => x1(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x1.bandwidth())
            .attr('height', d => y(0) - y(d.value))
            .attr('fill', d => color(d.key))
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                d3.select(event.target).attr('opacity', 0.7);
                this.showTooltip(
                    `<strong>${d.fighter}</strong><br>Takedowns ${d.key}: ${d.value}`,
                    event.clientX,
                    event.clientY
                );
            })
            .on('mouseout', (event) => {
                d3.select(event.target).attr('opacity', 1);
                this.hideTooltip();
            });

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0))
            .selectAll('text')
            .style('fill', '#e0e0e0')
            .style('font-size', '12px');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('fill', '#e0e0e0');

        svg.selectAll('.domain, .tick line').style('stroke', '#666');
    },

    createSubmissionsChart() {
        const f = this.currentFight;
        const container = document.getElementById('submissions-chart');
        
        const data = [
            { fighter: f.r_name, value: +f.r_sub_att || 0 },
            { fighter: f.b_name, value: +f.b_sub_att || 0 }
        ];

        this.createSimpleBarChart(container, data, '#fbbf24');
    },

    createControlTimeChart() {
        const f = this.currentFight;
        const container = document.getElementById('control-time-chart');
        
        const data = [
            { fighter: f.r_name, value: +f.r_ctrl || 0 },
            { fighter: f.b_name, value: +f.b_ctrl || 0 }
        ];

        this.createSimpleBarChart(container, data, '#8b5cf6', true);
    },

    createSimpleBarChart(container, data, color, isTime = false) {
        const width = container.clientWidth || 400;
        const height = 250;
        const margin = { top: 20, right: 30, bottom: 60, left: 60 };

        const svg = d3.select(container)
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x = d3.scaleBand()
            .domain(data.map(d => d.fighter))
            .range([margin.left, width - margin.right])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) || 1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // Bars
        svg.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', d => x(d.fighter))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => y(0) - y(d.value))
            .attr('fill', color)
            .attr('rx', 4)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                d3.select(event.target).attr('opacity', 0.7);
                const displayValue = isTime ? this.formatTime(d.value) : d.value;
                this.showTooltip(
                    `<strong>${d.fighter}</strong><br>Value: ${displayValue}`,
                    event.clientX,
                    event.clientY
                );
            })
            .on('mouseout', (event) => {
                d3.select(event.target).attr('opacity', 1);
                this.hideTooltip();
            });

        // Values on top
        svg.selectAll('text.value')
            .data(data)
            .join('text')
            .attr('class', 'value')
            .attr('x', d => x(d.fighter) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('fill', '#e0e0e0')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(d => isTime ? this.formatTime(d.value) : d.value);

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('fill', '#e0e0e0')
            .style('font-size', '12px');

        svg.selectAll('.domain, .tick line')
            .style('stroke', '#666');

        // Y Axis
        const yAxis = isTime 
            ? d3.axisLeft(y).tickFormat(d => this.formatTime(d))
            : d3.axisLeft(y);

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yAxis)
            .selectAll('text')
            .style('fill', '#e0e0e0');
    },

    createPerformanceScatter() {
    const f = this.currentFight;
    const container = document.getElementById('performance-scatter');

    // Dados
    const metrics = [
        { name: 'Sig. Strikes',  r_val: +f.r_sig_str_landed  || 0, b_val: +f.b_sig_str_landed  || 0, color: '#3b82f6' },
        { name: 'Total Strikes', r_val: +f.r_total_str_landed || 0, b_val: +f.b_total_str_landed || 0, color: '#3b82f6' },
        { name: 'Head Strikes',  r_val: +f.r_head_landed      || 0, b_val: +f.b_head_landed      || 0, color: '#3b82f6' },
        { name: 'Body Strikes',  r_val: +f.r_body_landed      || 0, b_val: +f.b_body_landed      || 0, color: '#3b82f6' },
        { name: 'Leg Strikes',   r_val: +f.r_leg_landed       || 0, b_val: +f.b_leg_landed       || 0, color: '#3b82f6' },

        { name: 'Knockdowns',  r_val: +f.r_kd        || 0, b_val: +f.b_kd        || 0, color: '#ef4444' },
        { name: 'Takedowns',   r_val: +f.r_td_landed || 0, b_val: +f.b_td_landed || 0, color: '#ef4444' },
        { name: 'Submissions', r_val: +f.r_sub_att   || 0, b_val: +f.b_sub_att   || 0, color: '#ef4444' }
    ];

    const width = container.clientWidth || 600;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };

    const svg = d3.select(container)
        .html('')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Escalas base
    const maxVal = d3.max(metrics, d => Math.max(d.r_val, d.b_val)) || 10;

    let x = d3.scaleLinear()
        .domain([0, maxVal * 1.1])
        .nice()
        .range([margin.left, width - margin.right]);

    let y = d3.scaleLinear()
        .domain([0, maxVal * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Eixos
    const xAxisG = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    xAxisG.selectAll('text').style('fill', '#e0e0e0');

    const yAxisG = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    yAxisG.selectAll('text').style('fill', '#e0e0e0');

    // Labels dos eixos
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .style('fill', '#ffffff')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(f.r_name);

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('fill', '#ffffff')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(f.b_name);

    svg.selectAll('.domain, .tick line')
        .style('stroke', '#666');

    // Linha diagonal
    const diagonal = svg.append('line')
        .attr('x1', x(0))
        .attr('y1', y(0))
        .attr('x2', x(maxVal))
        .attr('y2', y(maxVal))
        .attr('stroke', '#666')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    // Pontos
    const points = svg.append('g')
        .selectAll('circle')
        .data(metrics)
        .join('circle')
        .attr('cx', d => x(d.r_val))
        .attr('cy', d => y(d.b_val))
        .attr('r', 8)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => {
            if (!zoomMode) {
                d3.select(event.target).transition().duration(200).attr('r', 12);
                this.showTooltip(
                    `<strong>${d.name}</strong><br>${f.r_name}: ${d.r_val}<br>${f.b_name}: ${d.b_val}`,
                    event.clientX,
                    event.clientY
                );
            }
        })
        .on('mouseout', (event) => {
            if (!zoomMode) {
                d3.select(event.target).transition().duration(200).attr('r', 8);
                this.hideTooltip();
            }
        });

    // ----- ZOOM VARIABLES -----
    let zoomMode = false;
    const originalX = x.copy();
    const originalY = y.copy();

    // Brush (não ativo por default)
    const brush = d3.brush()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("end", brushEnded);

    const brushLayer = svg.append("g").attr("class", "brush");

    const self = this;

    function brushEnded(event) {
        if (!zoomMode) return;
        if (!event.selection) return;

        const [[x0, y0], [x1, y1]] = event.selection;

        x.domain([originalX.invert(x0), originalX.invert(x1)]);
        y.domain([originalY.invert(y1), originalY.invert(y0)]);

        // Update eixos
        xAxisG.call(d3.axisBottom(x));
        yAxisG.call(d3.axisLeft(y));

        // Update diagonal
        diagonal
            .attr('x1', x(0))
            .attr('y1', y(0))
            .attr('x2', x(maxVal))
            .attr('y2', y(maxVal));

        // Update pontos
        points
            .transition()
            .duration(300)
            .attr('cx', d => x(d.r_val))
            .attr('cy', d => y(d.b_val));

        // Remove brush
        brushLayer.call(brush.move, null);
    }

    // RESET ZOOM COM DUPLO CLIQUE
    svg.on("dblclick", () => {
        x.domain(originalX.domain());
        y.domain(originalY.domain());

        xAxisG.call(d3.axisBottom(x));
        yAxisG.call(d3.axisLeft(y));

        diagonal
            .attr('x1', x(0))
            .attr('y1', y(0))
            .attr('x2', x(maxVal))
            .attr('y2', y(maxVal));

        points
            .transition()
            .duration(300)
            .attr('cx', d => x(d.r_val))
            .attr('cy', d => y(d.b_val));
    });

    // ----- BOTÃO MINIMALISTA (MODE ZOOM) -----
    const zoomButton = svg.append("g")
        .attr("class", "zoom-toggle")
        .attr("transform", `translate(${width - 120}, ${margin.top - 30})`)
        .style("cursor", "pointer")
        .on("click", toggleZoomMode);

    zoomButton.append("rect")
        .attr("width", 110)
        .attr("height", 26)
        .attr("rx", 6)
        .attr("fill", "#222")
        .attr("stroke", "#666")
        .attr("stroke-width", 1.2);

    const zoomText = zoomButton.append("text")
        .attr("x", 55)
        .attr("y", 17)
        .attr("text-anchor", "middle")
        .style("fill", "#e0e0e0")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("🔍 Zoom: OFF");

    function toggleZoomMode() {
        zoomMode = !zoomMode;

        if (zoomMode) {
            zoomText.text("🔍 Zoom: ON");

            // Recria brushLayer limpo
            brushLayer
                .attr("pointer-events", "all")
                .call(brush);
            
            // Bloqueia hover e clique dos pontos durante zoom
            points.style("pointer-events", "none");

        } else {
            zoomText.text("🔍 Zoom: OFF");

            // Remove brush COMPLETAMENTE
            brushLayer.selectAll("*").remove();   // limpa dentro do g
            brushLayer.on(".brush", null);        // remove handlers
            brushLayer.attr("pointer-events", "none"); // evita bloqueio

            // Reativa hover e clique dos pontos
            points.style("pointer-events", "auto");

            // Garante que tooltip não fica presa
            self.hideTooltip();
        }
    }


    // Legenda
    const legend = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top - 20})`);

    const legendData = [
        { label: 'Strikes', color: '#3b82f6' },
        { label: 'Knockdowns/TDs/Subs', color: '#ef4444' }
    ];

    legendData.forEach((item, i) => {
        legend.append('circle')
            .attr('cx', i * 200)
            .attr('cy', 0)
            .attr('r', 6)
            .attr('fill', item.color);

        legend.append('text')
            .attr('x', i * 200 + 12)
            .attr('y', 5)
            .style('fill', '#e0e0e0')
            .style('font-size', '12px')
            .text(item.label);
    });
},


    formatTime(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    setupBackButton() {
    const backBtn = document.getElementById('back-to-event');
    
    // ⭐ Determina a página de destino com base na origem armazenada
    let targetPage = 'event-details'; // default
    
    if (this.originPage === 'fighter') {
        targetPage = 'fighter-details';
    } else if (this.originPage === 'comparison') {
        targetPage = 'fighter-comparison-result';
    } else if (this.originPage === 'event') {
        targetPage = 'event-details';
    }
    
    console.log('🔙 Setting up back button | Origin:', this.originPage, '| Target:', targetPage);

    if (backBtn) {
        backBtn.textContent = '← Back';
        backBtn.onclick = () => {
            console.log('🔙 Back button clicked | Navigating to:', targetPage);
            
            if (typeof Navigation !== 'undefined') {
                
                // 1. Navega para a página de destino correta
                Navigation.navigateTo(targetPage);
                
                // 2. Re-inicializa a página do evento se for o caso
                if (targetPage === 'event-details' && this.eventData && typeof EventDetails !== 'undefined') {
                    setTimeout(() => {
                        EventDetails.init(this.eventData); 
                    }, 100);
                }
                
                // 3. Re-inicializa a página de fighter se for o caso
                if (targetPage === 'fighter-details' && typeof FighterDetails !== 'undefined') {
                    console.log('🔄 Re-initializing Fighter Details page');
                    // FighterDetails deve ter sua própria lógica de restauração
                }
                
                // 4. Re-inicializa a página de comparison se for o caso
                if (targetPage === 'fighter-comparison-result' && typeof FighterComparisonResult !== 'undefined') {
                    console.log('🔄 Returning to Fighter Comparison page');
                    // A página de comparação deve manter seu estado
                }
            }
        };
    }
}
};

// Export
if (typeof window !== 'undefined') {
    window.FightDetails = FightDetails;
}