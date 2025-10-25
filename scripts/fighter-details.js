
// Fighter details page with visualizations

const FighterDetails = {
    currentFighter: null,
    
    show(fighterId) {
        this.currentFighter = DataLoader.getFighterById(fighterId);
        
        if (!this.currentFighter) {
            console.error('Fighter not found:', fighterId);
            return;
        }
        
        this.renderHeader();
        this.renderRecordChart();
        this.renderRankings();
        this.renderStatsTable();
        this.renderRadarCharts();
        
        Navigation.navigateTo('fighter-details');
    },
    
    renderHeader() {
        const f = this.currentFighter;
        
        // Avatar with initials
        const initials = f.name.split(' ').map(n => n[0]).join('');
        document.querySelector('.avatar-circle').textContent = initials;
        
        // Basic info
        document.getElementById('fighter-name').textContent = f.name;
        document.getElementById('fighter-nickname').textContent = f.nickname ? `"${f.nickname}"` : '';
        document.getElementById('fighter-age').textContent = f.age || '-';
        document.getElementById('fighter-stance').textContent = formatStance(f.stance);
        document.getElementById('fighter-winrate').textContent = `${f.winRate}%`;
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
            .style('opacity', 0.9);
        
        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('font-size', '18px')
            .text(d => d.data.value);
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
        
        rankings.forEach(rank => {
            const bar = container.append('div')
                .style('margin-bottom', '1rem');
            
            bar.append('div')
                .style('color', '#888')
                .style('margin-bottom', '0.25rem')
                .style('font-size', '0.9rem')
                .text(`${rank.name}: ${Math.round(rank.value)}%`);
            
            const barBg = bar.append('div')
                .style('background', '#2d2d2d')
                .style('height', '12px')
                .style('border-radius', '6px')
                .style('overflow', 'hidden');
            
            barBg.append('div')
                .style('background', 'linear-gradient(90deg, #d91c1c, #ff4444)')
                .style('height', '100%')
                .style('width', '0%')
                .style('transition', 'width 1s ease')
                .transition()
                .duration(1000)
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