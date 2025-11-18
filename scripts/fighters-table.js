// Fighters table and filtering logic

const FightersTable = {
    filteredData: [],
    sortColumn: null,
    sortAscending: true,
    needsRefresh: true,
    isRendering: false, // Prevent concurrent renders
    selectedFighters: [], // Store selected fighters for comparison
    
    init() {
        this.setupFilters();
        this.setupSort();
        this.updateSortIndicators(); // Initialize sort indicators
        this.setupComparisonBar(); // Setup comparison bar
        this.render();
    },
    
    setupComparisonBar() {
        // Create comparison bar if it doesn't exist
        if (!document.getElementById('comparison-bar')) {
            const bar = document.createElement('div');
            bar.id = 'comparison-bar';
            bar.style.cssText = `
                position: fixed;
                bottom: -100px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                border: 2px solid #d91c1c;
                border-radius: 12px;
                padding: 1rem 2rem;
                display: flex;
                align-items: center;
                gap: 1.5rem;
                box-shadow: 0 -4px 20px rgba(217, 28, 28, 0.5);
                z-index: 1000;
                transition: bottom 0.3s ease;
            `;
            bar.innerHTML = `
                <div style="color: #fff; font-size: 1rem;">
                    <strong id="selected-count">0</strong> fighters selected
                </div>
                <button id="compare-selected-btn" class="btn" disabled style="
                    background: #d91c1c;
                    color: white;
                    border: none;
                    padding: 0.5rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                ">
                    Compare Fighters
                </button>
                <button id="clear-selection-btn" style="
                    background: transparent;
                    color: #888;
                    border: 1px solid #444;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                ">
                    Clear
                </button>
            `;
            document.body.appendChild(bar);
            
            // Add event listeners
            document.getElementById('compare-selected-btn').addEventListener('click', () => {
                this.compareSelectedFighters();
            });
            
            document.getElementById('clear-selection-btn').addEventListener('click', () => {
                this.clearSelection();
            });
        }
    },
    
    updateComparisonBar() {
        const bar = document.getElementById('comparison-bar');
        const count = document.getElementById('selected-count');
        const compareBtn = document.getElementById('compare-selected-btn');
        
        count.textContent = this.selectedFighters.length;
        
        // Show/hide bar
        if (this.selectedFighters.length > 0) {
            bar.style.bottom = '20px';
        } else {
            bar.style.bottom = '-100px';
        }
        
        // Enable compare button only if exactly 2 fighters selected
        if (this.selectedFighters.length === 2) {
            compareBtn.disabled = false;
            compareBtn.style.opacity = '1';
            compareBtn.style.cursor = 'pointer';
        } else {
            compareBtn.disabled = true;
            compareBtn.style.opacity = '0.5';
            compareBtn.style.cursor = 'not-allowed';
        }
    },
    
    toggleFighterSelection(fighterId) {
        const index = this.selectedFighters.indexOf(fighterId);
        
        if (index > -1) {
            // Remove from selection
            this.selectedFighters.splice(index, 1);
        } else {
            // Add to selection (max 2)
            if (this.selectedFighters.length >= 2) {
                // Remove oldest selection
                this.selectedFighters.shift();
            }
            this.selectedFighters.push(fighterId);
        }
        
        this.updateComparisonBar();
        this.updateCheckboxes();
    },
    
    updateCheckboxes() {
        document.querySelectorAll('.fighter-checkbox').forEach(checkbox => {
            const fighterId = checkbox.getAttribute('data-fighter-id');
            checkbox.checked = this.selectedFighters.includes(fighterId);
        });
    },
    
    clearSelection() {
        this.selectedFighters = [];
        this.updateComparisonBar();
        this.updateCheckboxes();
    },
    
    compareSelectedFighters() {
        if (this.selectedFighters.length === 2) {
            const fighter1 = DataLoader.getFighterById(this.selectedFighters[0]);
            const fighter2 = DataLoader.getFighterById(this.selectedFighters[1]);
            
            if (fighter1 && fighter2 && typeof FighterComparisonResult !== 'undefined') {
                // Check if fighters are from different divisions
                const division1 = fighter1.division || 'unknown';
                const division2 = fighter2.division || 'unknown';
                
                if (division1 !== division2 && division1 !== 'unknown' && division2 !== 'unknown') {
                    // Show custom modal for different divisions
                    this.showDivisionWarningModal(fighter1, fighter2, () => {
                        // Callback on confirm
                        FighterComparisonResult.show(fighter1, fighter2, 'table');
                        this.clearSelection();
                    });
                } else {
                    // Proceed with comparison
                    FighterComparisonResult.show(fighter1, fighter2, 'table');
                    this.clearSelection();
                }
            }
        }
    },
    
    showDivisionWarningModal(fighter1, fighter2, onConfirm) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.2s ease;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border: 2px solid #d91c1c;
            border-radius: 16px;
            padding: 2rem;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(217, 28, 28, 0.4);
            animation: slideUp 0.3s ease;
        `;
        
        modalContent.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h2 style="color: #fff; margin: 0 0 1rem 0; font-size: 1.5rem;">Different Weight Divisions</h2>
                <p style="color: #888; margin-bottom: 1.5rem; line-height: 1.6;">
                    Are you sure you want to compare fighters from different divisions?
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="modal-cancel" style="
                        background: transparent;
                        border: 2px solid #444;
                        color: #888;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: all 0.3s ease;
                    ">Cancel</button>
                    <button id="modal-confirm" style="
                        background: linear-gradient(135deg, #d91c1c, #ff4444);
                        border: none;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(217, 28, 28, 0.4);
                    ">Compare Anyway</button>
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Event listeners
        const cancelBtn = modal.querySelector('#modal-cancel');
        const confirmBtn = modal.querySelector('#modal-confirm');
        
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                modal.remove();
                style.remove();
            }, 200);
        };
        
        cancelBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.borderColor = '#d91c1c';
            cancelBtn.style.color = '#d91c1c';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.borderColor = '#444';
            cancelBtn.style.color = '#888';
        });
        
        confirmBtn.addEventListener('click', () => {
            closeModal();
            onConfirm();
        });
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.transform = 'scale(1.05)';
            confirmBtn.style.boxShadow = '0 6px 20px rgba(217, 28, 28, 0.6)';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.transform = 'scale(1)';
            confirmBtn.style.boxShadow = '0 4px 12px rgba(217, 28, 28, 0.4)';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
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

    getActiveFilters() {
        const criteria = this.getFilterCriteria();
        const active = [];
        
        if (criteria.search) {
            active.push({ type: 'search', label: `Search: "${criteria.search}"`, value: criteria.search });
        }
        
        if (criteria.division) {
            active.push({ type: 'division', label: `Division: ${this.formatDivision(criteria.division)}`, value: criteria.division });
        }
        
        if (criteria.stance) {
            active.push({ type: 'stance', label: `Stance: ${formatStance(criteria.stance)}`, value: criteria.stance });
        }
        
        if (criteria.winRateMin !== null || criteria.winRateMax !== null) {
            const min = criteria.winRateMin ?? 0;
            const max = criteria.winRateMax ?? 100;
            active.push({ type: 'winrate', label: `Win Rate: ${min}%-${max}%`, value: { min, max } });
        }
        
        if (criteria.ageMin !== null || criteria.ageMax !== null) {
            const min = criteria.ageMin ?? 18;
            const max = criteria.ageMax ?? 50;
            active.push({ type: 'age', label: `Age: ${min}-${max}`, value: { min, max } });
        }
        
        if (criteria.heightMin !== null && criteria.heightMin > 150 || criteria.heightMax !== null && criteria.heightMax < 215) {
            const min = criteria.heightMin ?? 150;
            const max = criteria.heightMax ?? 215;
            active.push({ type: 'height', label: `Height: ${cmToFeetInches(min)} - ${cmToFeetInches(max)}`, value: { min, max } });
        }
        
        if (criteria.weightMin !== null && criteria.weightMin > 50 || criteria.weightMax !== null && criteria.weightMax < 130) {
            const min = criteria.weightMin ?? 50;
            const max = criteria.weightMax ?? 130;
            active.push({ type: 'weight', label: `Weight: ${kgToLbs(min)} - ${kgToLbs(max)}`, value: { min, max } });
        }
        
        return active;
    },
    
    removeFilter(filterType) {
        switch(filterType) {
            case 'search':
                document.getElementById('search-fighter').value = '';
                break;
            case 'division':
                document.getElementById('filter-division').value = '';
                break;
            case 'stance':
                document.getElementById('filter-stance').value = '';
                break;
            case 'winrate':
                document.getElementById('winrate-min').value = '';
                document.getElementById('winrate-max').value = '';
                break;
            case 'age':
                document.getElementById('age-min').value = '';
                document.getElementById('age-max').value = '';
                break;
            case 'height':
                document.getElementById('height-min').value = 150;
                document.getElementById('height-max').value = 215;
                document.getElementById('height-min-display').textContent = cmToFeetInches(150);
                document.getElementById('height-max-display').textContent = cmToFeetInches(215);
                const heightWrapper = document.getElementById('height-min').parentElement;
                heightWrapper.style.setProperty('--range-start', '0%');
                heightWrapper.style.setProperty('--range-end', '0%');
                break;
            case 'weight':
                document.getElementById('weight-min').value = 50;
                document.getElementById('weight-max').value = 130;
                document.getElementById('weight-min-display').textContent = kgToLbs(50);
                document.getElementById('weight-max-display').textContent = kgToLbs(130);
                const weightWrapper = document.getElementById('weight-min').parentElement;
                weightWrapper.style.setProperty('--range-start', '0%');
                weightWrapper.style.setProperty('--range-end', '0%');
                break;
        }
        this.render();
    },
    
    renderActiveFilters() {
        const container = document.getElementById('active-filters-container');
        const activeFilters = this.getActiveFilters();
        
        if (activeFilters.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        const tagsHtml = activeFilters.map(filter => `
            <span class="filter-tag" data-filter-type="${filter.type}">
                ${filter.label}
                <button class="filter-tag-remove" aria-label="Remove filter">×</button>
            </span>
        `).join('');
        
        container.innerHTML = `
            <div class="active-filters-header">
                <span>Active Filters (${activeFilters.length})</span>
            </div>
            <div class="active-filters-tags">
                ${tagsHtml}
            </div>
        `;
        
        // Add click handlers for remove buttons
        container.querySelectorAll('.filter-tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.closest('.filter-tag').getAttribute('data-filter-type');
                this.removeFilter(filterType);
            });
        });
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
            
            // Render active filters display
            this.renderActiveFilters();
            
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
                    <td style="text-align: center;">
                        <input type="checkbox" 
                               class="fighter-checkbox" 
                               data-fighter-id="${fighter.id}"
                               ${this.selectedFighters.includes(fighter.id) ? 'checked' : ''}
                               title="Select for comparison">
                    </td>
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
            // Handle checkbox clicks
            if (e.target.classList.contains('fighter-checkbox')) {
                e.stopPropagation();
                const fighterId = e.target.getAttribute('data-fighter-id');
                this.toggleFighterSelection(fighterId);
                return;
            }
            
            // Handle button clicks - go to details page
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
            
            // Handle row clicks - toggle checkbox selection
            const row = e.target.closest('tr.fighter-row');
            if (row && !e.target.classList.contains('btn-details') && !e.target.classList.contains('fighter-checkbox')) {
                const fighterId = row.getAttribute('data-fighter-id');
                
                // Toggle the checkbox
                this.toggleFighterSelection(fighterId);
                
                // Visual feedback
                row.style.transition = 'background 0.2s ease';
            }
        });
    }
};