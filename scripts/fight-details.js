// Fight Details Page Module
const FightDetails = {
    currentFight: null,
    eventData: null,
    tooltip: null,

    async show(fightId, eventData) {
        console.log('Showing fight details:', fightId);
        this.eventData = eventData;
        
        // Load fight data
        await this.loadFightData(fightId);
        
        if (!this.currentFight) {
            console.error('Fight not found');
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
        this.setupBackButton();
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

    async loadFightData(fightId) {
        try {
            const allFights = await d3.csv('data/fight_details.csv');
            this.currentFight = allFights.find(f => f.fight_id === fightId);
            console.log('Fight data loaded:', this.currentFight);
        } catch (error) {
            console.error('Error loading fight data:', error);
        }
    },

    populateHeader() {
        const f = this.currentFight;
        
        document.getElementById('fight-detail-title').textContent = 
            `${f.r_name} vs ${f.b_name}`;
        document.getElementById('fight-event-name').textContent = f.event_name || 'UFC Event';
        document.getElementById('fight-division').textContent = f.division || 'N/A';
        document.getElementById('fight-method').textContent = f.method || 'N/A';
        document.getElementById('fight-time').textContent = 
            `Round ${f.finish_round} - ${this.formatTime(f.match_time_sec)}`;
    },

    populateFighterCards() {
        const f = this.currentFight;
        
        // Red Corner
        document.getElementById('red-fighter-name').textContent = f.r_name;
        const redStats = document.getElementById('red-fighter-stats');
        redStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Knockdowns:</span>
                <span class="stat-value">${f.r_kd || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Sig. Strikes:</span>
                <span class="stat-value">${f.r_sig_str_landed || 0}/${f.r_sig_str_atmpted || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Accuracy:</span>
                <span class="stat-value">${f.r_sig_str_acc || 0}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Takedowns:</span>
                <span class="stat-value">${f.r_td_landed || 0}/${f.r_td_atmpted || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Submissions:</span>
                <span class="stat-value">${f.r_sub_att || 0}</span>
            </div>
        `;

        // Blue Corner
        document.getElementById('blue-fighter-name').textContent = f.b_name;
        const blueStats = document.getElementById('blue-fighter-stats');
        blueStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Knockdowns:</span>
                <span class="stat-value">${f.b_kd || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Sig. Strikes:</span>
                <span class="stat-value">${f.b_sig_str_landed || 0}/${f.b_sig_str_atmpted || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Accuracy:</span>
                <span class="stat-value">${f.b_sig_str_acc || 0}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Takedowns:</span>
                <span class="stat-value">${f.b_td_landed || 0}/${f.b_td_atmpted || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Submissions:</span>
                <span class="stat-value">${f.b_sub_att || 0}</span>
            </div>
        `;
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
        const margin = { top: 20, right: 30, bottom: 60, left: 60 };

        const svg = d3.select(container)
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.fighter))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(['landed', 'attempted'])
            .range([0, x0.bandwidth()])
            .padding(0.05);

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

            // Title below the chart
            svg.append('text')
                .attr('y', radius + 30)
                .attr('text-anchor', 'middle')
                .style('fill', '#e0e0e0')
                .style('font-size', '14px')
                .style('font-weight', 'bold')
                .text(fighter.name);
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
        const height = 250;
        const margin = { top: 20, right: 30, bottom: 60, left: 60 };

        const svg = d3.select(container)
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.fighter))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(['landed', 'attempted'])
            .range([0, x0.bandwidth()])
            .padding(0.05);

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
        
        // Dados: cada métrica é um ponto com X = red fighter, Y = blue fighter
        const metrics = [
            { name: 'Sig. Strikes', r_val: +f.r_sig_str_landed || 0, b_val: +f.b_sig_str_landed || 0, color: '#3b82f6' },
            { name: 'Total Strikes', r_val: +f.r_total_str_landed || 0, b_val: +f.b_total_str_landed || 0, color: '#3b82f6' },
            { name: 'Head Strikes', r_val: +f.r_head_landed || 0, b_val: +f.b_head_landed || 0, color: '#3b82f6' },
            { name: 'Body Strikes', r_val: +f.r_body_landed || 0, b_val: +f.b_body_landed || 0, color: '#3b82f6' },
            { name: 'Leg Strikes', r_val: +f.r_leg_landed || 0, b_val: +f.b_leg_landed || 0, color: '#3b82f6' },
            { name: 'Knockdowns', r_val: +f.r_kd || 0, b_val: +f.b_kd || 0, color: '#ef4444' },
            { name: 'Takedowns', r_val: +f.r_td_landed || 0, b_val: +f.b_td_landed || 0, color: '#ef4444' },
            { name: 'Submissions', r_val: +f.r_sub_att || 0, b_val: +f.b_sub_att || 0, color: '#ef4444' }
        ];

        const width = container.clientWidth || 600;
        const height = 400;
        const margin = { top: 40, right: 40, bottom: 80, left: 80 };

        const svg = d3.select(container)
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const maxVal = d3.max(metrics, d => Math.max(d.r_val, d.b_val)) || 10;

        const x = d3.scaleLinear()
            .domain([0, maxVal * 1.1])
            .nice()
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, maxVal * 1.1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // Diagonal line (equal performance)
        svg.append('line')
            .attr('x1', x(0))
            .attr('y1', y(0))
            .attr('x2', x(maxVal))
            .attr('y2', y(maxVal))
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        // Points
        svg.selectAll('circle')
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
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('r', 12);
                
                this.showTooltip(
                    `<strong>${d.name}</strong><br>` +
                    `${f.r_name}: ${d.r_val}<br>` +
                    `${f.b_name}: ${d.b_val}`,
                    event.clientX,
                    event.clientY
                );
            })
            .on('mouseout', (event) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('r', 8);
                this.hideTooltip();
            });

        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('fill', '#e0e0e0');

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .style('fill', '#ef4444')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`🔴 ${f.r_name}`);

        // Y Axis
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('fill', '#e0e0e0');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .style('fill', '#3b82f6')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`🔵 ${f.b_name}`);

        svg.selectAll('.domain, .tick line')
            .style('stroke', '#666');

        // Legend
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
        backBtn.onclick = () => {
            if (typeof Navigation !== 'undefined') {
                Navigation.navigateTo('event-details');
                // Re-initialize event details
                if (this.eventData && typeof EventDetails !== 'undefined') {
                    setTimeout(() => {
                        EventDetails.init(this.eventData);
                    }, 100);
                }
            }
        };
    }
};

// Export
if (typeof window !== 'undefined') {
    window.FightDetails = FightDetails;
}
