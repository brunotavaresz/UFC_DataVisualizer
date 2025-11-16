// Fighters table and filtering logic

const FightersTable = {
    filteredData: [],
    sortColumn: null,
    sortAscending: true,
    needsRefresh: true,
    isRendering: false, // Prevent concurrent renders
    
    init() {
        this.setupFilters();
        this.setupSort();
        this.updateSortIndicators(); // Initialize sort indicators
        this.render();
    },
    
    setupFilters() {
    // Search input
    const searchInput = document.getElementById('search-fighter');
    searchInput.addEventListener('input', debounce(() => {
        this.render();
    }, 400));
    
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
    }, 600));
    document.getElementById('winrate-max').addEventListener('input', debounce(() => {
        this.render();
    }, 600));
    
    // Age filters
    document.getElementById('age-min').addEventListener('input', debounce(() => {
        this.render();
    }, 600));
    document.getElementById('age-max').addEventListener('input', debounce(() => {
        this.render();
    }, 600));
    
    // Height dual slider (only feet/inches)
    this.setupDualSlider('height', 150, 215, (val) => cmToFeetInches(val));
    
    // Weight dual slider (only lbs)
    this.setupDualSlider('weight', 50, 130, (val) => kgToLbs(val));
    
    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', () => {
        this.clearFilters();
    });
},

