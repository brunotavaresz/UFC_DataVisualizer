// Fighters table and filtering logic

const FightersTable = {
    filteredData: [],
    sortColumn: 'name',
    sortAscending: true,
    needsRefresh: true,
    
    init() {
        this.setupFilters();
        this.setupSort();
        this.render();
    },
    
    setupFilters() {
        // Search input
        const searchInput = document.getElementById('search-fighter');
        searchInput.addEventListener('input', debounce(() => {
            this.render();
        }, 300));
        
        // Division filter
        document.getElementById('filter-division').addEventListener('change', () => {
            this.render();
        });
        
        // Stance filter
        document.getElementById('filter-stance').addEventListener('change', () => {
            this.render();
        });
        
        // Win rate filters
        document.getElementById('winrate-min').addEventListener('input', debounce(() => {
            this.render();
        }, 500));
        document.getElementById('winrate-max').addEventListener('input', debounce(() => {
            this.render();
        }, 500));
        
        // Age filters
        document.getElementById('age-min').addEventListener('input', debounce(() => {
            this.render();
        }, 500));
        document.getElementById('age-max').addEventListener('input', debounce(() => {
            this.render();
        }, 500));
        
        // Clear filters button
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
    },
    
    setupSort() {
        document.querySelectorAll('#fighters-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.getAttribute('data-sort');
                if (this.sortColumn === column) {
                    this.sortAscending = !this.sortAscending;
                } else {
                    this.sortColumn = column;
                    this.sortAscending = true;
                }
                this.render();
            });
        });
    },
    
    getFilterCriteria() {
        return {
            search: document.getElementById('search-fighter').value,
            division: document.getElementById('filter-division').value,
            stance: document.getElementById('filter-stance').value,
            winRateMin: document.getElementById('winrate-min').value ? +document.getElementById('winrate-min').value : null,
            winRateMax: document.getElementById('winrate-max').value ? +document.getElementById('winrate-max').value : null,
            ageMin: document.getElementById('age-min').value ? +document.getElementById('age-min').value : null,
            ageMax: document.getElementById('age-max').value ? +document.getElementById('age-max').value : null
        };
    },
    
    clearFilters() {
        document.getElementById('search-fighter').value = '';
        document.getElementById('filter-division').value = '';
        document.getElementById('filter-stance').value = '';
        document.getElementById('winrate-min').value = '';
        document.getElementById('winrate-max').value = '';
        document.getElementById('age-min').value = '';
        document.getElementById('age-max').value = '';
        this.render();
    },
    
    render() {
        const criteria = this.getFilterCriteria();
        this.filteredData = DataLoader.filterFighters(criteria);
        
        // Sort data
        this.filteredData = sortBy(this.filteredData, this.sortColumn, this.sortAscending);
        
        // Render table
        const tbody = document.getElementById('fighters-tbody');
        
        if (this.filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #888;">No fighters found matching your criteria</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.filteredData.map(fighter => `
            <tr data-fighter-id="${fighter.id}" class="fighter-row">
                <td><strong>${fighter.name}</strong></td>
                <td>${fighter.nickname || '-'}</td>
                <td>${fighter.wins}</td>
                <td>${fighter.losses}</td>
                <td>${fighter.draws}</td>
                <td>${cmToFeetInches(fighter.height)}</td>
                <td>${kgToLbs(fighter.weight)}</td>
                <td><span class="stance-badge ${getStanceClass(fighter.stance)}">${formatStance(fighter.stance)}</span></td>
                <td><button class="btn-details" data-fighter-id="${fighter.id}">View Details</button></td>
            </tr>
        `).join('');
        
        // Add click handlers for detail buttons
        tbody.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const fighterId = btn.getAttribute('data-fighter-id');
                
                // Desabilitar botão durante carregamento
                btn.disabled = true;
                const originalText = btn.textContent;
                btn.textContent = 'Loading...';
                
                await FighterDetails.show(fighterId);
                
                // Re-habilitar botão
                btn.disabled = false;
                btn.textContent = originalText;
            });
        });
        
        // Add click handlers for rows
        tbody.querySelectorAll('tr.fighter-row').forEach(row => {
            row.addEventListener('click', async (e) => {
                // Não disparar se clicou no botão
                if (e.target.tagName === 'BUTTON') return;
                
                const fighterId = row.getAttribute('data-fighter-id');
                
                // Adicionar efeito visual
                row.style.background = 'rgba(217, 28, 28, 0.2)';
                
                await FighterDetails.show(fighterId);
                
                // Remover efeito
                setTimeout(() => {
                    row.style.background = '';
                }, 300);
            });
        });
        
        this.needsRefresh = false;
    }
};