setupDualSlider(name, min, max, formatter) {
    const minSlider = document.getElementById(`${name}-min`);
    const maxSlider = document.getElementById(`${name}-max`);
    const minDisplay = document.getElementById(`${name}-min-display`);
    const maxDisplay = document.getElementById(`${name}-max-display`);
    const wrapper = minSlider.parentElement;
    
    const updateSlider = () => {
        let minVal = parseInt(minSlider.value);
        let maxVal = parseInt(maxSlider.value);
        
        // Garantir que min nunca ultrapassa max
        if (minVal > maxVal) {
            minSlider.value = maxVal;
            minVal = maxVal;
        }
        
        // Garantir que max nunca fica abaixo de min
        if (maxVal < minVal) {
            maxSlider.value = minVal;
            maxVal = minVal;
        }
        
        // Update displays
        minDisplay.textContent = formatter(minVal);
        maxDisplay.textContent = formatter(maxVal);
        
        // Update visual range (red line between thumbs)
        const percentMin = ((minVal - min) / (max - min)) * 100;
        const percentMax = ((max - maxVal) / (max - min)) * 100;
        wrapper.style.setProperty('--range-start', `${percentMin}%`);
        wrapper.style.setProperty('--range-end', `${percentMax}%`);
    };
    
    minSlider.addEventListener('input', debounce(() => {
        updateSlider();
        this.render();
    }, 400));
    
    maxSlider.addEventListener('input', debounce(() => {
        updateSlider();
        this.render();
    }, 400));
    
    // Initialize
    updateSlider();
},
    
    setupSort() {
        document.querySelectorAll('#fighters-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.getAttribute('data-sort');
                
                if (this.sortColumn === column) {
                    // Cycle through: asc -> desc -> none
                    if (this.sortAscending) {
                        this.sortAscending = false; // Now descending
                    } else {
                        // Reset to default (no sorting)
                        this.sortColumn = null;
                        this.sortAscending = true;
                    }
                } else {
                    // New column, start with ascending
                    this.sortColumn = column;
                    this.sortAscending = true;
                }
                
                // Update visual indicators
                this.updateSortIndicators();
                this.render();
            });
        });
    },
    
    updateSortIndicators() {
        // Remove all sort indicators
        document.querySelectorAll('#fighters-table th[data-sort]').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add indicator to current sorted column
        if (this.sortColumn) {
            const activeTh = document.querySelector(`#fighters-table th[data-sort="${this.sortColumn}"]`);
            if (activeTh) {
                activeTh.classList.add(this.sortAscending ? 'sort-asc' : 'sort-desc');
            }
        }
    },
    
    getFilterCriteria() {
    const heightMin = document.getElementById('height-min').value;
    const heightMax = document.getElementById('height-max').value;
    const weightMin = document.getElementById('weight-min').value;
    const weightMax = document.getElementById('weight-max').value;
    
    return {
        search: document.getElementById('search-fighter').value,
        division: document.getElementById('filter-division').value,
        stance: document.getElementById('filter-stance').value,
        winRateMin: document.getElementById('winrate-min').value ? +document.getElementById('winrate-min').value : null,
        winRateMax: document.getElementById('winrate-max').value ? +document.getElementById('winrate-max').value : null,
        ageMin: document.getElementById('age-min').value ? +document.getElementById('age-min').value : null,
        ageMax: document.getElementById('age-max').value ? +document.getElementById('age-max').value : null,
        heightMin: heightMin ? +heightMin : null,
        heightMax: heightMax ? +heightMax : null,
        weightMin: weightMin ? +weightMin : null,
        weightMax: weightMax ? +weightMax : null
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
    
    // Reset height slider
    document.getElementById('height-min').value = 150;
    document.getElementById('height-max').value = 215;
    document.getElementById('height-min-display').textContent = cmToFeetInches(150);
    document.getElementById('height-max-display').textContent = cmToFeetInches(215);
    
    // Reset weight slider
    document.getElementById('weight-min').value = 50;
    document.getElementById('weight-max').value = 130;
    document.getElementById('weight-min-display').textContent = kgToLbs(50);
    document.getElementById('weight-max-display').textContent = kgToLbs(130);
    
    // Reset visual ranges
    const heightWrapper = document.getElementById('height-min').parentElement;
    const weightWrapper = document.getElementById('weight-min').parentElement;
    heightWrapper.style.setProperty('--range-start', '0%');
    heightWrapper.style.setProperty('--range-end', '0%');
    weightWrapper.style.setProperty('--range-start', '0%');
    weightWrapper.style.setProperty('--range-end', '0%');
    
    this.render();
},
    
    // Format division name for display
    formatDivision(division) {
        if (!division || division === 'unknown') return '-';
        // Convert "light_heavyweight" to "Light Heavyweight"
        return division
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },
    
    // Get division CSS class for styling
    getDivisionClass(division) {
        if (!division || division === 'unknown') return '';
        return `division-${division.replace('_', '-')}`;
    },
    
    render() {
        // Prevent concurrent renders
        if (this.isRendering) return;
        this.isRendering = true;

        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            const criteria = this.getFilterCriteria();
            this.filteredData = DataLoader.filterFighters(criteria);
            
            // Sort data only if a sort column is selected
            if (this.sortColumn) {
                this.filteredData = sortBy(this.filteredData, this.sortColumn, this.sortAscending);
            }
            
            // Render table
            const tbody = document.getElementById('fighters-tbody');
            
            if (this.filteredData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem; color: #888;">No fighters found matching your criteria</td></tr>';
                this.isRendering = false;
                return;
            }
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            this.filteredData.forEach(fighter => {
                const tr = document.createElement('tr');
                tr.className = 'fighter-row';
                tr.setAttribute('data-fighter-id', fighter.id);
                
                tr.innerHTML = `
                    <td><strong>${fighter.name}</strong></td>
                    <td>${fighter.nickname || '-'}</td>
                    <td><span class="division-badge ${this.getDivisionClass(fighter.division)}">${this.formatDivision(fighter.division)}</span></td>
                    <td>${fighter.wins}</td>
                    <td>${fighter.losses}</td>
                    <td>${fighter.draws}</td>
                    <td>${cmToFeetInches(fighter.height)}</td>
                    <td>${kgToLbs(fighter.weight)}</td>
                    <td><span class="stance-badge ${getStanceClass(fighter.stance)}">${formatStance(fighter.stance)}</span></td>
                    <td><button class="btn-details" data-fighter-id="${fighter.id}">View Details</button></td>
                `;
                
                fragment.appendChild(tr);
            });
            
            // Clear and append in one operation
            tbody.innerHTML = '';
            tbody.appendChild(fragment);
            
            // Add event delegation for better performance
            this.attachEventListeners();
            
            this.isRendering = false;
            this.needsRefresh = false;
        });
    },
    
    attachEventListeners() {
        const tbody = document.getElementById('fighters-tbody');
        
        // Remove old listeners to prevent duplicates
        const oldTbody = tbody.cloneNode(true);
        tbody.parentNode.replaceChild(oldTbody, tbody);
        
        // Use event delegation - single listener for all rows and buttons
        oldTbody.addEventListener('click', async (e) => {
            // Handle button clicks
            if (e.target.classList.contains('btn-details')) {
                e.stopPropagation();
                const btn = e.target;
                const fighterId = btn.getAttribute('data-fighter-id');
                
                btn.disabled = true;
                const originalText = btn.textContent;
                btn.textContent = 'Loading...';
                
                await FighterDetails.show(fighterId);
                
                btn.disabled = false;
                btn.textContent = originalText;
                return;
            }
            
            // Handle row clicks
            const row = e.target.closest('tr.fighter-row');
            if (row && !e.target.classList.contains('btn-details')) {
                const fighterId = row.getAttribute('data-fighter-id');
                
                row.style.background = 'rgba(217, 28, 28, 0.2)';
                
                await FighterDetails.show(fighterId);
                
                setTimeout(() => {
                    row.style.background = '';
                }, 300);
            }
        });
    }
};